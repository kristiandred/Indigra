/**
 * layout-fixer.js - Улучшенный скрипт для точной подгонки ширины страницы
 * Убирает горизонтальный скролл, масштабируя основной контент
 * Версия 2.0 - с улучшенной обработкой проблемных элементов
 */

(function() {
    'use strict';

    // Находим основной контейнер с контентом
    const mainContent = document.querySelector('main[role="main"]');
    
    if (!mainContent) {
        console.log('LayoutFix: Элемент <main role="main"> не найден.');
        return;
    }

    // Функция для проверки наличия горизонтального скролла
    function hasHorizontalScroll() {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    }

    // Функция для применения корректировки ширины
    function applyLayoutFix() {
        // Получаем ширину окна браузера
        const windowWidth = window.innerWidth;
        
        // Временно убираем трансформацию для точного замера
        const wasTransformed = mainContent.style.transform !== '';
        if (wasTransformed) {
            mainContent.style.removeProperty('transform');
            mainContent.style.removeProperty('width');
            mainContent.style.removeProperty('transform-origin');
        }
        
        // Даем браузеру пересчитать размеры
        setTimeout(() => {
            // Реальная ширина контента
            const contentWidth = mainContent.scrollWidth;
            
            // Проверяем, есть ли скролл и нужно ли масштабирование
            if (!hasHorizontalScroll() && contentWidth <= windowWidth + 5) {
                console.log('LayoutFix: Горизонтального скролла нет.');
                return;
            }

            // Рассчитываем коэффициент масштабирования с запасом
            let scaleFactor = (windowWidth - 20) / contentWidth;
            
            // Ограничиваем минимальный масштаб
            scaleFactor = Math.max(scaleFactor, 0.6);
            
            // Если масштаб близок к 1 (больше 0.95), не применяем его
            if (scaleFactor > 0.95) {
                console.log('LayoutFix: Масштабирование не требуется.');
                return;
            }

            // Применяем трансформацию
            mainContent.style.transformOrigin = '0 0';
            mainContent.style.transform = `scale(${scaleFactor})`;
            mainContent.style.width = `${100 / scaleFactor}%`;
            
            console.log(`LayoutFix: Контент отмасштабирован до ${Math.round(scaleFactor * 100)}%`);
            console.log(`Ширина контента: ${contentWidth}px, Окно: ${windowWidth}px`);
            
        }, wasTransformed ? 50 : 10);
    }

    // Функция для сброса трансформации
    function resetTransform() {
        mainContent.style.removeProperty('transform');
        mainContent.style.removeProperty('width');
        mainContent.style.removeProperty('transform-origin');
    }

    // Наблюдатель за изменениями DOM
    const observer = new MutationObserver(function(mutations) {
        // Если добавились новые элементы, которые могут влиять на ширину
        let needsResize = false;
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                needsResize = true;
            }
        });
        
        if (needsResize) {
            setTimeout(applyLayoutFix, 100);
        }
    });

    // Запускаем наблюдение после загрузки
    window.addEventListener('load', function() {
        // Запускаем с небольшой задержкой
        setTimeout(applyLayoutFix, 200);
        
        // Начинаем наблюдать за изменениями в main
        observer.observe(mainContent, {
            childList: true,
            subtree: true,
            attributes: false
        });
    });

    // При изменении размера окна
    window.addEventListener('resize', function() {
        window.requestAnimationFrame(applyLayoutFix);
    });

    // Также запускаем после полной загрузки всех ресурсов
    window.addEventListener('pageshow', function() {
        setTimeout(applyLayoutFix, 300);
    });

})();
