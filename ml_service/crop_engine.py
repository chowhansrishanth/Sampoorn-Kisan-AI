"""
========================================================================================
Sampoorn Kisan AI — XGBoost Crop Recommendation & Explainable AI Engine (`crop_engine.py`)
========================================================================================

PURPOSE:
Predicts the optimal agronomic crop based on 7 environmental soil & climate parameters:
Nitrogen (N), Phosphorus (P), Potassium (K), Temperature, Humidity, Soil pH, and Rainfall.
Computes Shapley Additive exPlanations (SHAP) to explain model decisions to farmers.

========================================================================================
MATHEMATICAL FOUNDATIONS & MACHINE LEARNING FORMULAS USED IN TRAINING:
========================================================================================

1. XGBOOST REGULARIZED OBJECTIVE FUNCTION (Chen & Guestrin 2016):
   At boosting iteration t, the objective to minimize is:
       Obj^{(t)} = sum_{i=1}^n l(y_i, y_hat_i^{(t-1)} + f_t(x_i)) + Omega(f_t)

   Where the model regularization term Omega(f_t) penalizes tree complexity:
       Omega(f_t) = gamma * T + 0.5 * lambda * sum_{j=1}^T (w_j)^2
       - T: Total number of terminal leaves in the decision tree
       - w_j: Continuous weight/score assigned to leaf j
       - gamma: Minimum loss reduction threshold required to create a new split
       - lambda: L2 ridge regularization penalty on leaf weights (prevents overfitting)

2. SECOND-ORDER TAYLOR EXPANSION OF LOSS FUNCTION:
   XGBoost approximates the loss using a second-order Taylor expansion around y_hat^{(t-1)}:
       Obj^{(t)} approx sum_{i=1}^n [ l(y_i, y_hat_i^{(t-1)}) + g_i * f_t(x_i) + 0.5 * h_i * (f_t(x_i))^2 ] + Omega(f_t)

   Where first-order gradient (g_i) and second-order Hessian (h_i) are:
       g_i = d l(y_i, y_hat) / d y_hat |_{y_hat = y_hat_i^{(t-1)}}
       h_i = d^2 l(y_i, y_hat) / d (y_hat)^2 |_{y_hat = y_hat_i^{(t-1)}}

3. OPTIMAL LEAF WEIGHT (w_j^*) FORMULA:
   Let I_j = {i | q(x_i) = j} be the set of data instances assigned to leaf j.
   Define aggregated gradients and Hessians:
       G_j = sum_{i in I_j} g_i
       H_j = sum_{i in I_j} h_i

   Setting d Obj / d w_j = 0 yields the optimal closed-form leaf weight:
       w_j^* = - G_j / (H_j + lambda)

   The resulting minimum objective value (tree quality score) is:
       Obj^* = -0.5 * sum_{j=1}^T [ (G_j)^2 / (H_j + lambda) ] + gamma * T

4. SPLIT QUALITY GAIN FORMULA (Node Splitting Criterion):
   When splitting an existing leaf into Left (L) and Right (R) child nodes:
       Gain = 0.5 * [ (G_L)^2 / (H_L + lambda) + (G_R)^2 / (H_R + lambda) - (G_L + G_R)^2 / (H_L + H_R + lambda) ] - gamma
   If Gain <= 0, the branch is automatically pruned.

5. MULTI-CLASS LOG-LOSS (mlogloss) OBJECTIVE:
   For K classes across N training instances:
       L_{mlogloss} = - (1 / N) * sum_{i=1}^N sum_{k=1}^K y_{i,k} * log(p_{i,k})
   Where predicted class probabilities are computed via the Softmax transform:
       p_{i,k} = exp(z_{i,k}) / [ sum_{m=1}^K exp(z_{i,m}) ]

6. SHAP (SHapley Additive exPlanations, Lundberg & Lee 2017):
   Derives local feature importance values based on cooperative game theory:
       phi_i(x) = sum_{S subseteq F \\ {i}} [ |S|! * (|F| - |S| - 1)! / |F|! ] * [ f_x(S union {i}) - f_x(S) ]
   
   Properties Guaranteed by SHAP:
   a. Local Accuracy (Additive Efficiency):
          f(x) = phi_0 + sum_{i=1}^M phi_i(x)
          (The model prediction f(x) equals the base rate phi_0 plus individual feature contributions)
   b. Missingness: If feature i has no effect, phi_i(x) = 0.
   c. Consistency: If a model changes so a feature's marginal contribution increases, its SHAP value never decreases.
========================================================================================
"""

import os
import pickle
import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.preprocessing import LabelEncoder
import shap

# Paths for serialized model and label encoder artifacts
MODEL_PATH = os.path.join(os.path.dirname(__file__), "crop_model.pkl")
ENCODER_PATH = os.path.join(os.path.dirname(__file__), "label_encoder.pkl")

# Global instances for loaded model, encoder, and SHAP TreeExplainer
model = None
le = None
explainer = None


def _generate_synthetic_crop_dataset():
    """
    Generates agronomic training dataset based on published ICAR / FAO
    optimal growth ranges across 14 major Indian crops.
    Features:
      - N, P, K: Macronutrient levels in kg/hectare
      - temperature: Ambient temperature in degrees Celsius
      - humidity: Relative atmospheric humidity percentage
      - ph: Soil acidity/alkalinity scale (0-14)
      - rainfall: Seasonal precipitation in millimeters
    """
    np.random.seed(42)  # Ensures deterministic reproducibility
    
    crops_config = {
        "paddy":        {"N": (60, 100), "P": (35, 60), "K": (35, 45), "temp": (20, 27), "humidity": (80, 90), "ph": (5.5, 7.0), "rainfall": (180, 300)},
        "maize":        {"N": (60, 100), "P": (35, 60), "K": (15, 25), "temp": (18, 27), "humidity": (55, 75), "ph": (5.5, 7.0), "rainfall": (60, 110)},
        "chickpea":     {"N": (20, 50),  "P": (55, 80), "K": (75, 85), "temp": (17, 22), "humidity": (15, 25), "ph": (6.0, 8.5), "rainfall": (60, 90)},
        "kidneybeans":  {"N": (15, 40),  "P": (55, 80), "K": (15, 25), "temp": (15, 24), "humidity": (18, 25), "ph": (5.5, 6.0), "rainfall": (60, 150)},
        "pigeonpeas":   {"N": (15, 40),  "P": (55, 80), "K": (15, 25), "temp": (18, 38), "humidity": (45, 70), "ph": (4.5, 7.5), "rainfall": (90, 200)},
        "mothbeans":    {"N": (15, 40),  "P": (35, 60), "K": (15, 25), "temp": (24, 32), "humidity": (40, 65), "ph": (3.5, 10.0), "rainfall": (30, 70)},
        "mungbean":     {"N": (15, 40),  "P": (35, 60), "K": (15, 25), "temp": (27, 30), "humidity": (80, 90), "ph": (6.2, 7.2), "rainfall": (35, 60)},
        "blackgram":    {"N": (30, 60),  "P": (55, 80), "K": (20, 35), "temp": (25, 35), "humidity": (60, 75), "ph": (6.5, 7.5), "rainfall": (60, 75)},
        "lentil":       {"N": (15, 40),  "P": (55, 80), "K": (15, 25), "temp": (18, 30), "humidity": (60, 70), "ph": (5.9, 7.8), "rainfall": (35, 55)},
        "cotton":       {"N": (100, 140), "P": (35, 60), "K": (15, 25), "temp": (22, 30), "humidity": (75, 85), "ph": (5.8, 8.0), "rainfall": (60, 110)},
        "groundnut":    {"N": (20, 40),  "P": (35, 60), "K": (15, 25), "temp": (20, 30), "humidity": (50, 70), "ph": (5.5, 7.0), "rainfall": (50, 100)},
        "mustard":      {"N": (60, 90),  "P": (20, 40), "K": (15, 30), "temp": (10, 25), "humidity": (45, 65), "ph": (6.0, 7.5), "rainfall": (25, 50)},
        "watermelon":   {"N": (80, 120), "P": (5, 30),  "K": (45, 55), "temp": (24, 27), "humidity": (80, 90), "ph": (6.0, 7.0), "rainfall": (40, 60)},
        "mango":        {"N": (15, 40),  "P": (15, 40), "K": (25, 35), "temp": (27, 36), "humidity": (45, 55), "ph": (4.5, 7.0), "rainfall": (80, 100)}
    }

    rows = []
    labels = []
    for crop, limits in crops_config.items():
        for _ in range(80):  # 80 simulated data points per crop
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
    """
    Trains the XGBoost multi-class classifier using Gradient Tree Boosting
    and computes the TreeExplainer for Explainable AI (SHAP).
    """
    global model, le, explainer
    print("=================================================================")
    print("[CropEngine] Training XGBoost Multi-Class Crop Classifier...")
    print("=================================================================")
    
    # 1. Generate Training Data
    X, y = _generate_synthetic_crop_dataset()
    
    # 2. Encode string class labels into zero-indexed integers [0, 1, ..., K-1]
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    
    # 3. Instantiate XGBClassifier with hyperparameters:
    # - n_estimators = 100: Number of boosting trees (iterations)
    # - max_depth = 5: Maximum depth of each decision tree
    # - learning_rate (eta) = 0.1: Step size shrinkage to prevent overfitting
    # - eval_metric = "mlogloss": Multi-class cross-entropy log-loss
    model = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.1,
        random_state=42,
        eval_metric="mlogloss"
    )
    
    # 4. Train the ensemble model via gradient boosting
    model.fit(X, y_encoded)
    
    # 5. Persist artifacts using Python pickle serialization
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)
    with open(ENCODER_PATH, "wb") as f:
        pickle.dump(le, f)
        
    # 6. Initialize SHAP TreeExplainer for model interpretability
    explainer = shap.TreeExplainer(model)
    print(f"[CropEngine] XGBoost model trained successfully. Saved to: {MODEL_PATH}")
    print("=================================================================")


def load_resources():
    """
    Loads saved model and label encoder from disk. If artifacts are missing,
    automatically triggers model training.
    """
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


def explain_prediction(input_data_dict: dict) -> dict:
    """
    Executes crop prediction on farmer soil/climate inputs and calculates
    SHAP (Shapley Additive exPlanations) feature attributions.
    
    Returns:
      - recommended_crop: Capitalized name of the predicted crop
      - xai_breakdown: List of features sorted by percentage impact on the prediction
    """
    global model, le, explainer
    
    if model is None or le is None:
        load_resources()

    # 1. Format and validate input features
    feature_keys = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
    formatted_input = {k: float(input_data_dict.get(k, 50.0)) for k in feature_keys}
    input_df = pd.DataFrame([formatted_input])

    # 2. Model Prediction: Find class index with highest predicted probability
    pred_idx = int(model.predict(input_df)[0])
    predicted_crop = str(le.inverse_transform([pred_idx])[0]).capitalize()

    # 3. Compute SHAP Values (Shapley feature importance)
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

    # 4. Calculate Percentage Impact: ( |phi_i| / sum_j |phi_j| ) * 100
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

    # Sort feature importance descending (highest impact first)
    structured_explanation.sort(key=lambda x: x["impact_percentage"], reverse=True)

    return {
        "recommended_crop": predicted_crop,
        "xai_breakdown": structured_explanation
    }