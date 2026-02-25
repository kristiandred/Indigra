@echo off
echo 🚀 Запуск локального сервера для админ-панели...
echo.

REM Проверяем наличие Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python не найден. Пожалуйста, установите Python с https://python.org
    pause
    exit /b 1
)

REM Проверяем наличие файла server.py
if not exist "server.py" (
    echo ❌ Файл server.py не найден в текущей директории
    pause
    exit /b 1
)

echo ✅ Python найден, запускаем сервер...
echo 📊 Админ-панель будет доступна по адресу: http://localhost:8000/admin-panel-standalone.html
echo 🔧 Основная панель: http://localhost:8000/admin-panel.html
echo ⏹️  Для остановки сервера закройте это окно или нажмите Ctrl+C
echo.

python server.py

pause
