const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Настройка multer для загрузки файлов
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Папка с данными
const DATA_DIR = path.join(__dirname, 'data');

// API для получения списка Excel файлов
app.get('/api/files', async (req, res) => {
    try {
        const files = await fs.readdir(DATA_DIR);
        const excelFiles = files.filter(file => file.endsWith('.xlsx'));
        res.json(excelFiles);
    } catch (error) {
        console.error('Ошибка чтения папки:', error);
        res.status(500).json({ error: 'Ошибка чтения папки' });
    }
});

// API для чтения Excel файла
app.get('/api/file/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(DATA_DIR, filename);
        
        // Проверка существования файла
        await fs.access(filePath);
        
        // Чтение файла
        const fileBuffer = await fs.readFile(filePath);
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });
        
        res.json(data);
    } catch (error) {
        console.error(`Ошибка чтения файла ${req.params.filename}:`, error);
        res.status(500).json({ error: 'Ошибка чтения файла' });
    }
});

// API для сохранения Excel файла
app.post('/api/file/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const data = req.body.data;
        const filePath = path.join(DATA_DIR, filename);
        
        // Создаем workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        
        // Сохраняем файл
        XLSX.writeFile(wb, filePath);
        
        // Делаем git commit
        await gitCommit(`Обновлен файл ${filename}`);
        
        res.json({ success: true, message: 'Файл сохранен' });
    } catch (error) {
        console.error(`Ошибка сохранения файла ${req.params.filename}:`, error);
        res.status(500).json({ error: 'Ошибка сохранения файла' });
    }
});

// API для создания нового Excel файла
app.post('/api/file', async (req, res) => {
    try {
        const { filename, data } = req.body;
        
        if (!filename || !filename.endsWith('.xlsx')) {
            return res.status(400).json({ error: 'Некорректное имя файла' });
        }
        
        const filePath = path.join(DATA_DIR, filename);
        
        // Проверка существования файла
        try {
            await fs.access(filePath);
            return res.status(400).json({ error: 'Файл уже существует' });
        } catch (e) {
            // Файл не существует, это нормально
        }
        
        // Создаем workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        
        // Сохраняем файл
        XLSX.writeFile(wb, filePath);
        
        // Делаем git commit
        await gitCommit(`Создан файл ${filename}`);
        
        res.json({ success: true, message: 'Файл создан' });
    } catch (error) {
        console.error('Ошибка создания файла:', error);
        res.status(500).json({ error: 'Ошибка создания файла' });
    }
});

// API для удаления Excel файла
app.delete('/api/file/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(DATA_DIR, filename);
        
        // Проверка существования файла
        await fs.access(filePath);
        
        // Удаляем файл
        await fs.unlink(filePath);
        
        // Делаем git commit
        await gitCommit(`Удален файл ${filename}`);
        
        res.json({ success: true, message: 'Файл удален' });
    } catch (error) {
        console.error(`Ошибка удаления файла ${req.params.filename}:`, error);
        res.status(500).json({ error: 'Ошибка удаления файла' });
    }
});

// Функция для git commit
async function gitCommit(message) {
    try {
        // Добавляем изменения
        execSync('git add data/', { cwd: __dirname });
        
        // Делаем commit
        execSync(`git commit -m "${message}"`, { cwd: __dirname });
        
        // Отправляем на сервер (опционально)
        try {
            execSync('git push', { cwd: __dirname });
        } catch (pushError) {
            console.warn('Не удалось отправить изменения на сервер:', pushError.message);
        }
        
        console.log(`Git commit выполнен: ${message}`);
    } catch (error) {
        console.error('Ошибка Git commit:', error.message);
    }
}

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    console.log(`Откройте http://localhost:${PORT}/admin-panel.html`);
});
