"""Kleiner Server fuer die App-Preview: / zeigt direkt die Weltkarte."""
import http.server
import os
import socketserver
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 3003


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def do_GET(self):
        if self.path == "/":
            self.send_response(302)
            self.send_header("Location", "/world.html")
            self.end_headers()
            return
        super().do_GET()

    def end_headers(self):
        # nie cachen: nach einem Rebuild soll die Preview immer die neue Version zeigen
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        super().end_headers()

    def log_message(self, *a):
        pass


socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as srv:
    srv.serve_forever()
