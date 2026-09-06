import os
import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, r2_score

try:
    import joblib
except ImportError:
    import pickle as joblib

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
MODELS_DIR = os.path.join(BASE_DIR, 'models')

def build_sales_features(df):
    """
    Constructs simple, effective lag and rolling features for daily sales & revenue regression.
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
    data['sales_lag_1'] = data['daily_sales'].shift(1)
    data['sales_lag_7'] = data['daily_sales'].shift(7)
    data['orders_lag_1'] = data['orders_count'].shift(1)

    # Rolling averages
    data['sales_roll_7'] = data['daily_sales'].rolling(7).mean()
    data['sales_roll_14'] = data['daily_sales'].rolling(14).mean()
    data['orders_roll_7'] = data['orders_count'].rolling(7).mean()

    # Drop rows without complete rolling lag history
    data = data.dropna().reset_index(drop=True)
    return data

def train():
    os.makedirs(MODELS_DIR, exist_ok=True)
    csv_path = os.path.join(DATA_DIR, 'kaggle_sme_cashflow_dataset.csv')
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Dataset not found at {csv_path}")

    raw_df = pd.read_csv(csv_path)
    df = build_sales_features(raw_df)

    feature_cols = [
        'day_of_month', 'sin_dow', 'cos_dow', 'sin_month', 'cos_month',
        'is_weekend', 'is_month_end', 'is_quarter_end',
        'sales_lag_1', 'sales_lag_7', 'sales_roll_7', 'sales_roll_14',
        'orders_lag_1', 'orders_roll_7'
    ]

    # 80/20 chronological time-series split
    split_idx = int(len(df) * 0.8)
    train_df = df.iloc[:split_idx]
    test_df = df.iloc[split_idx:]

    X_train = train_df[feature_cols]
    y_sales_train = train_df['daily_sales']
    y_orders_train = train_df['orders_count']

    X_test = test_df[feature_cols]
    y_sales_test = test_df['daily_sales']
    y_orders_test = test_df['orders_count']

    # Standard Scaler
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Simple Ridge Regression Models
    sales_model = Ridge(alpha=1.5, random_state=42)
    sales_model.fit(X_train_scaled, y_sales_train)
    sales_preds = sales_model.predict(X_test_scaled)
    sales_r2 = r2_score(y_sales_test, sales_preds)
    sales_mae = mean_absolute_error(y_sales_test, sales_preds)

    orders_model = Ridge(alpha=1.5, random_state=42)
    orders_model.fit(X_train_scaled, y_orders_train)
    orders_preds = orders_model.predict(X_test_scaled)
    orders_r2 = r2_score(y_orders_test, orders_preds)
    orders_mae = mean_absolute_error(y_orders_test, orders_preds)

    # Residual standard deviation for confidence bands
    sales_res_std = float(np.std(y_sales_test - sales_preds))

    print("--- Simple ML Sales & Revenue Regression Evaluation ---")
    print(f"Sales Revenue Model - R2: {sales_r2:.4f}, MAE: INR {sales_mae:,.2f}")
    print(f"Orders Count Model  - R2: {orders_r2:.4f}, MAE: {orders_mae:,.2f} orders")

    model_bundle = {
        'model_type': 'Simple Ridge Linear Regression',
        'sales_model': sales_model,
        'orders_model': orders_model,
        'scaler': scaler,
        'feature_cols': feature_cols,
        'metrics': {
            'sales_r2': float(sales_r2),
            'sales_mae': float(sales_mae),
            'orders_r2': float(orders_r2),
            'orders_mae': float(orders_mae),
            'sales_res_std': sales_res_std
        }
    }

    model_path = os.path.join(MODELS_DIR, 'sales_revenue_model.joblib')
    joblib.dump(model_bundle, model_path)
    print(f"SUCCESS: Model bundle saved to {model_path}")

if __name__ == '__main__':
    train()
