"""Configured crop inference only; no synthetic training at startup."""
import os
import threading
import numpy as np
from fastapi import HTTPException
from pathlib import Path
class CropRecommendationEngine:
    def __init__(self):
        self.model = None
        self.status = 'NOT_CONFIGURED'
        self.label_encoder = None
        self.labels = None
        self.lock = threading.Lock()
    def load(self):
        with self.lock:
            if self.model is not None:
                return
            path = os.environ.get('CROP_MODEL_PATH') or str(Path(__file__).with_name('crop_model.pkl'))
            if not path:
                self.status = 'NOT_CONFIGURED'
                return
            if not os.path.isfile(path):
                self.status = 'INVALID'
                return
            try:
                import joblib
                candidate = joblib.load(path)
                labels = list(getattr(candidate, 'classes_', []))
                encoder_path = os.environ.get('CROP_LABEL_ENCODER_PATH') or str(Path(__file__).with_name('label_encoder.pkl'))
                encoder = None
                if os.path.isfile(encoder_path):
                    encoder = joblib.load(encoder_path)
                if encoder is not None and hasattr(encoder, 'classes_') and len(encoder.classes_) == len(labels):
                    labels = [str(label) for label in encoder.classes_]
                elif not all(isinstance(c, str) and c.strip() for c in labels):
                    self.status = 'INVALID_LABELS'
                    return
                if not callable(getattr(candidate, 'predict_proba', None)) or getattr(candidate, 'n_features_in_', None) != 7 or len(labels) < 2:
                    self.status = 'INVALID'
                    return
                self.model = candidate
                self.label_encoder = encoder
                self.labels = labels
                self.status = 'READY'
            except Exception:
                self.status = 'LOAD_FAILED'
    def predict_crop(self, data):
        self.load()
        if self.status != 'READY':
            raise HTTPException(503, detail='EXTERNAL MODEL CHECKPOINT REQUIRED: ' + self.status)
        try:
            features = np.array([[data[k] for k in ['N','P','K','temperature','humidity','ph','rainfall']]], dtype=float)
            if not np.isfinite(features).all():
                raise ValueError('Invalid features')
            probabilities = self.model.predict_proba(features)[0]
            if len(probabilities) != len(self.model.classes_) or not np.isfinite(probabilities).all() or (probabilities < 0).any() or (probabilities > 1).any() or not np.isclose(probabilities.sum(), 1, atol=0.01):
                raise ValueError('Invalid model output')
            index = int(np.argmax(probabilities))
            return {'recommended_crop': self.labels[index], 'confidence':float(probabilities[index]),'confidence_type':'uncalibrated model probability','is_trained_model':True,'is_label_encoded': self.label_encoder is not None,'shap_explanation':None,'lime_explanation':[],'explanation_status':'No validated explainer is configured.'}
        except Exception:
            raise HTTPException(503, detail='Crop inference failed. No recommendation was generated.')
    def predict_yield(self, **kwargs):
        raise HTTPException(503, detail='A validated yield model is not configured.')
crop_engine = CropRecommendationEngine()
