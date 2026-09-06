"""
CraftLedger ML Service: Profitability Risk Prediction Model
Trains an ensemble model to predict profitability degradation risk,
margin compression, and financial hazard scores from transactional features.
"""

import os
import sys
import numpy as np
import pandas as pd

# Safe imports for joblib and scikit-learn
try:
    import joblib
except ImportError:
    from sklearn.utils import _joblib as joblib

from sklearn.ensemble import RandomForestRegressor, GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score, accuracy_score
from sklearn.preprocessing import StandardScaler

# Safe import for XGBoost with fallback
try:
    # pyrefly: ignore [missing-import]
    import xgboost as xgb
    # pyrefly: ignore [missing-import]
    from xgboost import XGBRegressor
    XGB_AVAILABLE = True
except ImportError:
    xgb = None
    XGBRegressor = None
    XGB_AVAILABLE = False


def generate_synthetic_profitability_dataset(n_samples=2500, random_state=42):
    """
    Generates realistic manufacturing & architectural craft business transactional data.
    Features reflect real-world cost structures, discount practices, and customer behaviors.
    """
    np.random.seed(random_state)

    # 1. Discount rate applied (0% to 30%)
    discount_rate = np.random.beta(a=1.5, b=5.0, size=n_samples) * 30.0

    # 2. Base cost to selling price ratio (e.g. 45% to 85%)
    cost_to_price_ratio = np.random.uniform(0.45, 0.85, size=n_samples)

    # 3. Order volume (units ordered)
    order_volume = np.random.randint(1, 30, size=n_samples)

    # 4. Order value (₹15,000 to ₹10,00,000)
    order_value = np.random.exponential(scale=120000, size=n_samples) + 15000

    # 5. Customer payment delay history (days)
    payment_delay_days = np.random.negative_binomial(n=2, p=0.08, size=n_samples)
    payment_delay_days = np.clip(payment_delay_days, 0, 90)

    # 6. Material cost inflation factor (-5% to +25%)
    material_cost_inflation = np.random.normal(loc=6.0, scale=7.0, size=n_samples)
    material_cost_inflation = np.clip(material_cost_inflation, -5.0, 30.0)

    # 7. Inventory holding duration before sale (days)
    inventory_holding_days = np.random.exponential(scale=45, size=n_samples) + 5
    inventory_holding_days = np.clip(inventory_holding_days, 5, 180)

    # Calculate Effective Gross Margin %
    # Base margin = (1 - cost_to_price_ratio) * 100
    # Discount cuts directly into bottom line margin
    # Material inflation increases replacement inventory cost
    # Holding cost eats ~18% annual inventory carry cost
    base_margin = (1.0 - cost_to_price_ratio) * 100.0
    margin_erosion_discount = discount_rate * 1.25
    margin_erosion_inflation = (material_cost_inflation / 100.0) * cost_to_price_ratio * 100.0
    holding_cost_drag = (inventory_holding_days / 365.0) * 18.0 * cost_to_price_ratio

    effective_margin = base_margin - margin_erosion_discount - margin_erosion_inflation - holding_cost_drag
    effective_margin += np.random.normal(0, 1.0, size=n_samples)
    effective_margin = np.clip(effective_margin, -15.0, 52.0)

    # Profitability Hazard / Risk Score (0 to 100):
    # Benchmark manufacturing overhead (rent, utilities, payroll, freight) is ~24% of revenue.
    # At 42%+ effective margin -> EBITDA healthy (> 18%) -> Low Risk (Score: 5 - 34)
    # At 25% - 35% effective margin -> EBITDA compressed (1 - 10%) -> Moderate Risk (Score: 35 - 64)
    # At < 24% effective margin -> EBITDA breakeven or loss -> High Risk (Score: 65 - 100)
    risk_score = 65.0 + (24.0 - effective_margin) * 2.3

    # Penalty for policy breach: discretionary discounts exceeding 8% add accelerated hazard
    policy_excess_discount = np.maximum(0.0, discount_rate - 8.0)
    risk_score += policy_excess_discount * 2.2

    # Penalty for working capital delay
    risk_score += (payment_delay_days / 90.0) * 8.0

    risk_score = np.clip(risk_score, 0.0, 100.0)

    # Risk Category (0: Low Risk < 35, 1: Moderate Risk 35-64, 2: High Risk >= 65)
    risk_category = np.where(risk_score >= 65.0, 2, np.where(risk_score >= 35.0, 1, 0))

    df = pd.DataFrame({
        'discount_rate': discount_rate,
        'cost_to_price_ratio': cost_to_price_ratio,
        'order_volume': order_volume,
        'order_value': order_value,
        'payment_delay_days': payment_delay_days,
        'material_cost_inflation': material_cost_inflation,
        'inventory_holding_days': inventory_holding_days,
        'effective_margin': effective_margin,
        'risk_score': risk_score,
        'risk_category': risk_category
    })

    return df


def train_and_save_model():
    print("=" * 60)
    print("CraftLedger: Training ML Profitability Risk Model")
    print("=" * 60)

    df = generate_synthetic_profitability_dataset(n_samples=3000)
    print(f"Generated {len(df)} simulated transaction profiles with realistic risk distributions.")

    feature_cols = [
        'discount_rate',
        'cost_to_price_ratio',
        'order_volume',
        'order_value',
        'payment_delay_days',
        'material_cost_inflation',
        'inventory_holding_days'
    ]

    X = df[feature_cols]
    y_score = df['risk_score']
    y_margin = df['effective_margin']
    y_cat = df['risk_category']

    X_train, X_test, y_score_train, y_score_test, y_margin_train, y_margin_test, y_cat_train, y_cat_test = train_test_split(
        X, y_score, y_margin, y_cat, test_size=0.2, random_state=42
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # 1. Regressor for Risk Score
    print("Training Random Forest Regressor for Risk Score...")
    score_model = RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42)
    score_model.fit(X_train, y_score_train)

    pred_score = score_model.predict(X_test)
    r2_score_val = r2_score(y_score_test, pred_score)
    mae_score = mean_absolute_error(y_score_test, pred_score)
    print(f"Risk Score Model Performance -> R2: {r2_score_val:.4f}, MAE: {mae_score:.2f} points")

    # 2. Classifier for Risk Category
    print("Training Gradient Boosting Classifier for Risk Tier Classification...")
    clf_model = GradientBoostingClassifier(n_estimators=80, max_depth=4, random_state=42)
    clf_model.fit(X_train, y_cat_train)
    pred_cat = clf_model.predict(X_test)
    acc = accuracy_score(y_cat_test, pred_cat)
    print(f"Risk Classification Accuracy: {acc * 100:.2f}%")

    # Feature Importances
    importances = score_model.feature_importances_
    feat_imp = sorted(zip(feature_cols, importances), key=lambda x: x[1], reverse=True)
    print("\nFeature Importance Analysis:")
    for feat, imp in feat_imp:
        print(f"  - {feat.padEnd(26) if hasattr(feat, 'padEnd') else feat.ljust(26)}: {imp * 100:.2f}%")

    # Export bundle
    output_dir = os.path.join(os.path.dirname(__file__), 'models')
    os.makedirs(output_dir, exist_ok=True)
    model_path = os.path.join(output_dir, 'profitability_risk_model.joblib')

    bundle = {
        'score_model': score_model,
        'clf_model': clf_model,
        'scaler': scaler,
        'feature_cols': feature_cols,
        'metrics': {
            'r2': round(float(r2_score_val), 4),
            'mae': round(float(mae_score), 2),
            'accuracy': round(float(acc * 100), 2)
        },
        'feature_importances': {feat: round(float(imp * 100), 2) for feat, imp in feat_imp},
        'model_type': 'Ensemble Random Forest & Gradient Boosting'
    }

    joblib.dump(bundle, model_path)
    print(f"\nModel artifact successfully saved to: {model_path}")
    print("=" * 60)
    return bundle


if __name__ == '__main__':
    train_and_save_model()
