#!/usr/bin/env python3
"""
Простой HTTP сервер для тестирования админ-панели
Запуск: python server.py
Затем откройте http://localhost:8000/admin-panel-standalone.html
"""

import http.server
import socketserver
import os
import webbrowser
from pathlib import Path

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Добавляем CORS заголовки для локального тестирования
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

if __name__ == "__main__":
    # Проверяем что мы в правильной директории
    if not Path("admin-panel-standalone.html").exists():
        print("Ошибка: admin-panel-standalone.html не найден в текущей директории")
        print("Пожалуйста, запустите этот скрипт из папки проекта")
        exit(1)
    
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"🚀 Сервер запущен на http://localhost:{PORT}")
        print(f"📊 Админ-панель: http://localhost:{PORT}/admin-panel-standalone.html")
        print(f"🔧 Основная панель: http://localhost:{PORT}/admin-panel.html")
        print(f"⏹️  Остановить: Ctrl+C")
        
        # Автоматически открываем браузер
        try:
            webbrowser.open(f'http://localhost:{PORT}/admin-panel-standalone.html')
        except:
            pass
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n👋 Сервер остановлен")
