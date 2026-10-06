"""
========================================================================================
Sampoorn Kisan AI — Core ML Crop Recommendation Engine (`ml_engine.py`)
========================================================================================

PURPOSE:
Provides low-latency, thread-safe inference for agronomic crop suitability prediction
using serialized Scikit-learn / XGBoost model artifacts (`crop_model.pkl`).

========================================================================================
MATHEMATICAL FOUNDATIONS & PROBABILITY AXIOMS:
========================================================================================

1. 7-DIMENSIONAL AGRONOMIC INPUT FEATURE VECTOR:
   Each agricultural query is represented as a feature vector x in R^7:
       x = [ x_N,  x_P,  x_K,  x_temp,  x_humidity,  x_ph,  x_rainfall ]
   Where:
       - x_N, x_P, x_K: Macronutrient concentrations in soil (kg/hectare)
       - x_temp: Ambient air temperature (degrees Celsius)
       - x_humidity: Relative atmospheric humidity (%)
       - x_ph: Soil chemical pH (-log_10 [H+], ranging 3.5 to 9.5)
       - x_rainfall: Seasonal cumulative rainfall (mm)

2. MULTI-CLASS PROBABILITY AXIOMS (Kolmogorov Axioms):
   The model outputs a posterior probability distribution p = [p_0, p_1, ..., p_{K-1}]
   over K candidate crops satisfying:
       a. Non-negativity:      p_k >= 0,           for all k in {0, ..., K-1}
       b. Upper-bounded:       p_k <= 1,           for all k in {0, ..., K-1}
       c. Unitarity (Sum = 1): sum_{k=0}^{K-1} p_k = 1  (verified within numerical tolerance atol = 0.01)

3. BAYES OPTIMAL CLASSIFICATION DECISION RULE:
   The recommended crop index k_hat is selected using the Maximum A Posteriori (MAP) criterion:
       k_hat = argmax_{k in {0, ..., K-1}} P(Y = k | x)
   The predicted crop label is mapped via the inverse label encoder:
       Crop_Predicted = LabelEncoder^{-1}(k_hat)
========================================================================================
"""

import os
import threading
import numpy as np
from fastapi import HTTPException
from pathlib import Path


class CropRecommendationEngine:
    """
    Thread-safe ML Crop Recommendation inference engine.
    Loads trained scikit-learn / XGBoost estimators from disk
    and evaluates incoming soil/weather feature vectors.
    """
    def __init__(self):
        self.model = None
        self.status = 'NOT_CONFIGURED'
        self.label_encoder = None
        self.labels = None
        self.lock = threading.Lock()

    def load(self):
        """
        Loads and validates model artifacts from disk.
        Ensures model has predict_proba method, expects 7 features,
        and includes valid target class names.
        """
        with self.lock:
            # If already loaded in memory, reuse existing model
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
                
                # Check for accompanying LabelEncoder
                encoder_path = os.environ.get('CROP_LABEL_ENCODER_PATH') or str(Path(__file__).with_name('label_encoder.pkl'))
                encoder = None
                if os.path.isfile(encoder_path):
                    encoder = joblib.load(encoder_path)
                
                if encoder is not None and hasattr(encoder, 'classes_') and len(encoder.classes_) == len(labels):
                    labels = [str(label) for label in encoder.classes_]
                elif not all(isinstance(c, str) and c.strip() for c in labels):
                    self.status = 'INVALID_LABELS'
                    return

                # Validation checks:
                # 1. Model must expose callable predict_proba
                # 2. Input dimension must be exactly 7 features
                # 3. Must classify at least 2 distinct crops
                if not callable(getattr(candidate, 'predict_proba', None)) or getattr(candidate, 'n_features_in_', None) != 7 or len(labels) < 2:
                    self.status = 'INVALID'
                    return

                self.model = candidate
                self.label_encoder = encoder
                self.labels = labels
                self.status = 'READY'
            except Exception:
                self.status = 'LOAD_FAILED'

    def predict_crop(self, data: dict) -> dict:
        """
        Evaluates input features [N, P, K, temperature, humidity, ph, rainfall]
        and returns the top recommended crop and confidence score.
        """
        self.load()
        if self.status != 'READY':
            raise HTTPException(503, detail='EXTERNAL MODEL CHECKPOINT REQUIRED: ' + self.status)

        try:
            # Step 1: Construct 1x7 feature array in canonical column order
            feature_order = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
            features = np.array([[data[k] for k in feature_order]], dtype=float)

            # Step 2: Ensure all values are finite real numbers (no NaN or inf)
            if not np.isfinite(features).all():
                raise ValueError('Invalid features: NaN or Infinite values detected')

            # Step 3: Compute class probabilities via model.predict_proba
            probabilities = self.model.predict_proba(features)[0]

            # Step 4: Validate probability distribution axioms:
            # - Length equals number of classes
            # - All elements are finite real numbers
            # - No negative probabilities: p_k >= 0
            # - Probabilities bounded by 1: p_k <= 1
            # - Sum equals 1: sum(p_k) approx 1.0 (tolerance 0.01)
            if (len(probabilities) != len(self.model.classes_) or 
                not np.isfinite(probabilities).all() or 
                (probabilities < 0).any() or 
                (probabilities > 1).any() or 
                not np.isclose(probabilities.sum(), 1, atol=0.01)):
                raise ValueError('Invalid model output probability distribution')

            # Step 5: Maximum A Posteriori (MAP) decision index
            index = int(np.argmax(probabilities))

            return {
                'recommended_crop': self.labels[index],
                'confidence': float(probabilities[index]),
                'confidence_type': 'uncalibrated model probability',
                'is_trained_model': True,
                'is_label_encoded': self.label_encoder is not None,
                'shap_explanation': None,
                'lime_explanation': [],
                'explanation_status': 'No validated explainer is configured.'
            }
        except Exception:
            raise HTTPException(503, detail='Crop inference failed. No recommendation was generated.')

    def predict_yield(self, **kwargs):
        """Yield prediction placeholder requiring dedicated calibrated yield model."""
        raise HTTPException(503, detail='A validated yield model is not configured.')


# Singleton instance shared across FastAPI route handlers
crop_engine = CropRecommendationEngine()
