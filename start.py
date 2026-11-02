"""Запуск локального сайта без дополнительных зависимостей."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import webbrowser

root = Path(__file__).resolve().parent
handler = partial(SimpleHTTPRequestHandler, directory=str(root))
with ThreadingHTTPServer(('127.0.0.1', 8000), handler) as server:
    url = 'http://127.0.0.1:8000'
    print(f'ML / путь: {url}\nДля остановки нажми Ctrl+C.', flush=True)
    webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nСайт остановлен.')
