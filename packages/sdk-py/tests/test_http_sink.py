"""Integratietest: HttpSink → een lokale server die het /api/ingest-contract nabootst.

Bewijst dat het wire-format (Bearer-auth + {events:[{...camelCase}]}) klopt
met wat apps/web/app/api/ingest/route.ts verwacht — vóór publish.
"""

import json
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer

import tokenlens as tl

RECEIVED = {"auth": None, "events": None, "batches": 0}


class _Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get("content-length", 0))
        body = json.loads(self.rfile.read(length) or b"{}")
        RECEIVED["auth"] = self.headers.get("authorization")
        RECEIVED["events"] = body.get("events")
        RECEIVED["batches"] += 1
        self.send_response(200)
        self.send_header("content-type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"inserted": len(body.get("events", []))}).encode())

    def log_message(self, *args):  # stil
        pass


def test_http_sink_post_matcht_ingest_contract():
    server = HTTPServer(("127.0.0.1", 0), _Handler)
    port = server.server_address[1]
    t = threading.Thread(target=server.serve_forever, daemon=True)
    t.start()
    try:
        tl.configure(
            sink=tl.HttpSink(
                f"http://127.0.0.1:{port}/api/ingest",
                "tl_test_key",
                batch_size=2,
            )
        )
        resp = {"model": "gpt-4o-mini",
                "usage": {"prompt_tokens": 100, "completion_tokens": 50}}
        tl.track({"customer": "acme", "feature": "sum"}, lambda: resp)
        tl.track({"customer": "beta"}, lambda: resp)  # raakt batch_size=2 → POST
        tl.flush()
    finally:
        server.shutdown()

    assert RECEIVED["auth"] == "Bearer tl_test_key"
    assert RECEIVED["events"] is not None and len(RECEIVED["events"]) == 2
    e = RECEIVED["events"][0]
    # exact de keys die de ingest-route uitleest:
    for k in ("ts", "provider", "model", "inputTokens", "outputTokens",
              "costUsd", "latencyMs", "tags"):
        assert k in e, f"ontbrekende key {k}"
    assert e["inputTokens"] == 100 and e["outputTokens"] == 50
    assert e["model"] == "gpt-4o-mini"
    assert e["tags"]["customer"] == "acme"
