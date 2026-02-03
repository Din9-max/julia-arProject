/**
 * Основной скрипт для управления AR сценой с видео маркерами
 */

class ARVideoManager {
    constructor() {
        this.sceneEl = null;
        this.targetEntities = [];
        this.videoAssets = [];
        this.isInitialized = false;
    }

    /**
     * Инициализация AR сцены
     */
    init() {
        document.addEventListener("DOMContentLoaded", () => {
            this.sceneEl = document.querySelector('a-scene');
            this.setupEventListeners();
            this.setupTargets();
            this.setupMobileActivation();
            
            console.log("AR Video Manager инициализирован");
            this.isInitialized = true;
        });
    }

    /**
     * Настройка обработчиков событий сцены
     */
    setupEventListeners() {
        // Событие загрузки сцены
        this.sceneEl.addEventListener('loaded', () => {
            console.log("Сцена A-Frame загружена");
        });

        // Обработка ошибок
        this.sceneEl.addEventListener('error', (error) => {
            console.error("Ошибка в A-Frame сцене:", error);
        });
    }

    /**
     * Настройка маркеров и видео
     */
    setupTargets() {
        this.targetEntities = document.querySelectorAll('[mindar-image-target]');
        
        this.targetEntities.forEach((el, index) => {
            // Получаем индекс маркера
            const targetSettings = el.getAttribute('mindar-image-target');
            const targetIndex = this.extractTargetIndex(targetSettings);
            
            // Находим видео элемент
            const videoElement = el.querySelector('a-video');
            if (!videoElement) {
                console.warn(`Не найден видео элемент для маркера ${targetIndex}`);
                return;
            }

            // Получаем видео ресурс
            const videoSrc = videoElement.getAttribute('src');
            const videoAsset = document.querySelector(videoSrc);
            
            if (!videoAsset) {
                console.warn(`Не найден видео ресурс для маркера ${targetIndex}`);
                return;
            }

            // Сохраняем информацию о видео
            this.videoAssets.push({
                element: videoAsset,
                target: el,
                index: targetIndex
            });

            // Настройка обработчиков событий для маркера
            this.setupTargetEventHandlers(el, videoAsset, targetIndex);
        });

        console.log(`Настроено ${this.targetEntities.length} маркеров`);
    }

    /**
     * Извлечение индекса из атрибута mindar-image-target
     */
    extractTargetIndex(targetSettings) {
        const match = targetSettings.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
    }

    /**
     * Настройка обработчиков событий для маркера
     */
    setupTargetEventHandlers(targetEl, videoAsset, index) {
        targetEl.addEventListener("targetFound", () => {
            console.log(`Маркер №${index} найден`);
            this.playVideo(videoAsset, index);
        });

        targetEl.addEventListener("targetLost", () => {
            console.log(`Маркер №${index} потерян`);
            this.pauseVideo(videoAsset, index);
        });
    }

    /**
     * Воспроизведение видео
     */
    playVideo(videoAsset, index) {
        try {
            if (videoAsset.paused) {
                videoAsset.play().catch(error => {
                    console.error(`Ошибка воспроизведения видео ${index}:`, error);
                });
            }
        } catch (error) {
            console.error(`Ошибка при попытке воспроизведения видео ${index}:`, error);
        }
    }

    /**
     * Пауза видео
     */
    pauseVideo(videoAsset, index) {
        try {
            if (!videoAsset.paused) {
                videoAsset.pause();
            }
        } catch (error) {
            console.error(`Ошибка при паузе видео ${index}:`, error);
        }
    }

    /**
     * Активация для мобильных устройств (требуется пользовательское взаимодействие)
     */
    setupMobileActivation() {
        const activationHandler = () => {
            // Подготовка всех видео элементов
            this.videoAssets.forEach((video, index) => {
                try {
                    video.element.play().then(() => {
                        video.element.pause();
                        console.log(`Видео ${index} подготовлено для воспроизведения`);
                    }).catch(error => {
                        console.warn(`Не удалось подготовить видео ${index}:`, error);
                    });
                } catch (error) {
                    console.error(`Ошибка подготовки видео ${index}:`, error);
                }
            });
            
            console.log("AR система активирована для мобильных устройств");
            
            // Удаляем обработчик после первого клика
            document.body.removeEventListener('click', activationHandler);
            document.body.removeEventListener('touchstart', activationHandler);
        };

        // Добавляем обработчики для клика и касания
        document.body.addEventListener('click', activationHandler, { once: true });
        document.body.addEventListener('touchstart', activationHandler, { once: true });

        // Информационное сообщение для пользователя
        this.showUserMessage("Нажмите на экран для активации AR");
    }

    /**
     * Показать сообщение пользователю
     */
    showUserMessage(message) {
        const messageEl = document.createElement('div');
        messageEl.className = 'user-message';
        messageEl.textContent = message;
        document.body.appendChild(messageEl);

        // Автоматическое скрытие сообщения через 5 секунд
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.style.opacity = '0';
                messageEl.style.transition = 'opacity 0.5s';
                setTimeout(() => {
                    if (messageEl.parentNode) {
                        messageEl.parentNode.removeChild(messageEl);
                    }
                }, 500);
            }
        }, 5000);
    }

    /**
     * Получить статус всех видео
     */
    getVideoStatus() {
        return this.videoAssets.map(video => ({
            index: video.index,
            playing: !video.element.paused,
            duration: video.element.duration,
            currentTime: video.element.currentTime
        }));
    }

    /**
     * Перезапустить все видео
     */
    restartAllVideos() {
        this.videoAssets.forEach(video => {
            video.element.currentTime = 0;
            if (!video.element.paused) {
                video.element.play().catch(console.error);
            }
        });
    }

    /**
     * Остановить все видео
     */
    stopAllVideos() {
        this.videoAssets.forEach(video => {
            video.element.pause();
            video.element.currentTime = 0;
        });
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    const arManager = new ARVideoManager();
    arManager.init();
    
    // Экспорт для отладки через консоль
    window.arManager = arManager;
});
