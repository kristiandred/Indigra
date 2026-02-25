/**
 * Менеджер масштаба страниц для сайта ИНДИГРА
 * Сохраняет и применяет единый масштаб на всех страницах
 */

class ZoomManager {
    constructor() {
        this.storageKey = 'indigra_page_zoom';
        this.defaultZoom = 100;
        this.minZoom = 50;
        this.maxZoom = 200;
        this.zoomStep = 10;
        this.currentZoom = this.defaultZoom;
        
        this.init();
    }

    init() {
        // Загружаем сохраненный масштаб при загрузке страницы
        this.loadZoom();
        
        // Применяем масштаб с небольшой задержкой для корректной инициализации
        setTimeout(() => {
            this.applyZoom();
        }, 100);
        
        // Добавляем обработчики событий
        this.addEventListeners();
        
        // Добавляем визуальную индикацию масштаба
        this.addZoomIndicator();
    }

    loadZoom() {
        try {
            const savedZoom = localStorage.getItem(this.storageKey);
            if (savedZoom) {
                this.currentZoom = parseInt(savedZoom, 10);
                // Проверяем, что сохраненное значение в допустимых пределах
                if (this.currentZoom < this.minZoom || this.currentZoom > this.maxZoom) {
                    this.currentZoom = this.defaultZoom;
                }
            } else {
                this.currentZoom = this.defaultZoom;
            }
        } catch (error) {
            console.warn('Не удалось загрузить масштаб из localStorage:', error);
            this.currentZoom = this.defaultZoom;
        }
    }

    saveZoom() {
        try {
            localStorage.setItem(this.storageKey, this.currentZoom.toString());
        } catch (error) {
            console.warn('Не удалось сохранить масштаб в localStorage:', error);
        }
    }

    applyZoom() {
        const root = document.documentElement;
        const zoomFactor = this.currentZoom / 100;
        
        // Применяем масштаб через CSS transform для лучшей производительности
        root.style.transform = `scale(${zoomFactor})`;
        root.style.transformOrigin = '0 0';
        root.style.width = `${100 / zoomFactor}%`;
        
        // Обновляем индикатор масштаба
        this.updateZoomIndicator();
        
        // Обновляем заголовок страницы с информацией о масштабе
        this.updatePageTitle();
    }

    setZoom(zoomLevel) {
        // Проверяем границы
        if (zoomLevel < this.minZoom) zoomLevel = this.minZoom;
        if (zoomLevel > this.maxZoom) zoomLevel = this.maxZoom;
        
        this.currentZoom = zoomLevel;
        this.applyZoom();
        this.saveZoom();
        
        // Показываем уведомление об изменении масштаба
        this.showZoomNotification();
    }

    zoomIn() {
        this.setZoom(this.currentZoom + this.zoomStep);
    }

    zoomOut() {
        this.setZoom(this.currentZoom - this.zoomStep);
    }

    resetZoom() {
        this.setZoom(this.defaultZoom);
    }

    addEventListeners() {
        // Горячие клавиши для управления масштабом
        document.addEventListener('keydown', (e) => {
            // Ctrl + Plus - увеличить
            if (e.ctrlKey && (e.key === '+' || e.key === '=')) {
                e.preventDefault();
                this.zoomIn();
            }
            // Ctrl + Minus - уменьшить
            else if (e.ctrlKey && e.key === '-') {
                e.preventDefault();
                this.zoomOut();
            }
            // Ctrl + 0 - сброс
            else if (e.ctrlKey && e.key === '0') {
                e.preventDefault();
                this.resetZoom();
            }
        });

        // Управление колесом мыши с Ctrl
        document.addEventListener('wheel', (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
                if (e.deltaY < 0) {
                    this.zoomIn();
                } else {
                    this.zoomOut();
                }
            }
        }, { passive: false });

        // Отслеживаем изменения масштаба через настройки браузера
        window.addEventListener('resize', () => {
            // При изменении размера окна проверяем, не изменился ли базовый масштаб
            const currentDevicePixelRatio = window.devicePixelRatio || 1;
            if (this.lastDevicePixelRatio && this.lastDevicePixelRatio !== currentDevicePixelRatio) {
                // Если изменился devicePixelRatio, возможно, пользователь изменил масштаб в браузере
                setTimeout(() => this.detectBrowserZoom(), 100);
            }
            this.lastDevicePixelRatio = currentDevicePixelRatio;
        });
    }

    detectBrowserZoom() {
        // Пытаемся обнаружить изменение масштаба браузера
        const visualViewport = window.visualViewport;
        if (visualViewport) {
            const browserZoom = Math.round(visualViewport.scale * 100);
            if (browserZoom !== this.currentZoom && browserZoom >= this.minZoom && browserZoom <= this.maxZoom) {
                this.setZoom(browserZoom);
            }
        }
    }

    addZoomIndicator() {
        // Создаем индикатор масштаба
        const indicator = document.createElement('div');
        indicator.id = 'zoom-indicator';
        indicator.innerHTML = `
            <div class="zoom-controls">
                <button class="zoom-btn zoom-out" title="Уменьшить (Ctrl+-)">−</button>
                <span class="zoom-level">${this.currentZoom}%</span>
                <button class="zoom-btn zoom-in" title="Увеличить (Ctrl+Plus)">+</button>
                <button class="zoom-btn zoom-reset" title="Сброс (Ctrl+0)">⟲</button>
            </div>
        `;
        
        // Добавляем стили для индикатора
        const style = document.createElement('style');
        style.textContent = `
            #zoom-indicator {
                position: fixed;
                top: 80px;
                right: 20px;
                z-index: 1000;
                background: rgba(30, 58, 138, 0.9);
                border-radius: 25px;
                padding: 8px 15px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                backdrop-filter: blur(10px);
                transition: all 0.3s ease;
            }
            
            .zoom-controls {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .zoom-btn {
                background: rgba(255, 255, 255, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.3);
                color: white;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 14px;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }
            
            .zoom-btn:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: scale(1.1);
            }
            
            .zoom-btn:active {
                transform: scale(0.95);
            }
            
            .zoom-level {
                color: white;
                font-weight: 600;
                font-size: 12px;
                min-width: 40px;
                text-align: center;
            }
            
            .zoom-notification {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(30, 58, 138, 0.95);
                color: white;
                padding: 15px 25px;
                border-radius: 10px;
                font-size: 18px;
                font-weight: 600;
                z-index: 10000;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
                animation: zoomNotification 2s ease-in-out;
            }
            
            @keyframes zoomNotification {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                20% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
                30% { transform: translate(-50%, -50%) scale(1); }
                80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
            }
            
            @media (max-width: 768px) {
                #zoom-indicator {
                    top: auto;
                    bottom: 20px;
                    right: 20px;
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(indicator);
        
        // Добавляем обработчики для кнопок
        indicator.querySelector('.zoom-in').addEventListener('click', () => this.zoomIn());
        indicator.querySelector('.zoom-out').addEventListener('click', () => this.zoomOut());
        indicator.querySelector('.zoom-reset').addEventListener('click', () => this.resetZoom());
    }

    updateZoomIndicator() {
        const levelElement = document.querySelector('.zoom-level');
        if (levelElement) {
            levelElement.textContent = `${this.currentZoom}%`;
        }
    }

    updatePageTitle() {
        // Добавляем информацию о масштабе в заголовок страницы
        const originalTitle = document.title;
        if (this.currentZoom !== this.defaultZoom) {
            document.title = `${originalTitle} (${this.currentZoom}%)`;
        } else {
            // Убираем информацию о масштабе из заголовка
            document.title = originalTitle.replace(/\s*\(\d+%\)$/, '');
        }
    }

    showZoomNotification() {
        // Удаляем существующее уведомление
        const existingNotification = document.querySelector('.zoom-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Создаем новое уведомление
        const notification = document.createElement('div');
        notification.className = 'zoom-notification';
        notification.textContent = `Масштаб: ${this.currentZoom}%`;
        
        document.body.appendChild(notification);
        
        // Автоматически удаляем уведомление через 2 секунды
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 2000);
    }

    // Публичный метод для получения текущего масштаба
    getCurrentZoom() {
        return this.currentZoom;
    }

    // Публичный метод для установки масштаба программно
    setCurrentZoom(zoomLevel) {
        this.setZoom(zoomLevel);
    }
}

// Инициализируем менеджер масштаба при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.zoomManager = new ZoomManager();
});

// Делаем доступным глобально для использования из других скриптов
window.ZoomManager = ZoomManager;
