"""
CraftLedger ML Service: Cash Flow Multi-Horizon Forecasting Model
Trains gradient boosted models on Kaggle SME cash flow benchmark dataset
to predict daily inflows, outflows, and net cash trajectory.
"""

import os
import sys
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import GradientBoostingRegressor

# Multi-level resilient import for joblib
try:
    import joblib
except ImportError:
    import pickle
    class JoblibShim:
        @staticmethod
        def load(filename):
            with open(filename, 'rb') as f:
                return pickle.load(f)
        @staticmethod
        def dump(obj, filename):
            with open(filename, 'wb') as f:
                pickle.dump(obj, f)
    joblib = JoblibShim()

# Resilient XGBoost import with automatic fallback to Scikit-Learn GradientBoosting
XGB_AVAILABLE = False
try:
    import xgboost as xgb
    from xgboost import XGBRegressor
    XGB_AVAILABLE = True
except (ImportError, Exception):
    xgb = None
    XGBRegressor = None
    XGB_AVAILABLE = False

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
MODELS_DIR = os.path.join(BASE_DIR, 'models')


def create_regressor(random_state=42):
    """
    Creates an XGBoost regressor if available, or seamlessly falls back
    to Scikit-Learn GradientBoostingRegressor without unsupported arguments.
    """
    if XGB_AVAILABLE and XGBRegressor is not None:
        try:
            return XGBRegressor(
                n_estimators=180,
                learning_rate=0.04,
                max_depth=4,
                subsample=0.85,
                colsample_bytree=0.85,
                random_state=random_state
            )
        except Exception:
            pass

    return GradientBoostingRegressor(
        n_estimators=120,
        learning_rate=0.04,
        max_depth=4,
        subsample=0.85,
        random_state=random_state
    )


def build_features(df):
    """
    Constructs time-series lag and rolling features from raw daily financial history.
    """
    data = df.copy()
    data['date'] = pd.to_datetime(data['date'])
    data = data.sort_values('date').reset_index(drop=True)

    # Calendar features
    data['sin_dow'] = np.sin(2 * np.pi * data['day_of_week'] / 7.0)
    data['cos_dow'] = np.cos(2 * np.pi * data['day_of_week'] / 7.0)
    data['sin_month'] = np.sin(2 * np.pi * data['month'] / 12.0)
    data['cos_month'] = np.cos(2 * np.pi * data['month'] / 12.0)

    # Lag features
    data['inflow_lag_1'] = data['total_inflow'].shift(1)
    data['inflow_lag_7'] = data['total_inflow'].shift(7)
    data['outflow_lag_1'] = data['total_outflow'].shift(1)
    data['outflow_lag_7'] = data['total_outflow'].shift(7)
    data['closing_cash_lag_1'] = data['closing_cash'].shift(1)

    # Rolling averages
    data['inflow_roll_7'] = data['total_inflow'].rolling(7).mean()
    data['outflow_roll_7'] = data['total_outflow'].rolling(7).mean()
    data['inflow_roll_14'] = data['total_inflow'].rolling(14).mean()
    data['outflow_roll_14'] = data['total_outflow'].rolling(14).mean()

    # Financial indicators
    data['ar_ratio'] = data['pending_ar'] / (data['closing_cash_lag_1'] + 1.0)
    data['ap_ratio'] = data['pending_ap'] / (data['closing_cash_lag_1'] + 1.0)

    # Drop warm-up rows
    data = data.dropna().reset_index(drop=True)
    return data


def train():
    os.makedirs(MODELS_DIR, exist_ok=True)
    csv_path = os.path.join(DATA_DIR, 'kaggle_sme_cashflow_dataset.csv')
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Dataset not found at {csv_path}")

    raw_df = pd.read_csv(csv_path)
    df = build_features(raw_df)

    feature_cols = [
        'day_of_month', 'sin_dow', 'cos_dow', 'sin_month', 'cos_month',
        'is_weekend', 'is_month_end', 'is_quarter_end',
        'pending_ar', 'pending_ap', 'ar_ratio', 'ap_ratio',
        'inflow_lag_1', 'inflow_lag_7', 'inflow_roll_7', 'inflow_roll_14',
        'outflow_lag_1', 'outflow_lag_7', 'outflow_roll_7', 'outflow_roll_14',
        'closing_cash_lag_1'
    ]

    # Split 80% train, 20% test (chronological time-series split)
    split_idx = int(len(df) * 0.8)
    train_df = df.iloc[:split_idx]
    test_df = df.iloc[split_idx:]

    X_train = train_df[feature_cols]
    y_inflow_train = train_df['total_inflow']
    y_outflow_train = train_df['total_outflow']

    X_test = test_df[feature_cols]
    y_inflow_test = test_df['total_inflow']
    y_outflow_test = test_df['total_outflow']

    # Scaler for numeric stability
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Inflow Model
    inflow_model = create_regressor(random_state=42)
    inflow_model.fit(X_train_scaled, y_inflow_train)
    inflow_preds = inflow_model.predict(X_test_scaled)
    inflow_r2 = r2_score(y_inflow_test, inflow_preds)
    inflow_mae = mean_absolute_error(y_inflow_test, inflow_preds)

    # Outflow Model
    outflow_model = create_regressor(random_state=42)
    outflow_model.fit(X_train_scaled, y_outflow_train)
    outflow_preds = outflow_model.predict(X_test_scaled)
    outflow_r2 = r2_score(y_outflow_test, outflow_preds)
    outflow_mae = mean_absolute_error(y_outflow_test, outflow_preds)

    # Net flow accuracy
    net_actual = y_inflow_test - y_outflow_test
    net_pred = inflow_preds - outflow_preds
    net_r2 = r2_score(net_actual, net_pred)

    model_type_str = "XGBoost Regressor" if XGB_AVAILABLE else "GradientBoosting Regressor"
    print(f"--- ML Cash Flow Model Evaluation ({model_type_str}) ---")
    print(f"Inflow Model  - R2: {inflow_r2:.4f}, MAE: INR {inflow_mae:,.2f}")
    print(f"Outflow Model - R2: {outflow_r2:.4f}, MAE: INR {outflow_mae:,.2f}")
    print(f"Net Flow Model - R2: {net_r2:.4f}")

    # Calculate residual standard deviation for 95% confidence intervals
    inflow_res_std = float(np.std(y_inflow_test - inflow_preds))
    outflow_res_std = float(np.std(y_outflow_test - outflow_preds))

    model_bundle = {
        'inflow_model': inflow_model,
        'outflow_model': outflow_model,
        'scaler': scaler,
        'feature_cols': feature_cols,
        'metrics': {
            'inflow_r2': float(inflow_r2),
            'outflow_r2': float(outflow_r2),
            'net_r2': float(net_r2),
            'inflow_mae': float(inflow_mae),
            'outflow_mae': float(outflow_mae),
            'inflow_res_std': inflow_res_std,
            'outflow_res_std': outflow_res_std,
            'model_type': model_type_str
        }
    }

    model_path = os.path.join(MODELS_DIR, 'cash_flow_model.joblib')
    joblib.dump(model_bundle, model_path)
    print(f"SUCCESS: Model bundle saved to {model_path}")


if __name__ == '__main__':
    train()
