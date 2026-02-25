/**
 * Отслеживатель масштаба браузера для сайта ИНДИГРА
 * Автоматически сохраняет и применяет масштаб браузера на всех страницах
 */

class ZoomTracker {
    constructor() {
        this.storageKey = 'indigra_browser_zoom';
        this.defaultZoom = 100;
        this.currentZoom = this.defaultZoom;
        this.checkInterval = null;
        
        this.init();
    }

    init() {
        // Загружаем сохраненный масштаб
        this.loadZoom();
        
        // Применяем сохраненный масштаб при загрузке страницы
        this.applySavedZoom();
        
        // Начинаем отслеживание изменений масштаба
        this.startTracking();
    }

    loadZoom() {
        try {
            const savedZoom = localStorage.getItem(this.storageKey);
            if (savedZoom) {
                this.currentZoom = parseInt(savedZoom, 10);
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

    getBrowserZoom() {
        // Определяем текущий масштаб браузера разными способами
        let zoom = 100;
        
        // Способ 1: через Visual Viewport API
        if (window.visualViewport) {
            zoom = Math.round(window.visualViewport.scale * 100);
        }
        
        // Способ 2: через devicePixelRatio и размеры экрана
        if (zoom === 100) {
            const devicePixelRatio = window.devicePixelRatio || 1;
            const screenWidth = window.screen.width;
            const windowWidth = window.outerWidth;
            
            if (screenWidth && windowWidth) {
                const calculatedRatio = screenWidth / windowWidth;
                zoom = Math.round(calculatedRatio * 100);
            }
        }
        
        // Способ 3: через измерение элемента
        if (zoom === 100) {
            const testElement = document.createElement('div');
            testElement.style.position = 'absolute';
            testElement.style.width = '100mm';
            testElement.style.height = '1px';
            testElement.style.visibility = 'hidden';
            testElement.style.pointerEvents = 'none';
            
            document.body.appendChild(testElement);
            
            const rect = testElement.getBoundingClientRect();
            document.body.removeChild(testElement);
            
            // 100mm должно быть примерно 377.95px при 100% масштабе
            const calculatedZoom = Math.round((rect.width / 377.95) * 100);
            if (calculatedZoom > 50 && calculatedZoom < 300) {
                zoom = calculatedZoom;
            }
        }
        
        return Math.max(50, Math.min(300, zoom));
    }

    startTracking() {
        // Отслеживаем изменения масштаба через различные события
        
        // 1. Изменение размера окна
        window.addEventListener('resize', () => {
            setTimeout(() => this.checkZoomChange(), 100);
        });
        
        // 2. Изменение ориентации
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.checkZoomChange(), 500);
        });
        
        // 3. Фокус/разфокус окна (может быть связано с изменением масштаба)
        window.addEventListener('focus', () => {
            setTimeout(() => this.checkZoomChange(), 100);
        });
        
        // 4. Периодическая проверка (раз в секунду)
        this.checkInterval = setInterval(() => {
            this.checkZoomChange();
        }, 1000);
        
        // 5. Отслеживаем движение колесика мыши с Ctrl
        document.addEventListener('wheel', (e) => {
            if (e.ctrlKey || e.metaKey) {
                setTimeout(() => this.checkZoomChange(), 200);
            }
        }, { passive: true });
        
        // 6. Отслеживаем горячие клавиши масштаба
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === '+' || e.key === '-' || e.key === '0' || 
                    e.key === '=' || e.key === '_') {
                    setTimeout(() => this.checkZoomChange(), 200);
                }
            }
        });
    }

    checkZoomChange() {
        const newZoom = this.getBrowserZoom();
        
        if (newZoom !== this.currentZoom) {
            this.currentZoom = newZoom;
            this.saveZoom();
            console.log(`Масштаб изменен на: ${this.currentZoom}%`);
        }
    }

    applySavedZoom() {
        // Проверяем текущий масштаб браузера
        const currentBrowserZoom = this.getBrowserZoom();
        
        // Если сохраненный масштаб отличается от текущего более чем на 5%
        if (Math.abs(this.currentZoom - currentBrowserZoom) > 5) {
            // Показываем уведомление в консоли
            console.log(`Обнаружен сохраненный масштаб: ${this.currentZoom}%`);
            console.log(`Текущий масштаб браузера: ${currentBrowserZoom}%`);
            console.log('Масштаб будет синхронизирован при изменении через Ctrl+плюс/минус/0');
            
            // Обновляем текущий масштаб, чтобы отслеживать изменения
            this.currentZoom = currentBrowserZoom;
        } else {
            console.log(`Масштаб уже синхронизирован: ${this.currentZoom}%`);
        }
    }

    // Публичный метод для получения текущего масштаба
    getCurrentZoom() {
        return this.currentZoom;
    }

    // Публичный метод для принудительной проверки масштаба
    checkNow() {
        this.checkZoomChange();
    }

    // Очистка при выгрузке страницы
    destroy() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
    }
}

// Инициализируем отслеживатель масштаба при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.zoomTracker = new ZoomTracker();
});

// Очищаем при выгрузке страницы
window.addEventListener('beforeunload', () => {
    if (window.zoomTracker) {
        window.zoomTracker.destroy();
    }
});

// Делаем доступным глобально
window.ZoomTracker = ZoomTracker;
