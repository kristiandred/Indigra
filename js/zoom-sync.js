/**
 * Синхронизатор масштаба для сайта ИНДИГРА
 * Применяет сохраненный масштаб через CSS transform
 */

class ZoomSync {
    constructor() {
        this.storageKey = 'indigra_page_zoom';
        this.defaultZoom = 100;
        this.currentZoom = this.defaultZoom;
        this.minZoom = 50;
        this.maxZoom = 200;
        
        this.init();
    }

    init() {
        // Загружаем сохраненный масштаб
        this.loadZoom();
        
        // Применяем масштаб через CSS
        this.applyZoom();
        
        // Отслеживаем изменения масштаба браузера
        this.trackBrowserZoom();
        
        // Добавляем уведомление в консоль
        this.showConsoleInfo();
    }

    loadZoom() {
        try {
            const savedZoom = localStorage.getItem(this.storageKey);
            if (savedZoom) {
                this.currentZoom = Math.max(this.minZoom, Math.min(this.maxZoom, parseInt(savedZoom, 10)));
            } else {
                this.currentZoom = this.defaultZoom;
            }
        } catch (error) {
            console.warn('Не удалось загрузить масштаб:', error);
            this.currentZoom = this.defaultZoom;
        }
    }

    saveZoom() {
        try {
            localStorage.setItem(this.storageKey, this.currentZoom.toString());
        } catch (error) {
            console.warn('Не удалось сохранить масштаб:', error);
        }
    }

    applyZoom() {
        const root = document.documentElement;
        const zoomFactor = this.currentZoom / 100;
        
        // Применяем масштаб через CSS transform
        root.style.transform = `scale(${zoomFactor})`;
        root.style.transformOrigin = '0 0';
        root.style.width = `${100 / zoomFactor}%`;
        root.style.height = `${100 / zoomFactor}%`;
        
        // Добавляем класс для стилизации
        root.classList.toggle('zoomed', this.currentZoom !== this.defaultZoom);
        root.setAttribute('data-zoom', this.currentZoom.toString());
    }

    trackBrowserZoom() {
        // Отслеживаем горячие клавиши масштаба
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === '+' || e.key === '=' || e.key === '-' || e.key === '0') {
                    setTimeout(() => this.detectBrowserZoomChange(), 200);
                }
            }
        });

        // Отслеживаем колесо мыши с Ctrl
        document.addEventListener('wheel', (e) => {
            if (e.ctrlKey || e.metaKey) {
                setTimeout(() => this.detectBrowserZoomChange(), 200);
            }
        }, { passive: true });

        // Отслеживаем изменения размера окна
        window.addEventListener('resize', () => {
            setTimeout(() => this.detectBrowserZoomChange(), 100);
        });

        // Периодическая проверка
        setInterval(() => this.detectBrowserZoomChange(), 2000);
    }

    detectBrowserZoomChange() {
        const browserZoom = this.getBrowserZoom();
        
        // Если масштаб браузера изменился, обновляем наш масштаб
        if (browserZoom !== this.currentZoom) {
            this.currentZoom = Math.max(this.minZoom, Math.min(this.maxZoom, browserZoom));
            this.applyZoom();
            this.saveZoom();
            console.log(`Масштаб синхронизирован: ${this.currentZoom}%`);
        }
    }

    getBrowserZoom() {
        // Определяем масштаб браузера
        let zoom = 100;
        
        // Через Visual Viewport API
        if (window.visualViewport) {
            zoom = Math.round(window.visualViewport.scale * 100);
        }
        
        // Через devicePixelRatio
        if (zoom === 100 && window.devicePixelRatio) {
            const devicePixelRatio = window.devicePixelRatio;
            zoom = Math.round(devicePixelRatio * 100);
        }
        
        // Ограничиваем диапазон
        return Math.max(50, Math.min(300, zoom));
    }

    showConsoleInfo() {
        if (this.currentZoom !== this.defaultZoom) {
            console.log(`%c🔍 Масштаб страницы: ${this.currentZoom}%`, 'color: #1e3a8a; font-weight: bold; font-size: 14px;');
            console.log('Для изменения масштаба используйте Ctrl+плюс/минус/0 или колесо мыши с Ctrl');
        }
    }

    // Публичные методы
    getCurrentZoom() {
        return this.currentZoom;
    }

    setZoom(zoomLevel) {
        this.currentZoom = Math.max(this.minZoom, Math.min(this.maxZoom, zoomLevel));
        this.applyZoom();
        this.saveZoom();
    }

    resetZoom() {
        this.setZoom(this.defaultZoom);
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    window.zoomSync = new ZoomSync();
});

// Глобальный доступ
window.ZoomSync = ZoomSync;
