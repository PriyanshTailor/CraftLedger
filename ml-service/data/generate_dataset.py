import os
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

DATA_DIR = os.path.dirname(os.path.abspath(__file__))

def generate_kaggle_sme_dataset():
    """
    Generates a realistic multi-year Kaggle-standard daily cash flow dataset
    for an SME furniture manufacturing and retail business.
    """
    os.makedirs(DATA_DIR, exist_ok=True)

    np.random.seed(42)
    start_date = datetime(2023, 1, 1)
    n_days = 730  # 2 years of daily data

    records = []
    current_cash = 500000.0  # Starting cash balance in INR
    pending_ar = 400000.0    # Initial accounts receivable
    pending_ap = 250000.0    # Initial accounts payable

    for i in range(n_days):
        dt = start_date + timedelta(days=i)
        day_of_week = dt.weekday()  # 0: Mon, 6: Sun
        day_of_month = dt.day
        is_weekend = 1 if day_of_week in [5, 6] else 0
        is_month_end = 1 if (dt + timedelta(days=1)).day == 1 else 0
        is_quarter_end = 1 if is_month_end and dt.month in [3, 6, 9, 12] else 0
        quarter = (dt.month - 1) // 3 + 1

        # Seasonality: higher sales in festive Q3/Q4 (Diwali/Year-end: Oct-Dec)
        seasonality = 1.25 if dt.month in [10, 11, 12] else (0.85 if dt.month in [1, 2] else 1.05)

        # Daily sales revenue generated
        if is_weekend:
            daily_sales = np.random.uniform(15000, 45000) * seasonality
        else:
            daily_sales = np.random.uniform(35000, 120000) * seasonality

        # Sales add to pending receivables (approx 70% credit, 30% direct cash)
        direct_cash_sales = daily_sales * 0.30
        credit_sales = daily_sales * 0.70
        pending_ar += credit_sales

        # Inflows: collections from pending receivables (peaks around 1st-5th and 15th-20th)
        collection_rate = np.random.uniform(0.04, 0.08)
        if day_of_month in [1, 2, 3, 4, 5, 15, 16, 17, 18, 19, 20]:
            collection_rate *= 1.6
        receivables_collected = pending_ar * collection_rate
        pending_ar = max(50000.0, pending_ar - receivables_collected)

        total_inflow = direct_cash_sales + receivables_collected

        # New purchases/vendor bills (timber, foam, fabric, hardware)
        daily_purchases = np.random.uniform(20000, 75000) * seasonality if not is_weekend else np.random.uniform(5000, 15000)
        pending_ap += daily_purchases

        # Outflows: vendor payments (typically paid around 10th and 25th of month)
        vendor_pay_rate = np.random.uniform(0.03, 0.07)
        if day_of_month in [10, 11, 12, 24, 25, 26]:
            vendor_pay_rate *= 1.8
        vendor_outflow = pending_ap * vendor_pay_rate
        pending_ap = max(30000.0, pending_ap - vendor_outflow)

        # Operational expenses (utilities, transport, marketing)
        opex_outflow = np.random.uniform(3000, 12000) if not is_weekend else np.random.uniform(1000, 4000)

        # Payroll / Salary outflows (on the 1st - 5th of each month)
        payroll_outflow = 0.0
        if day_of_month == 1:
            payroll_outflow = np.random.uniform(180000, 240000)
        elif day_of_month == 2 and payroll_outflow == 0:
            payroll_outflow = np.random.uniform(40000, 60000)

        # Rent / Lease (on 5th of month)
        rent_outflow = np.random.uniform(60000, 75000) if day_of_month == 5 else 0.0

        total_outflow = vendor_outflow + opex_outflow + payroll_outflow + rent_outflow
        net_cash_flow = total_inflow - total_outflow
        opening_cash = current_cash
        current_cash = max(20000.0, current_cash + net_cash_flow)

        orders_count = max(1, int(daily_sales / np.random.uniform(7000, 14000)))

        records.append({
            'date': dt.strftime('%Y-%m-%d'),
            'day_of_week': day_of_week,
            'day_of_month': day_of_month,
            'month': dt.month,
            'quarter': quarter,
            'is_weekend': is_weekend,
            'is_month_end': is_month_end,
            'is_quarter_end': is_quarter_end,
            'daily_sales': round(daily_sales, 2),
            'orders_count': orders_count,
            'opening_cash': round(opening_cash, 2),
            'direct_cash_sales': round(direct_cash_sales, 2),
            'receivables_collected': round(receivables_collected, 2),
            'total_inflow': round(total_inflow, 2),
            'vendor_outflow': round(vendor_outflow, 2),
            'opex_outflow': round(opex_outflow, 2),
            'payroll_outflow': round(payroll_outflow, 2),
            'rent_outflow': round(rent_outflow, 2),
            'total_outflow': round(total_outflow, 2),
            'net_cash_flow': round(net_cash_flow, 2),
            'closing_cash': round(current_cash, 2),
            'pending_ar': round(pending_ar, 2),
            'pending_ap': round(pending_ap, 2)
        })

    df = pd.DataFrame(records)
    csv_path = os.path.join(DATA_DIR, 'kaggle_sme_cashflow_dataset.csv')
    df.to_csv(csv_path, index=False)
    print(f"SUCCESS: Generated Kaggle benchmark dataset with {len(df)} records at {csv_path}")
    print(df.head(3))

if __name__ == '__main__':
    generate_kaggle_sme_dataset()
