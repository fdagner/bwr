import http.server, functools

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

handler = functools.partial(NoCacheHandler, directory='.')
http.server.ThreadingHTTPServer(('127.0.0.1', 8080), handler).serve_forever()
