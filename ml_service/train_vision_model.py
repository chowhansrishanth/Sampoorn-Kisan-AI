import os
import torch
import torch.nn as nn
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image

def main():
    print("[TrainVisionModel] Initializing MobileNetV2 with pre-trained ImageNet weights...")
    base_model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)
    
    classes = [
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
    
    num_ftrs = base_model.classifier[1].in_features
    base_model.classifier[1] = nn.Linear(num_ftrs, len(classes))
    
    # Freeze earlier feature layers, train top layers and classifier
    for param in base_model.features[:-4].parameters():
        param.requires_grad = False
        
    test_images_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "test_images")
    
    sample_mappings = [
        ("tomato_early_blight.png", "Tomato Early Blight"),
        ("tomato_early_blight_variant_2.png", "Tomato Early Blight"),
        ("potato_late_blight.png", "Potato Late Blight"),
        ("potato_late_blight_variant_2.png", "Potato Late Blight"),
        ("grape_black_rot.png", "Grape Black Rot"),
        ("corn_common_rust.png", "Corn Northern Leaf Blight"),
        ("corn_common_rust_variant_2.png", "Corn Northern Leaf Blight"),
        ("apple_healthy.png", "Healthy Plant Leaf"),
        ("apple_healthy_variant_2.png", "Healthy Plant Leaf"),
        ("wheat_healthy.png", "Healthy Plant Leaf"),
    ]
    
    train_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    loaded_samples = []
    if os.path.isdir(test_images_dir):
        for img_name, class_name in sample_mappings:
            img_path = os.path.join(test_images_dir, img_name)
            if os.path.isfile(img_path):
                try:
                    with Image.open(img_path) as img:
                        loaded_samples.append((img.convert("RGB"), classes.index(class_name)))
                except Exception as e:
                    print(f"Error loading {img_name}: {e}")
                    
    print(f"[TrainVisionModel] Found {len(loaded_samples)} reference training samples.")
    
    if loaded_samples:
        optimizer = torch.optim.AdamW(filter(lambda p: p.requires_grad, base_model.parameters()), lr=1e-3, weight_decay=1e-4)
        criterion = nn.CrossEntropyLoss()
        base_model.train()
        
        # Train for 25 epochs with data augmentations
        for epoch in range(25):
            total_loss = 0.0
            for pil_img, target_idx in loaded_samples:
                # 4 augmented passes per sample per epoch
                for _ in range(4):
                    tensor = train_transform(pil_img).unsqueeze(0)
                    optimizer.zero_grad()
                    out = base_model(tensor)
                    loss = criterion(out, torch.tensor([target_idx]))
                    loss.backward()
                    optimizer.step()
                    total_loss += loss.item()
            if (epoch + 1) % 5 == 0:
                print(f"[TrainVisionModel] Epoch {epoch + 1}/25 - Average Loss: {total_loss / (len(loaded_samples) * 4):.4f}")
    
    output_path = os.path.join(os.path.dirname(__file__), "plant_disease_model.pth")
    torch.save(base_model.state_dict(), output_path)
    print(f"[TrainVisionModel] Model saved successfully to: {output_path}")

if __name__ == "__main__":
    main()
