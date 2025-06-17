#!/usr/bin/env python3
import json
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.parse
import base64
import requests
from datetime import datetime

# Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PORT = 8045

class APIHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status_code=200, content_type='application/json'):
        self.send_response(status_code)
        self.send_header('Content-type', content_type)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(200)

    def do_GET(self):
        if self.path == '/':
            self._set_headers()
            response = {"message": "AI Fashion Assistant API"}
            self.wfile.write(json.dumps(response).encode())
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Not found"}).encode())

    def do_POST(self):
        if self.path == '/analyze-outfit':
            try:
                # Pour le moment, retourner une réponse simulée
                response = {
                    "style": "Casual moderne",
                    "category": "quotidien",
                    "colors": {
                        "primary": ["noir", "blanc"],
                        "secondary": ["gris"]
                    },
                    "occasion": "Sortie décontractée",
                    "season": "printemps",
                    "recommendations": [
                        "Ajouter une touche de couleur avec des accessoires",
                        "Une veste en jean compléterait parfaitement ce look"
                    ],
                    "confidence": 0.89
                }
                
                self._set_headers()
                self.wfile.write(json.dumps(response).encode())
                
            except Exception as e:
                self._set_headers(500)
                self.wfile.write(json.dumps({"error": str(e)}).encode())
                
        elif self.path == '/generate-outfit-suggestions':
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                preferences = json.loads(post_data)
                
                response = {
                    "suggestions": f"Voici 5 suggestions basées sur vos préférences: {preferences}"
                }
                
                self._set_headers()
                self.wfile.write(json.dumps(response).encode())
                
            except Exception as e:
                self._set_headers(500)
                self.wfile.write(json.dumps({"error": str(e)}).encode())
                
        elif self.path == '/match-outfit':
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data)
                
                response = {
                    "matches": "Voici les meilleures combinaisons pour votre article"
                }
                
                self._set_headers()
                self.wfile.write(json.dumps(response).encode())
                
            except Exception as e:
                self._set_headers(500)
                self.wfile.write(json.dumps({"error": str(e)}).encode())
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Not found"}).encode())

def run_server():
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, APIHandler)
    print(f'Serveur démarré sur http://localhost:{PORT}')
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()