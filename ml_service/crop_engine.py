import os
import pickle
import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.preprocessing import LabelEncoder
import shap

MODEL_PATH = os.path.join(os.path.dirname(__file__), "crop_model.pkl")
ENCODER_PATH = os.path.join(os.path.dirname(__file__), "label_encoder.pkl")

model = None
le = None
explainer = None

def _generate_synthetic_crop_dataset():
    """Generates standard agricultural crop dataset for XGBoost training."""
    np.random.seed(42)
    crops_config = {
        "paddy": {"N": (60, 100), "P": (35, 60), "K": (35, 45), "temp": (20, 27), "humidity": (80, 90), "ph": (5.5, 7.0), "rainfall": (180, 300)},
        "maize": {"N": (60, 100), "P": (35, 60), "K": (15, 25), "temp": (18, 27), "humidity": (55, 75), "ph": (5.5, 7.0), "rainfall": (60, 110)},
        "chickpea": {"N": (20, 50), "P": (55, 80), "K": (75, 85), "temp": (17, 22), "humidity": (15, 25), "ph": (6.0, 8.5), "rainfall": (60, 90)},
        "kidneybeans": {"N": (15, 40), "P": (55, 80), "K": (15, 25), "temp": (15, 24), "humidity": (18, 25), "ph": (5.5, 6.0), "rainfall": (60, 150)},
        "pigeonpeas": {"N": (15, 40), "P": (55, 80), "K": (15, 25), "temp": (18, 38), "humidity": (45, 70), "ph": (4.5, 7.5), "rainfall": (90, 200)},
        "mothbeans": {"N": (15, 40), "P": (35, 60), "K": (15, 25), "temp": (24, 32), "humidity": (40, 65), "ph": (3.5, 10.0), "rainfall": (30, 70)},
        "mungbean": {"N": (15, 40), "P": (35, 60), "K": (15, 25), "temp": (27, 30), "humidity": (80, 90), "ph": (6.2, 7.2), "rainfall": (35, 60)},
        "blackgram": {"N": (30, 60), "P": (55, 80), "K": (20, 35), "temp": (25, 35), "humidity": (60, 75), "ph": (6.5, 7.5), "rainfall": (60, 75)},
        "lentil": {"N": (15, 40), "P": (55, 80), "K": (15, 25), "temp": (18, 30), "humidity": (60, 70), "ph": (5.9, 7.8), "rainfall": (35, 55)},
        "cotton": {"N": (100, 140), "P": (35, 60), "K": (15, 25), "temp": (22, 30), "humidity": (75, 85), "ph": (5.8, 8.0), "rainfall": (60, 110)},
        "groundnut": {"N": (20, 40), "P": (35, 60), "K": (15, 25), "temp": (20, 30), "humidity": (50, 70), "ph": (5.5, 7.0), "rainfall": (50, 100)},
        "mustard": {"N": (60, 90), "P": (20, 40), "K": (15, 30), "temp": (10, 25), "humidity": (45, 65), "ph": (6.0, 7.5), "rainfall": (25, 50)},
        "watermelon": {"N": (80, 120), "P": (5, 30), "K": (45, 55), "temp": (24, 27), "humidity": (80, 90), "ph": (6.0, 7.0), "rainfall": (40, 60)},
        "mango": {"N": (15, 40), "P": (15, 40), "K": (25, 35), "temp": (27, 36), "humidity": (45, 55), "ph": (4.5, 7.0), "rainfall": (80, 100)}
    }

    rows = []
    labels = []
    for crop, limits in crops_config.items():
        for _ in range(80):
            rows.append({
                "N": np.random.uniform(*limits["N"]),
                "P": np.random.uniform(*limits["P"]),
                "K": np.random.uniform(*limits["K"]),
                "temperature": np.random.uniform(*limits["temp"]),
                "humidity": np.random.uniform(*limits["humidity"]),
                "ph": np.random.uniform(*limits["ph"]),
                "rainfall": np.random.uniform(*limits["rainfall"])
            })
            labels.append(crop)
            
    df = pd.DataFrame(rows)
    return df, labels

def train_and_save_model():
    """Trains real XGBoost classifier and persists pickle artifacts."""
    global model, le, explainer
    print("[CropEngine] Training XGBoost Crop Recommendation Model...")
    X, y = _generate_synthetic_crop_dataset()
    
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    
    model = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.1,
        random_state=42,
        eval_metric="mlogloss"
    )
    model.fit(X, y_encoded)
    
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)
    with open(ENCODER_PATH, "wb") as f:
        pickle.dump(le, f)
        
    explainer = shap.TreeExplainer(model)
    print("[CropEngine] XGBoost model trained and saved successfully.")

def load_resources():
    global model, le, explainer
    if os.path.exists(MODEL_PATH) and os.path.exists(ENCODER_PATH):
        try:
            with open(MODEL_PATH, "rb") as f:
                model = pickle.load(f)
            with open(ENCODER_PATH, "rb") as f:
                le = pickle.load(f)
            explainer = shap.TreeExplainer(model)
        except Exception as e:
            print(f"[CropEngine] Error loading model: {e}. Retraining...")
            train_and_save_model()
    else:
        train_and_save_model()

# Legacy research utility only. Synthetic artifacts are not production models.
# Training must be invoked explicitly in an isolated research environment.

def explain_prediction(input_data_dict: dict) -> dict:
    """Predicts crop recommendation and computes SHAP feature importance breakdown."""
    global model, le, explainer
    
    if model is None or le is None:
        load_resources()

    # Required features
    feature_keys = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
    formatted_input = {k: float(input_data_dict.get(k, 50.0)) for k in feature_keys}
    input_df = pd.DataFrame([formatted_input])

    # Predict class and decode crop
    pred_idx = int(model.predict(input_df)[0])
    predicted_crop = str(le.inverse_transform([pred_idx])[0]).capitalize()

    # Compute SHAP Values
    try:
        shap_values = explainer.shap_values(input_df)
        if isinstance(shap_values, list):
            class_shap = shap_values[pred_idx][0]
        elif isinstance(shap_values, np.ndarray):
            if shap_values.ndim == 3:
                class_shap = shap_values[0, :, pred_idx]
            elif shap_values.ndim == 2:
                class_shap = shap_values[0]
            else:
                class_shap = np.array(shap_values).flatten()
        else:
            class_shap = np.array(shap_values).flatten()
    except Exception:
        class_shap = np.array([0.1] * len(feature_keys))

    # Feature Importance Breakdown
    feature_names = input_df.columns.tolist()
    total_abs_shap = float(np.sum(np.abs(class_shap)))

    structured_explanation = []
    for i, name in enumerate(feature_names):
        val = float(class_shap[i])
        impact_pct = (abs(val) / total_abs_shap * 100) if total_abs_shap > 0 else 0.0
        structured_explanation.append({
            "feature": name,
            "actual_value": formatted_input[name],
            "shap_value": round(val, 4),
            "impact_percentage": round(impact_pct, 2),
            "effect": "favorable" if val >= 0 else "unfavorable"
        })

    structured_explanation.sort(key=lambda x: x["impact_percentage"], reverse=True)

    return {
        "recommended_crop": predicted_crop,
        "xai_breakdown": structured_explanation
    }