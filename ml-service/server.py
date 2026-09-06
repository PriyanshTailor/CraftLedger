"""
CraftLedger ML Service Microservice Server
Provides dedicated HTTP API endpoints for Cash Flow Forecasting,
Sales Prediction, and Profitability Hazard inference.
Built using Python's standard library http.server for maximum reliability and zero external web framework dependencies.
"""

import os
import sys
import json
import time
from http.server import HTTPServer, BaseHTTPRequestHandler

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import prediction functions
try:
    from predict import run_prediction as run_cash_flow_prediction
    CASH_FLOW_LOADED = True
except Exception as e:
    sys.stderr.write(f"[ML-Service] Warning: Cash flow engine failed to load: {e}\n")
    CASH_FLOW_LOADED = False

try:
    from predict_sales import run_sales_prediction
    SALES_LOADED = True
except Exception as e:
    sys.stderr.write(f"[ML-Service] Warning: Sales forecast engine failed to load: {e}\n")
    SALES_LOADED = False

try:
    from predict_profitability import run_prediction as run_profitability_prediction
    PROFITABILITY_LOADED = True
except Exception as e:
    sys.stderr.write(f"[ML-Service] Warning: Profitability engine failed to load: {e}\n")
    PROFITABILITY_LOADED = False

START_TIME = time.time()
PORT = int(os.environ.get('ML_SERVICE_PORT', 5001))

class MLRequestHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    def do_OPTIONS(self):
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        if self.path == '/health' or self.path == '/':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self._send_cors_headers()
            self.end_headers()
            response = {
                'status': 'online',
                'service': 'CraftLedger ML Inference Service',
                'uptimeSeconds': round(time.time() - START_TIME, 1),
                'models': {
                    'cash_flow_forecaster': CASH_FLOW_LOADED,
                    'sales_revenue_regressor': SALES_LOADED,
                    'profitability_risk_ensemble': PROFITABILITY_LOADED
                }
            }
            self.wfile.write(json.dumps(response).encode('utf-8'))
        else:
            self.send_response(404)
            self.send_header('Content-Type', 'application/json')
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Endpoint not found'}).encode('utf-8'))

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8') if content_length > 0 else '{}'

        try:
            payload = json.loads(body) if body else {}
        except json.JSONDecodeError:
            self.send_response(400)
            self.send_header('Content-Type', 'application/json')
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Invalid JSON body'}).encode('utf-8'))
            return

        try:
            if self.path == '/predict/cash-flow':
                result = run_cash_flow_prediction(payload)
            elif self.path == '/predict/sales':
                result = run_sales_prediction(payload)
            elif self.path == '/predict/profitability':
                result = run_profitability_prediction(payload)
            else:
                self.send_response(404)
                self.send_header('Content-Type', 'application/json')
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Endpoint not found'}).encode('utf-8'))
                return

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(result).encode('utf-8'))

        except Exception as err:
            sys.stderr.write(f"[ML-Service] Error processing {self.path}: {err}\n")
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({'success': False, 'error': str(err)}).encode('utf-8'))

    def log_message(self, format, *args):
        # Clean logging format with prefix
        sys.stdout.write(f"[ML-Service] {self.address_string()} - {format % args}\n")
        sys.stdout.flush()

def run_server():
    server_address = ('127.0.0.1', PORT)
    httpd = HTTPServer(server_address, MLRequestHandler)
    print(f"[ML-Service] CraftLedger ML Engine active and listening on http://127.0.0.1:{PORT}")
    sys.stdout.flush()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("[ML-Service] Stopping ML server...")
        httpd.server_close()

if __name__ == '__main__':
    run_server()
