// script.js v1.0 (Debug Fixed) - Стабильная версия с рабочей кнопкой описания
document.addEventListener('DOMContentLoaded', async () => {
  const videoPlayer = document.getElementById('currentVideo');
  const videoTitle = document.getElementById('videoTitle');
  const videoSeries = document.getElementById('videoSeries');
  const videoSeasons = document.getElementById('videoSeasons');
  const videoStatus = document.getElementById('videoStatus');
  const videoCountry = document.getElementById('videoCountry');
  const videoGenre = document.getElementById('videoGenre');
  const watchLink = document.getElementById('watchLink');
  const descriptionButton = document.getElementById('descriptionButton');
  const descriptionModal = document.getElementById('descriptionModal');
  const modalClose = document.getElementById('modalClose');
  const modalTitle = document.getElementById('modalTitle');
  const modalDescription = document.getElementById('modalDescription');

  let videos = [];
  let videoOrder = []; // массив индексов в случайном порядке
  let currentOrderIndex = 0; // текущий указатель в массиве videoOrder

  console.log('🚀 Начинаем инициализацию приложения...');
  
  // Определяем среду выполнения
  const isTelegram = window.Telegram && window.Telegram.WebApp;
  const userAgent = navigator.userAgent || '';
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  console.log('🔍 Информация о среде:');
  console.log('- Telegram WebApp:', !!isTelegram);
  console.log('- Мобильное устройство:', isMobile);
  console.log('- User Agent:', userAgent);
  
  // Настройки для Telegram WebApp
  if (isTelegram) {
    console.log('📱 Настраиваем для Telegram WebApp');
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
    console.log('✅ Telegram WebApp настроен');
  }
  
  // Проверяем наличие всех элементов
  console.log('🔍 Проверка элементов DOM:');
  console.log('videoPlayer:', !!videoPlayer);
  console.log('descriptionButton:', !!descriptionButton, descriptionButton?.id);
  console.log('descriptionModal:', !!descriptionModal, descriptionModal?.id);
  console.log('modalClose:', !!modalClose, modalClose?.id);
  console.log('modalTitle:', !!modalTitle, modalTitle?.id);
  console.log('modalDescription:', !!modalDescription, modalDescription?.id);

  // Функция перемешивания массива индексов
  function shuffleVideos() {
    videoOrder = videos.map((_, index) => index);
    for (let i = videoOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [videoOrder[i], videoOrder[j]] = [videoOrder[j], videoOrder[i]];
    }
    currentOrderIndex = 0;
    console.log('🔀 Видео перемешаны, порядок:', videoOrder);
  }

  // Функция загрузки списка видео с сервера
  async function fetchVideos() {
    console.log('📥 Начинаем загрузку видео...');
    try {
      const response = await fetch('get_videos.php');
      console.log('📡 Ответ сервера:', response);
      console.log('✅ Response.ok:', response.ok);
      console.log('📊 Response.status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      const rawText = await response.text();
      console.log('📄 Сырой ответ сервера (первые 500 символов):', rawText.substring(0, 500));
      
      // Пытаемся парсить JSON
      try {
        videos = JSON.parse(rawText);
        console.log('✅ JSON успешно распарсен');
        console.log('📺 Количество видео:', videos.length);
        console.log('🎬 Список видео:', videos);
        
        // Проверяем каждое видео на наличие обязательных полей
        videos.forEach((video, index) => {
          console.log(`🎥 Видео ${index + 1}:`, {
            filename: video.filename,
            title: video.title,
            description: video.description,
            hasDescription: !!video.description
          });
        });
        
        if (videos.length > 0) {
          shuffleVideos();
          loadVideo();
        } else {
          console.warn('⚠️ Массив видео пустой');
        }
      } catch (parseError) {
        console.error('❌ Ошибка парсинга JSON:', parseError);
        console.log('📄 Проблемный текст:', rawText);
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки видео:', error);
    }
  }

  // Функция плавного переключения видео
  function loadVideo() {
    if (videos.length === 0) {
      console.warn('⚠️ Нет видео для загрузки');
      return;
    }
    
    const idx = videoOrder[currentOrderIndex];
    const videoData = videos[idx];
    console.log(`🎬 Загружаем видео ${currentOrderIndex + 1}/${videoOrder.length}, индекс: ${idx}`);
    console.log('🎥 Данные видео:', videoData);
    
    if (videoData) {
      const newSrc = `uploads/${encodeURIComponent(videoData.filename)}`;
      console.log('📁 Путь к видео:', newSrc);

      // Плавное затемнение основного видео
      videoPlayer.style.opacity = 0;
      setTimeout(() => {
        videoPlayer.src = newSrc;
        console.log('▶️ Устанавливаем src видео:', newSrc);
        videoPlayer.load();
        videoPlayer.play().then(() => {
          console.log('✅ Видео запущено успешно');
        }).catch(error => {
          console.error('❌ Ошибка воспроизведения видео:', error);
        });
        videoPlayer.style.opacity = 1;
      }, 100);

      // Обновление оверлеев - теперь только название (на месте страны) и жанр
      videoTitle.textContent = videoData.title || 'Без названия'; // Название на месте страны
      videoSeries.textContent = ''; // Очищаем серии
      videoSeasons.textContent = ''; // Очищаем сезоны  
      videoStatus.textContent = ''; // Очищаем статус
      videoCountry.textContent = ''; // Очищаем страну
      videoGenre.textContent = `${videoData.genre || 'Неизвестно'}`; // Оставляем только жанр
      
      console.log('📝 Информация обновлена:', {
        title: videoData.title,
        genre: videoData.genre,
        description: videoData.description
      });

      if (watchLink) {
        watchLink.href = videoData.link || '#';
      }
    }
  }

  // Функции переключения видео по случайному порядку
  function nextVideo() {
    console.log('⏭️ Следующее видео');
    currentOrderIndex++;
    if (currentOrderIndex >= videoOrder.length) {
      console.log('🔄 Достигнут конец списка, перемешиваем заново');
      shuffleVideos();
    }
    loadVideo();
  }

  function previousVideo() {
    console.log('⏮️ Предыдущее видео');
    currentOrderIndex--;
    if (currentOrderIndex < 0) {
      currentOrderIndex = videoOrder.length - 1;
    }
    loadVideo();
  }

  // Функция показа модального окна с описанием
  function showDescription() {
    console.log('📖 Функция showDescription вызвана');
    console.log('📊 Количество видео:', videos.length);
    console.log('📍 Текущий индекс:', currentOrderIndex);
    
    if (videos.length === 0) {
      console.warn('⚠️ Нет видео для показа описания');
      return;
    }
    
    const idx = videoOrder[currentOrderIndex];
    const videoData = videos[idx];
    
    console.log('🎬 Данные текущего видео:', videoData);
    
    if (videoData) {
      const title = videoData.title || 'Без названия';
      const description = videoData.description || 'Описание отсутствует';
      const series = videoData.series || 'Неизвестно';
      const seasons = videoData.seasons || 'Неизвестно';
      const status = videoData.status || 'Неизвестно';
      const country = videoData.country || 'Неизвестно';
      const genre = videoData.genre || 'Неизвестно';
      const link = videoData.link || '#';
      
      // Формируем полное описание со всеми данными
      const fullDescription = `${description}

📊 Подробная информация:
• Серии: ${series}
• Сезоны: ${seasons}  
• Статус: ${status}
• Страна: ${country}
• Жанр: ${genre}
• Ссылка: ${link}`;
      
      console.log('📝 Заголовок:', title);
      console.log('📄 Полное описание:', fullDescription);
      
      if (modalTitle) {
        modalTitle.textContent = title;
        console.log('✅ Заголовок установлен');
      } else {
        console.error('❌ modalTitle элемент не найден');
      }
      
      if (modalDescription) {
        modalDescription.textContent = fullDescription;
        console.log('✅ Полное описание установлено');
      } else {
        console.error('❌ modalDescription элемент не найден');
      }
      
      if (descriptionModal) {
        descriptionModal.classList.add('show');
        console.log('✅ Модальное окно показано');
        console.log('🎪 Классы модального окна:', descriptionModal.className);
      } else {
        console.error('❌ descriptionModal элемент не найден');
      }
    } else {
      console.error('❌ Данные видео не найдены для индекса:', idx);
    }
  }

  // Функция скрытия модального окна
  function hideDescription() {
    console.log('❌ Закрываем модальное окно описания');
    if (descriptionModal) {
      descriptionModal.classList.remove('show');
      console.log('✅ Класс "show" удален из модального окна');
    } else {
      console.error('❌ descriptionModal элемент не найден при закрытии');
    }
  }

  // Обработчики для модального окна описания (с поддержкой Telegram)
  if (descriptionButton) {
    // Обработчик клика
    descriptionButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('📖 Нажата кнопка описания (click)');
      showDescription();
    });
    
    // Дополнительный обработчик для touch устройств (важно для Telegram)
    descriptionButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('📖 Touch start на кнопке описания');
    });
    
    descriptionButton.addEventListener('touchend', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('📖 Touch end на кнопке описания');
      showDescription();
    });
    
    // Для Telegram WebApp
    descriptionButton.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('📖 Pointer down на кнопке описания');
    });
    
    descriptionButton.addEventListener('pointerup', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('📖 Pointer up на кнопке описания');
      showDescription();
    });
    
    console.log('✅ Все обработчики кнопки описания установлены (включая Telegram)');
  } else {
    console.error('❌ Кнопка описания не найдена!');
  }

  if (modalClose) {
    modalClose.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('❌ Нажата кнопка закрытия модального окна (click)');
      hideDescription();
    });
    
    // Дополнительные обработчики для Telegram
    modalClose.addEventListener('touchend', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('❌ Touch end на кнопке закрытия');
      hideDescription();
    });
    
    modalClose.addEventListener('pointerup', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('❌ Pointer up на кнопке закрытия');
      hideDescription();
    });
    
    console.log('✅ Все обработчики кнопки закрытия установлены');
  } else {
    console.error('❌ Кнопка закрытия не найдена!');
  }

  if (descriptionModal) {
    descriptionModal.addEventListener('click', (e) => {
      if (e.target === descriptionModal) {
        console.log('❌ Клик вне модального окна');
        hideDescription();
      }
    });
    console.log('✅ Обработчик клика вне модального окна установлен');
  } else {
    console.error('❌ Модальное окно не найдено!');
  }

  // Обработчик клика по контейнеру видео для паузы/воспроизведения
  const videoContainer = document.querySelector('.video-container');
  if (videoContainer) {
    // Функция обработки клика/тапа
    const handleVideoInteraction = (e, eventType) => {
      console.log(`🎬 Обработка взаимодействия с видео (${eventType})`);
      console.log('🎯 Элемент клика:', e.target.tagName, e.target.className);
      
      // Проверяем, что клик не по кнопкам или модальному окну
      if (e.target.tagName.toLowerCase() === 'a' || 
          e.target.tagName.toLowerCase() === 'button' ||
          e.target.closest('button') || 
          e.target.closest('.action-buttons') ||
          e.target.closest('.description-modal') ||
          e.target.classList.contains('action-button') ||
          e.target.classList.contains('watch-link')) {
        console.log('🚫 Клик по интерактивному элементу, игнорируем');
        return;
      }
      
      if (videoPlayer) {
        if (videoPlayer.paused) {
          console.log('▶️ Запускаем видео');
          videoPlayer.play().catch(err => {
            console.warn('⚠️ Ошибка воспроизведения:', err);
          });
        } else {
          console.log('⏸️ Ставим видео на паузу');
          videoPlayer.pause();
        }
      } else {
        console.warn('⚠️ Видео плеер не найден');
      }
    };
    
    // Основной обработчик клика
    videoContainer.addEventListener('click', (e) => {
      e.stopPropagation();
      handleVideoInteraction(e, 'click');
    });
    
    // Дополнительные обработчики для мобильных устройств и Telegram
    if (isMobile || isTelegram) {
      let touchStartTime = 0;
      let touchStartTarget = null;
      
      videoContainer.addEventListener('touchstart', (e) => {
        touchStartTime = Date.now();
        touchStartTarget = e.target;
        console.log('👆 Touch start на видео контейнере');
      });
      
      videoContainer.addEventListener('touchend', (e) => {
        const touchDuration = Date.now() - touchStartTime;
        const touchEndTarget = e.target;
        
        console.log(`👆 Touch end: ${touchDuration}ms, same target: ${touchStartTarget === touchEndTarget}`);
        
        // Только если это короткое касание по тому же элементу (тап)
        if (touchDuration < 500 && touchStartTarget === touchEndTarget) {
          e.preventDefault();
          e.stopPropagation();
          handleVideoInteraction(e, 'touchend');
        }
      });
    }
    
    console.log('✅ Обработчики взаимодействия с видео установлены');
  } else {
    console.error('❌ Контейнер видео не найден!');
  }

  // Обработчики свайпов для переключения видео
  let touchStartY = 0;
  let touchEndY = 0;
  
  if (videoPlayer) {
    videoPlayer.addEventListener('touchstart', (e) => {
      touchStartY = e.changedTouches[0].screenY;
    });
    
    videoPlayer.addEventListener('touchend', (e) => {
      touchEndY = e.changedTouches[0].screenY;
      if (touchEndY < touchStartY) {
        console.log('⬆️ Свайп вверх - следующее видео');
        nextVideo(); // Вверх — следующее видео
      }
      if (touchEndY > touchStartY) {
        console.log('⬇️ Свайп вниз - предыдущее видео');
        previousVideo(); // Вниз — предыдущее видео
      }
    });
    console.log('✅ Обработчики свайпов установлены');
  } else {
    console.error('❌ Видео плеер не найден для свайпов!');
  }

  // Обработчик события wheel для пролистывания видео на тачпаде ноутбука с throttle
  let wheelTimeout = null;
  if (videoContainer) {
    videoContainer.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (wheelTimeout) return;
      if (e.deltaY > 0) {
        console.log('🖱️ Колесо вниз - следующее видео');
        nextVideo();
      } else if (e.deltaY < 0) {
        console.log('🖱️ Колесо вверх - предыдущее видео');
        previousVideo();
      }
      wheelTimeout = setTimeout(() => {
        wheelTimeout = null;
      }, 1000); // задержка 1000 мс
    });
    console.log('✅ Обработчик колеса мыши установлен');
  }

  // Настраиваем основной video элемент
  if (videoPlayer) {
    videoPlayer.muted = false;
    console.log('🔊 Звук включен');
  }

  // Запускаем приложение
  await fetchVideos();

  // Автоматический запуск видео сразу после загрузки
  if (videoPlayer) {
    videoPlayer.play().catch(error => {
      console.error('❌ Ошибка автозапуска видео:', error);
    });
  }

  console.log('🎉 Приложение полностью инициализировано!');
  console.log('📊 Финальная проверка:');
  console.log('- Видео загружено:', videos.length > 0);
  console.log('- Кнопка описания работает:', !!descriptionButton);
  console.log('- Модальное окно готово:', !!descriptionModal);
});