import os
import threading
import io
import base64
import torch
import torch.nn as nn
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
import numpy as np

class PyTorchGradCAMVisionEngine:
    """
    Computer Vision Engine using PyTorch MobileNetV2 architecture.
    Computes real Grad-CAM activation heatmaps via backward layer gradients on target feature maps.
    Automatically utilizes CUDA GPU if available, with CPU fallback.
    """
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"[VisionEngine] Initializing PyTorch Vision Engine on device: {self.device}")
        
        # Load MobileNetV2 architecture
        self.model = models.mobilenet_v2(weights=None)
        # 10 plant disease classes
        self.classes = [
            "Tomato Early Blight",
            "Tomato Late Blight",
            "Potato Late Blight",
            "Corn Northern Leaf Blight",
            "Apple Black Rot",
            "Grape Black Rot",
            "Pepper Bacterial Spot",
            "Rice Brown Spot",
            "Cotton Pink Bollworm Damage",
            "Healthy Plant Leaf"
        ]
        num_ftrs = self.model.classifier[1].in_features
        self.model.classifier[1] = nn.Linear(num_ftrs, len(self.classes))
        self.ready = False
        self.status = "NOT_CONFIGURED"
        self.inference_lock = threading.Lock()
        weights_path = os.environ.get("VISION_MODEL_PATH") or os.path.join(os.path.dirname(__file__), "plant_disease_model.pth")
        if weights_path and os.path.isfile(weights_path):
            self.status = "INVALID" if not os.path.isfile(weights_path) else "LOAD_FAILED"
            try:
                state = torch.load(weights_path, map_location="cpu", weights_only=True)
                self.model.load_state_dict(state, strict=True)
                self.ready = True
                self.status = "READY"
            except Exception:
                print("[VisionEngine] Configured model weights could not be loaded.")
        self.model.to(self.device)
        self.model.eval()

        # Target layer for Grad-CAM
        self.target_layer = self.model.features[-1]
        self.gradients = None
        self.activations = None

        # Register forward and backward hooks for Grad-CAM
        self.target_layer.register_forward_hook(self._forward_hook)
        self.target_layer.register_full_backward_hook(self._backward_hook)

        # Image Preprocessing Transform
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

        # Knowledge Base for Remedies
        self.remedies = {
            "Tomato Early Blight": {
                "severity": "Moderate (Stage 2)",
                "symptoms": "Concentric dark rings (bullseye pattern) on lower older leaves with yellow halo.",
                "remedy": "Apply Mancozeb 75% WP @ 2.5g/L water (500g/acre) OR Copper Oxychloride 50% WP @ 3.0g/L.",
                "organic": "Neem oil spray (10,000 PPM @ 5ml/L water) mixed with mild liquid soap."
            },
            "Potato Late Blight": {
                "severity": "High (Stage 3)",
                "symptoms": "Water-soaked dark lesions on leaf tips and stems with white mold underneath.",
                "remedy": "Spray Cymoxanil + Mancozeb @ 2.0g/L water immediately.",
                "organic": "Trichoderma viride bio-fungicide soil drenching."
            },
            "Corn Northern Leaf Blight": {
                "severity": "Mild (Stage 1)",
                "symptoms": "Long, elliptical grayish-green tan lesions parallel to leaf veins.",
                "remedy": "Foliar spray of Azoxystrobin + Difenoconazole @ 1.0ml/L water.",
                "organic": "Crop rotation with leguminous crops and Trichoderma seed treatment."
            },
            "Default": {
                "severity": "Stage 1 Detected",
                "symptoms": "Foliar lesions / leaf spot discoloration detected by CNN vision model.",
                "remedy": "Spray Chlorantraniliprole 18.5% SC @ 0.4ml/L OR Mancozeb 75% WP @ 2.5g/L.",
                "organic": "Spray Neem Oil 10,000 PPM @ 5ml/L water."
            }
        }

    def _forward_hook(self, module, input, output):
        self.activations = output

    def _backward_hook(self, module, grad_in, grad_out):
        self.gradients = grad_out[0]

    def compute_gradcam_overlay(self, input_tensor, pil_img, target_class_idx):
        """Computes real Grad-CAM heatmap tensor gradients and overlays onto PIL image."""
        try:
            self.model.zero_grad()
            output = self.model(input_tensor)
            score = output[0, target_class_idx]
            score.backward()

            # Compute weights from gradients
            gradients = self.gradients.data.cpu().numpy()[0]
            activations = self.activations.data.cpu().numpy()[0]
            weights = np.mean(gradients, axis=(1, 2))

            cam = np.zeros(activations.shape[1:], dtype=np.float32)
            for i, w in enumerate(weights):
                cam += w * activations[i, :, :]

            cam = np.maximum(cam, 0)
            if np.max(cam) > 0:
                cam = cam / np.max(cam)

            # Resize CAM to image size (224, 224)
            cam_img = Image.fromarray((cam * 255).astype(np.uint8)).resize(pil_img.size, Image.Resampling.BILINEAR if hasattr(Image, 'Resampling') else Image.BILINEAR)
            cam_arr = np.array(cam_img) / 255.0

            # Create Heatmap RGB Overlay (Red-Yellow)
            orig_np = np.array(pil_img.convert("RGB"))
            heatmap = np.zeros_like(orig_np, dtype=np.float32)
            heatmap[:, :, 0] = cam_arr * 255.0  # Red channel
            heatmap[:, :, 1] = cam_arr * 160.0  # Green channel

            overlay = np.clip(orig_np * 0.5 + heatmap * 0.5, 0, 255).astype(np.uint8)

            # Convert back to PIL & Base64 Data URI
            buffered = io.BytesIO()
            Image.fromarray(overlay).save(buffered, format="JPEG", quality=90)
            img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
            return f"data:image/jpeg;base64,{img_str}"
        finally:
            self.model.zero_grad()
            self.gradients = None
            self.activations = None

    def diagnose_image(self, image_bytes: bytes = None, filename: str = "leaf.jpg"):
        from fastapi import HTTPException
        if not self.ready:
            raise HTTPException(status_code=503, detail="A validated disease model checkpoint must be configured.")
        if not image_bytes or len(image_bytes) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="A valid image of at most 10 MB is required.")
        try:
            with Image.open(io.BytesIO(image_bytes)) as image:
                if image.width * image.height > 20_000_000:
                    raise ValueError("Image dimensions are too large")
                image.load()
                pil_img = image.convert("RGB").resize((224, 224))
        except Exception:
            raise HTTPException(status_code=400, detail="The uploaded image cannot be decoded.")
        with self.inference_lock:
            try:
                input_tensor = self.transform(pil_img).unsqueeze(0).to(self.device)
                with torch.no_grad():
                    probabilities = torch.softmax(self.model(input_tensor), dim=1)
                    confidence, predicted = probabilities.max(dim=1)
                target_idx = int(predicted.item())
                heatmap = self.compute_gradcam_overlay(input_tensor, pil_img, target_idx)
                return {
                    "disease_name": self.classes[target_idx],
                    "affected_crop": self.classes[target_idx].split()[0],
                    "confidence_score": float(confidence.item()),
                    "confidence_note": "Model probability; calibration and field validation are required.",
                    "is_real_pytorch_inference": True,
                    "device_used": str(self.device),
                    "xai_gradcam": {"heatmap_image_url": heatmap, "explanation": "Gradient-based model activation map; not proof of diagnosis."}
                }
            except Exception:
                raise HTTPException(status_code=503, detail="Vision inference failed. No diagnosis was generated.")

vision_engine = PyTorchGradCAMVisionEngine()
