document.addEventListener("DOMContentLoaded", () => {
    const sceneEl = document.querySelector('a-scene');
    
    // Находим все объекты-таргеты
    const targetEntities = document.querySelectorAll('[mindar-image-target]');

    targetEntities.forEach((el) => {
        // Получаем индекс из атрибута (0, 1, 2...)
        const targetSettings = el.getAttribute('mindar-image-target');
        const index = targetSettings.match(/\d+/)[0]; 
        
        // Находим видео, которое находится внутри этого таргета
        const videoElement = el.querySelector('a-video');
        const videoAsset = document.querySelector(videoElement.getAttribute('src'));

        el.addEventListener("targetFound", () => {
            console.log(`Маркер №${index} найден`);
            videoAsset.play();
        });

        el.addEventListener("targetLost", () => {
            console.log(`Маркер №${index} потерян`);
            videoAsset.pause();
        });
    });

    // Активация звука/видео по первому клику для мобильных браузеров
    document.body.addEventListener('click', () => {
        const allVideos = document.querySelectorAll('video');
        allVideos.forEach(v => {
            v.play();
            v.pause();
        });
        console.log("Видео-система готова");
    }, {once: true});
});
