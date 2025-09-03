/**
 * JavaScript модуль для страницы профиля пользователя
 * Обрабатывает вкладки профиля, создание объявлений, управление настройками
 */

document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, что мы на странице профиля
    if (!document.querySelector('.profile-container')) {
        return;
    }

    // Проверяем аутентификацию пользователя
    const isAuthenticated = window.CampusMarketplace?.user?.isAuthenticated || 
                           localStorage.getItem('campusMarketplaceUser');
    
    if (!isAuthenticated) {
        // Перенаправляем на главную страницу, если пользователь не авторизован
        window.location.href = '../index.html';
        return;
    }

    // Состояние профиля
    const ProfileState = {
        activeTab: 'overview',
        userListings: [],
        favoriteItems: [],
        conversations: [],
        reviews: [],
        createListingStep: 1,
        uploadedImages: []
    };

    // Элементы DOM
    const elements = {
        // Навигация профиля
        navItems: document.querySelectorAll('.nav-item'),
        tabContents: document.querySelectorAll('.tab-content'),
        
        // Аватар
        avatarUpload: document.getElementById('avatarUpload'),
        avatarFileInput: document.getElementById('avatarFileInput'),
        avatarImg: document.getElementById('avatarImg'),
        avatarPlaceholder: document.getElementById('avatarPlaceholder'),
        
        // Объявления
        createListingBtn: document.getElementById('createListingBtn'),
        createListingModal: document.getElementById('createListingModal'),
        createListingForm: document.getElementById('createListingForm'),
        listingsTabBtns: document.querySelectorAll('.tab-btn'),
        userListings: document.getElementById('userListings'),
        
        // Избранное
        favoriteItems: document.getElementById('favoriteItems'),
        
        // Сообщения
        conversationsList: document.getElementById('conversationsList'),
        
        // Отзывы
        reviewsList: document.getElementById('reviewsList'),
        
        // Настройки
        profileForm: document.getElementById('profileForm'),
        passwordForm: document.getElementById('passwordForm'),
        
        // Активность
        activityList: document.getElementById('activityList')
    };

    // =============================================================================
    // ИНИЦИАЛИЗАЦИЯ
    // =============================================================================

    function init() {
        // Настройка обработчиков событий
        setupEventHandlers();
        
        // Загрузка начальных данных
        loadInitialData();
        
        console.log('Profile initialized');
    }

    /**
     * Настройка всех обработчиков событий
     */
    function setupEventHandlers() {
        // Навигация по вкладкам
        elements.navItems.forEach(navItem => {
            navItem.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                switchTab(tabName);
            });
        });

        // Загрузка аватара
        if (elements.avatarUpload) {
            elements.avatarUpload.addEventListener('click', () => {
                elements.avatarFileInput.click();
            });
        }

        if (elements.avatarFileInput) {
            elements.avatarFileInput.addEventListener('change', handleAvatarUpload);
        }

        // Создание объявления
        if (elements.createListingBtn) {
            elements.createListingBtn.addEventListener('click', openCreateListingModal);
        }

        // Модальное окно создания объявления
        setupCreateListingModal();

        // Вкладки объявлений пользователя
        elements.listingsTabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                switchListingsTab(e.target.dataset.status);
            });
        });

        // Формы настроек
        if (elements.profileForm) {
            elements.profileForm.addEventListener('submit', handleProfileFormSubmit);
        }

        if (elements.passwordForm) {
            elements.passwordForm.addEventListener('submit', handlePasswordFormSubmit);
        }

        // Переключатели уведомлений
        const notificationToggles = document.querySelectorAll('.toggle input');
        notificationToggles.forEach(toggle => {
            toggle.addEventListener('change', handleNotificationToggle);
        });
    }

    // =============================================================================
    // УПРАВЛЕНИЕ ВКЛАДКАМИ
    // =============================================================================

    /**
     * Переключение активной вкладки
     */
    function switchTab(tabName) {
        ProfileState.activeTab = tabName;

        // Обновление навигации
        elements.navItems.forEach(navItem => {
            navItem.classList.toggle('active', navItem.dataset.tab === tabName);
        });

        // Обновление контента
        elements.tabContents.forEach(tabContent => {
            tabContent.classList.toggle('active', tabContent.id === `${tabName}-tab`);
        });

        // Загрузка данных для конкретной вкладки
        loadTabData(tabName);
    }

    /**
     * Загрузка данных для конкретной вкладки
     */
    async function loadTabData(tabName) {
        switch (tabName) {
            case 'overview':
                loadActivityData();
                break;
            case 'listings':
                loadUserListings();
                break;
            case 'favorites':
                loadFavoriteItems();
                break;
            case 'messages':
                loadConversations();
                break;
            case 'reviews':
                loadReviews();
                break;
            default:
                break;
        }
    }

    // =============================================================================
    // ОБЗОР ПРОФИЛЯ
    // =============================================================================

    /**
     * Загрузка данных активности пользователя
     */
    async function loadActivityData() {
        if (!elements.activityList) return;

        // Симуляция загрузки активности
        const mockActivity = [
            {
                type: 'listing_created',
                title: 'Создано новое объявление',
                description: 'Учебник по математическому анализу',
                time: '2 часа назад',
                icon: 'plus'
            },
            {
                type: 'message_received',
                title: 'Получено сообщение',
                description: 'от Александра Петрова',
                time: '5 часов назад',
                icon: 'message'
            },
            {
                type: 'review_received',
                title: 'Получен отзыв',
                description: 'Оценка: 5 звёзд',
                time: '1 день назад',
                icon: 'star'
            },
            {
                type: 'item_sold',
                title: 'Товар продан',
                description: 'Калькулятор инженерный',
                time: '3 дня назад',
                icon: 'check'
            }
        ];

        elements.activityList.innerHTML = '';
        mockActivity.forEach(activity => {
            const activityElement = createActivityItem(activity);
            elements.activityList.appendChild(activityElement);
        });
    }

    /**
     * Создание элемента активности
     */
    function createActivityItem(activity) {
        const item = document.createElement('div');
        item.className = 'activity-item';

        const iconMap = {
            plus: '<line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-width="2"/><line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2"/>',
            message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2"/>',
            star: '<polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" stroke="currentColor" stroke-width="2"/>',
            check: '<polyline points="20,6 9,17 4,12" stroke="currentColor" stroke-width="2"/>'
        };

        item.innerHTML = `
            <div class="activity-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    ${iconMap[activity.icon] || iconMap.plus}
                </svg>
            </div>
            <div class="activity-content">
                <h4>${activity.title}</h4>
                <p>${activity.description}</p>
            </div>
            <div class="activity-time">${activity.time}</div>
        `;

        return item;
    }

    // =============================================================================
    // УПРАВЛЕНИЕ ОБЪЯВЛЕНИЯМИ
    // =============================================================================

    /**
     * Загрузка объявлений пользователя
     */
    async function loadUserListings(status = 'active') {
        console.log('=== loadUserListings вызвана ===');
        console.log('Статус:', status);
        console.log('elements.userListings:', elements.userListings);
        
        if (!elements.userListings) {
            console.error('elements.userListings не найден!');
            return;
        }

        try {
            // Использование localStorage для загрузки объявлений
            const allListings = CampusMarketplaceDB.getListings();
            console.log('Все объявления из БД:', allListings);
            
            const currentUserId = CampusMarketplace.user.data.id;
            console.log('ID текущего пользователя:', currentUserId);
            
            // Фильтруем объявления по текущему пользователю
            let userListings = allListings.filter(listing => {
                // Поддерживаем как новую структуру (userId), так и старую (seller.id)
                const matchesUserId = listing.userId === currentUserId;
                const matchesSellerId = listing.seller && listing.seller.id === currentUserId;
                return matchesUserId || matchesSellerId;
            });
            console.log('Объявления пользователя (все):', userListings);
            
            // Фильтруем по статусу (если не 'all')
            if (status !== 'all') {
                userListings = userListings.filter(listing => (listing.status || 'active') === status);
                console.log('Объявления пользователя (по статусу', status, '):', userListings);
            }

            ProfileState.userListings = userListings;
            displayUserListings(userListings);
            
            // Обновляем счетчики
            updateListingCounts(allListings.filter(listing => {
                const matchesUserId = listing.userId === currentUserId;
                const matchesSellerId = listing.seller && listing.seller.id === currentUserId;
                return matchesUserId || matchesSellerId;
            }));
            
            console.log('=== loadUserListings завершена ===');
        } catch (error) {
            console.error('Error loading user listings:', error);
            CampusMarketplace.ui.showNotification('Ошибка загрузки объявлений', 'error');
        }
    }

    /**
     * Отображение объявлений пользователя
     */
    function displayUserListings(listings) {
        console.log('=== displayUserListings вызвана ===');
        console.log('Количество объявлений для отображения:', listings.length);
        console.log('Элемент userListings:', elements.userListings);
        
        elements.userListings.innerHTML = '';

        if (listings.length === 0) {
            console.log('Нет объявлений для отображения, показываем сообщение');
            elements.userListings.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    <p>У вас пока нет объявлений в этой категории</p>
                </div>
            `;
            return;
        }

        console.log('Создаем карточки для объявлений...');
        listings.forEach((listing, index) => {
            console.log(`Создание карточки ${index + 1}:`, listing);
            const card = createUserListingCard(listing);
            elements.userListings.appendChild(card);
        });
        
        console.log('=== displayUserListings завершена ===');
    }

    /**
     * Получение изображения по умолчанию для категории
     */
    function getDefaultProductImage(category) {
        const placeholders = {
            textbooks: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23f3f4f6%22/%3E%3Ctext%20x%3D%22200%22%20y%3D%22150%22%20text-anchor%3D%22middle%22%20font-family%3D%22Arial%22%20font-size%3D%2218%22%20fill%3D%22%23666%22%3E%D0%A3%D1%87%D0%B5%D0%B1%D0%BD%D0%B8%D0%BA%3C/text%3E%3C/svg%3E',
            supplies: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23fef3c7%22/%3E%3Ctext%20x%3D%22200%22%20y%3D%22150%22%20text-anchor%3D%22middle%22%20font-family%3D%22Arial%22%20font-size%3D%2218%22%20fill%3D%22%23d97706%22%3E%D0%9A%D0%B0%D0%BD%D1%86%D1%82%D0%BE%D0%B2%D0%B0%D1%80%D1%8B%3C/text%3E%3C/svg%3E',
            rental: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23dcfce7%22/%3E%3Ctext%20x%3D%22200%22%20y%3D%22150%22%20text-anchor%3D%22middle%22%20font-family%3D%22Arial%22%20font-size%3D%2218%22%20fill%3D%22%23166534%22%3E%D0%90%D1%80%D0%B5%D0%BD%D0%B4%D0%B0%3C/text%3E%3C/svg%3E',
            services: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23fee2e2%22/%3E%3Ctext%20x%3D%22200%22%20y%3D%22150%22%20text-anchor%3D%22middle%22%20font-family%3D%22Arial%22%20font-size%3D%2218%22%20fill%3D%22%23dc2626%22%3E%D0%A3%D1%81%D0%BB%D1%83%D0%B3%D0%B8%3C/text%3E%3C/svg%3E'
        };
        const placeholder = placeholders[category] || placeholders.textbooks;
        return placeholder;
    }

    /**
     * Создание карточки объявления пользователя
     */
    function createUserListingCard(listing) {
        const card = document.createElement('div');
        card.className = 'user-listing-card';
        card.dataset.listingId = listing.id;



        // Определяем изображение для карточки
        let imageUrl = '';
        if (listing.images && listing.images.length > 0) {
            if (typeof listing.images === 'string') {
                try {
                    const parsedImages = JSON.parse(listing.images);
                    imageUrl = parsedImages[0] || '';
                } catch (e) {
                    imageUrl = listing.images;
                }
            } else if (Array.isArray(listing.images)) {
                imageUrl = listing.images[0] || '';
            }
        }
        
        // Если изображения нет, используем placeholder
        if (!imageUrl) {
            imageUrl = getDefaultProductImage(listing.category);
        }

        card.innerHTML = `
            <div class="listing-image" style="background-color: var(--secondary-background);">
                <img src="${imageUrl}" alt="${listing.title}" class="listing-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="listing-placeholder" style="display: none;">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="2"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </div>

                <div class="user-listing-actions">
                    <button class="action-btn" title="Редактировать" onclick="editListing('${listing.id}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                    <button class="action-btn" title="Удалить" onclick="deleteListing('${listing.id}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <polyline points="3,6 5,6 21,6" stroke="currentColor" stroke-width="2"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="listing-content">
                <h3 class="listing-title">${listing.title}</h3>
                <p class="listing-description">${listing.description}</p>
                <div class="listing-meta">
                    <div class="listing-price">${CampusMarketplace.utils.formatPrice(listing.price)}</div>
                    <div class="listing-date">${CampusMarketplace.utils.formatDate(listing.createdAt)}</div>
                </div>
            </div>
        `;

        return card;
    }

    /**
     * Переключение вкладок объявлений
     */
    function switchListingsTab(status) {
        // Обновление активной кнопки
        elements.listingsTabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.status === status);
        });

        // Загрузка объявлений для выбранного статуса
        loadUserListings(status);
    }

    // =============================================================================
    // СОЗДАНИЕ ОБЪЯВЛЕНИЯ
    // =============================================================================

    /**
     * Настройка модального окна создания объявления
     */
    function setupCreateListingModal() {
        if (!elements.createListingModal) return;

        // Закрытие модального окна
        const closeBtn = elements.createListingModal.querySelector('#createListingModalClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeCreateListingModal);
        }

        // Навигация по шагам
        const nextStepBtn = document.getElementById('nextStepBtn');
        const prevStepBtn = document.getElementById('prevStepBtn');
        const submitBtn = document.getElementById('submitListingBtn');

        if (nextStepBtn) {
            nextStepBtn.addEventListener('click', nextCreateListingStep);
        }

        if (prevStepBtn) {
            prevStepBtn.addEventListener('click', prevCreateListingStep);
        }

        // Загрузка изображений
        const uploadImagesBtn = document.getElementById('uploadImagesBtn');
        const listingImages = document.getElementById('listingImages');

        if (uploadImagesBtn) {
            uploadImagesBtn.addEventListener('click', () => {
                listingImages.click();
            });
        }

        if (listingImages) {
            listingImages.addEventListener('change', handleImagesUpload);
        }

        // Отправка формы
        if (elements.createListingForm) {
            elements.createListingForm.addEventListener('submit', handleCreateListingSubmit);
        }
    }

    /**
     * Открытие модального окна создания объявления
     */
    function openCreateListingModal() {
        ProfileState.createListingStep = 1;
        ProfileState.uploadedImages = [];
        
        resetCreateListingForm();
        updateCreateListingStep();
        
        elements.createListingModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Закрытие модального окна создания объявления
     */
    function closeCreateListingModal() {
        elements.createListingModal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Сброс формы и состояния
        resetCreateListingForm();
        ProfileState.createListingStep = 1;
        ProfileState.uploadedImages = [];
    }

    /**
     * Следующий шаг создания объявления
     */
    function nextCreateListingStep() {
        if (validateCurrentStep()) {
            ProfileState.createListingStep++;
            updateCreateListingStep();
        }
    }

    /**
     * Предыдущий шаг создания объявления
     */
    function prevCreateListingStep() {
        ProfileState.createListingStep--;
        updateCreateListingStep();
    }

    /**
     * Обновление отображения шага создания объявления
     */
    function updateCreateListingStep() {
        const steps = elements.createListingModal.querySelectorAll('.form-step');
        const nextBtn = document.getElementById('nextStepBtn');
        const prevBtn = document.getElementById('prevStepBtn');
        const submitBtn = document.getElementById('submitListingBtn');

        // Показ/скрытие шагов
        steps.forEach((step, index) => {
            step.classList.toggle('active', index + 1 === ProfileState.createListingStep);
        });

        // Управление кнопками навигации
        if (prevBtn) {
            prevBtn.style.display = ProfileState.createListingStep > 1 ? 'block' : 'none';
        }

        if (nextBtn && submitBtn) {
            if (ProfileState.createListingStep === steps.length) {
                nextBtn.style.display = 'none';
                submitBtn.style.display = 'block';
            } else {
                nextBtn.style.display = 'block';
                submitBtn.style.display = 'none';
            }
        }
    }

    /**
     * Валидация текущего шага
     */
    function validateCurrentStep() {
        const currentStep = elements.createListingModal.querySelector(`[data-step="${ProfileState.createListingStep}"]`);
        if (!currentStep) return true;

        const requiredFields = currentStep.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.focus();
                CampusMarketplace.ui.showNotification(`Поле "${field.labels[0]?.textContent || 'обязательно'}" должно быть заполнено`, 'error');
                isValid = false;
                return;
            }
        });

        return isValid;
    }

    /**
     * Обработка загрузки изображений
     */
    async function handleImagesUpload(e) {
        const files = Array.from(e.target.files);
        const imagePreview = document.getElementById('imagePreview');

        if (!imagePreview) return;

        for (const file of files) {
            try {
                const imageUrl = await CampusMarketplace.utils.processImage(file);
                ProfileState.uploadedImages.push(imageUrl);

                // Создание превью изображения
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                previewItem.innerHTML = `
                    <img src="${imageUrl}" alt="Preview">
                    <button type="button" class="remove-image" onclick="removeImage(${ProfileState.uploadedImages.length - 1})">&times;</button>
                `;

                imagePreview.appendChild(previewItem);
            } catch (error) {
                CampusMarketplace.ui.showNotification(error.message, 'error');
            }
        }

        // Сброс input файла
        e.target.value = '';
    }

    /**
     * Удаление изображения
     */
    function removeImage(index) {
        ProfileState.uploadedImages.splice(index, 1);
        
        // Обновление превью
        const imagePreview = document.getElementById('imagePreview');
        if (imagePreview) {
            const previewItems = imagePreview.querySelectorAll('.preview-item');
            if (previewItems[index]) {
                previewItems[index].remove();
            }
        }
    }

    /**
     * Обработка отправки формы создания объявления
     */
    function handleCreateListingSubmit(e) {
        e.preventDefault();

        if (!validateCurrentStep()) return;

        const formData = new FormData(elements.createListingForm);
        const listingData = {
            title: formData.get('title'),
            category: formData.get('category'),
            condition: formData.get('condition'),
            price: parseInt(formData.get('price')),
            description: formData.get('description'),
            images: ProfileState.uploadedImages,
            status: 'active'
        };

        try {
            // Проверяем, что пользователь авторизован
            const currentUser = CampusMarketplaceDB.getCurrentUser();
            if (!currentUser) {
                alert('Для добавления объявления необходимо войти в систему');
                closeCreateListingModal();
                return;
            }

            // Добавляем объявление в базу данных
            const newListing = CampusMarketplaceDB.addListing({
                ...listingData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                global: true // Делаем объявление глобальным
            });

            console.log('Объявление добавлено:', newListing);

            // Закрываем модальное окно
            closeCreateListingModal();

            // Показываем уведомление
            if (CampusMarketplace.ui && CampusMarketplace.ui.showNotification) {
                CampusMarketplace.ui.showNotification('Объявление успешно создано!', 'success');
            } else {
                alert('Объявление успешно создано!');
            }

            // Обновление списка объявлений пользователя
            loadUserListings();
        } catch (error) {
            console.error('Error creating listing:', error);
            if (CampusMarketplace.ui && CampusMarketplace.ui.showNotification) {
                CampusMarketplace.ui.showNotification('Ошибка создания объявления', 'error');
            } else {
                alert('Ошибка создания объявления: ' + error.message);
            }
        }
    }

    /**
     * Сброс формы создания объявления
     */
    function resetCreateListingForm() {
        if (elements.createListingForm) {
            elements.createListingForm.reset();
        }

        const imagePreview = document.getElementById('imagePreview');
        if (imagePreview) {
            imagePreview.innerHTML = '';
        }

        ProfileState.uploadedImages = [];
    }

    // =============================================================================
    // ИЗБРАННОЕ
    // =============================================================================

    /**
     * Загрузка избранных товаров
     */
    async function loadFavoriteItems() {
        if (!elements.favoriteItems) return;

        try {
            // Симуляция загрузки избранного
            const mockFavorites = await generateMockFavorites();
            ProfileState.favoriteItems = mockFavorites;

            displayFavoriteItems(mockFavorites);
        } catch (error) {
            console.error('Error loading favorites:', error);
        }
    }

    /**
     * Отображение избранных товаров
     */
    function displayFavoriteItems(favorites) {
        elements.favoriteItems.innerHTML = '';

        if (favorites.length === 0) {
            elements.favoriteItems.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    <p>В избранном пока нет товаров</p>
                </div>
            `;
            return;
        }

        favorites.forEach(item => {
            const favoriteItem = document.createElement('div');
            favoriteItem.className = 'favorite-item';
            
            const listingCard = CampusMarketplace.ui.createListingCard(item);
            
            // Добавляем кнопку удаления из избранного
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-favorite';
            removeBtn.innerHTML = '&times;';
            removeBtn.addEventListener('click', () => removeFavorite(item.id));
            
            listingCard.appendChild(removeBtn);
            favoriteItem.appendChild(listingCard);
            elements.favoriteItems.appendChild(favoriteItem);
        });
    }

    /**
     * Удаление из избранного
     */
    function removeFavorite(itemId) {
        ProfileState.favoriteItems = ProfileState.favoriteItems.filter(item => item.id !== itemId);
        displayFavoriteItems(ProfileState.favoriteItems);
        CampusMarketplace.ui.showNotification('Товар удален из избранного', 'info');
    }

    // =============================================================================
    // СООБЩЕНИЯ
    // =============================================================================

    /**
     * Загрузка разговоров
     */
    async function loadConversations() {
        if (!elements.conversationsList) return;

        // Симуляция загрузки разговоров
        const mockConversations = [
            {
                id: 1,
                name: 'Александр Петров',
                lastMessage: 'Товар еще актуален?',
                time: '10:30',
                unread: true
            },
            {
                id: 2,
                name: 'Мария Сидорова',
                lastMessage: 'Спасибо за быструю доставку!',
                time: 'Вчера',
                unread: false
            },
            {
                id: 3,
                name: 'Дмитрий Иванов',
                lastMessage: 'Можно встретиться завтра?',
                time: '15 мар',
                unread: false
            }
        ];

        elements.conversationsList.innerHTML = '';
        mockConversations.forEach(conversation => {
            const conversationElement = createConversationItem(conversation);
            elements.conversationsList.appendChild(conversationElement);
        });
    }

    /**
     * Создание элемента разговора
     */
    function createConversationItem(conversation) {
        const item = document.createElement('div');
        item.className = `conversation-item ${conversation.unread ? 'unread' : ''}`;
        item.dataset.conversationId = conversation.id;

        item.innerHTML = `
            <div class="conversation-avatar"></div>
            <div class="conversation-info">
                <div class="conversation-name">${conversation.name}</div>
                <div class="conversation-preview">${conversation.lastMessage}</div>
            </div>
            <div class="conversation-time">${conversation.time}</div>
        `;

        item.addEventListener('click', () => {
            // Здесь можно открыть конкретный разговор
            console.log('Open conversation:', conversation.id);
        });

        return item;
    }

    // =============================================================================
    // ОТЗЫВЫ
    // =============================================================================

    /**
     * Загрузка отзывов
     */
    async function loadReviews() {
        if (!elements.reviewsList) return;

        // Симуляция загрузки отзывов
        const mockReviews = [
            {
                id: 1,
                author: 'Елена Козлова',
                rating: 5,
                date: '2024-03-15',
                text: 'Отличный продавец! Товар полностью соответствует описанию, быстрая доставка.'
            },
            {
                id: 2,
                author: 'Михаил Волков',
                rating: 5,
                date: '2024-03-10',
                text: 'Все супер! Учебник в отличном состоянии, цена адекватная.'
            },
            {
                id: 3,
                author: 'Анна Смирнова',
                rating: 4,
                date: '2024-03-05',
                text: 'Хорошее качество, быстрая сделка. Рекомендую!'
            }
        ];

        elements.reviewsList.innerHTML = '';
        mockReviews.forEach(review => {
            const reviewElement = createReviewItem(review);
            elements.reviewsList.appendChild(reviewElement);
        });
    }

    /**
     * Создание элемента отзыва
     */
    function createReviewItem(review) {
        const item = document.createElement('div');
        item.className = 'review-item';

        const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);

        item.innerHTML = `
            <div class="review-header">
                <div class="review-author">
                    <div class="review-avatar"></div>
                    <div class="review-info">
                        <h5>${review.author}</h5>
                        <div class="review-rating">${stars}</div>
                    </div>
                </div>
                <div class="review-date">${CampusMarketplace.utils.formatDate(review.date)}</div>
            </div>
            <div class="review-content">
                <p>${review.text}</p>
            </div>
        `;

        return item;
    }

    // =============================================================================
    // НАСТРОЙКИ
    // =============================================================================

    /**
     * Обработка загрузки аватара
     */
    async function handleAvatarUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const imageUrl = await CampusMarketplace.utils.processImage(file);
            
            // Обновление отображения аватара
            if (elements.avatarImg && elements.avatarPlaceholder) {
                elements.avatarImg.src = imageUrl;
                elements.avatarImg.style.display = 'block';
                elements.avatarPlaceholder.style.display = 'none';
            }

            CampusMarketplace.ui.showNotification('Аватар успешно обновлен!', 'success');
        } catch (error) {
            CampusMarketplace.ui.showNotification(error.message, 'error');
        }
    }

    /**
     * Обработка отправки формы профиля
     */
    function handleProfileFormSubmit(e) {
        e.preventDefault();

        const formData = new FormData(elements.profileForm);
        const profileData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            university: formData.get('university'),
            bio: formData.get('bio')
        };

        // Валидация email
        if (!CampusMarketplace.utils.validateEmail(profileData.email)) {
            CampusMarketplace.ui.showNotification('Некорректный email адрес', 'error');
            return;
        }

        // Симуляция сохранения данных
        setTimeout(() => {
            CampusMarketplace.ui.showNotification('Профиль успешно обновлен!', 'success');
            
            // Обновление отображения имени пользователя
            const userName = document.getElementById('userName');
            if (userName) {
                userName.textContent = `${profileData.firstName} ${profileData.lastName}`;
            }
        }, 500);
    }

    /**
     * Обработка отправки формы смены пароля
     */
    function handlePasswordFormSubmit(e) {
        e.preventDefault();

        const formData = new FormData(elements.passwordForm);
        const passwordData = {
            currentPassword: formData.get('currentPassword'),
            newPassword: formData.get('newPassword'),
            confirmPassword: formData.get('confirmPassword')
        };

        // Валидация паролей
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            CampusMarketplace.ui.showNotification('Пароли не совпадают', 'error');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            CampusMarketplace.ui.showNotification('Пароль должен содержать минимум 6 символов', 'error');
            return;
        }

        // Симуляция смены пароля
        setTimeout(() => {
            CampusMarketplace.ui.showNotification('Пароль успешно изменен!', 'success');
            elements.passwordForm.reset();
        }, 500);
    }

    /**
     * Обработка переключателей уведомлений
     */
    function handleNotificationToggle(e) {
        const notificationType = e.target.name;
        const isEnabled = e.target.checked;

        // Симуляция сохранения настроек
        setTimeout(() => {
            const status = isEnabled ? 'включены' : 'отключены';
            console.log(`Уведомления ${notificationType} ${status}`);
        }, 100);
    }

    // =============================================================================
    // ЗАГРУЗКА ДАННЫХ
    // =============================================================================

    /**
     * Проверка версии данных и автоматическая синхронизация
     */
    async function checkDataVersionAndSync() {
        const currentVersion = '1.0.0'; // Текущая версия структуры данных
        const savedVersion = localStorage.getItem('campusMarketplaceDataVersion');
        
        console.log('=== Проверка версии данных ===');
        console.log('Текущая версия:', currentVersion);
        console.log('Сохраненная версия:', savedVersion);
        
        // Если версия не совпадает или данных нет, синхронизируем
        if (savedVersion !== currentVersion) {
            console.log('Версия данных устарела, выполняем синхронизацию...');
            
            try {
                // Показываем уведомление пользователю
                if (window.CampusMarketplace && window.CampusMarketplace.ui) {
                    window.CampusMarketplace.ui.showNotification('Обновление данных...', 'info');
                }
                
                // Синхронизируем данные
                CampusMarketplaceDB.forceSyncData();
                
                // Сохраняем новую версию
                localStorage.setItem('campusMarketplaceDataVersion', currentVersion);
                
                console.log('Данные успешно синхронизированы');
                
                // Показываем уведомление об успехе
                if (window.CampusMarketplace && window.CampusMarketplace.ui) {
                    window.CampusMarketplace.ui.showNotification('Данные обновлены', 'success');
                }
                
            } catch (error) {
                console.error('Ошибка при синхронизации данных:', error);
                
                // Показываем уведомление об ошибке
                if (window.CampusMarketplace && window.CampusMarketplace.ui) {
                    window.CampusMarketplace.ui.showNotification('Ошибка обновления данных', 'error');
                }
            }
        } else {
            console.log('Версия данных актуальна');
        }
    }

    /**
     * Загрузка начальных данных
     */
    async function loadInitialData() {
        // Проверяем версию данных и синхронизируем при необходимости
        await checkDataVersionAndSync();
        
        // Загрузка профиля из базы данных
        loadProfileFromDatabase();
        
        // Загрузка данных для активной вкладки
        loadTabData(ProfileState.activeTab);
        
        // Явно загружаем активные объявления пользователя
        await loadUserListings('active');
        
        // Обновление счетчика сообщений
        updateMessageCount();
        
        // Обновление рейтинга профиля
        updateProfileRating();
        
        // Обновление счетчиков объявлений в табах
        updateListingTabCounts();
    }

    // =============================================================================
    // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
    // =============================================================================

    /**
     * Генерация mock данных для объявлений пользователя
     */
    async function generateMockUserListings(status) {
        const listings = [
            {
                id: 'user-listing-1',
                title: 'Учебник по математическому анализу',
                description: 'Отличное состояние, все страницы целые',
                price: 1500,
                status: 'active',
                createdAt: new Date('2024-03-01')
            },
            {
                id: 'user-listing-2',
                title: 'Калькулятор инженерный',
                description: 'Casio FX-991ES PLUS, в коробке',
                price: 2500,
                status: 'sold',
                createdAt: new Date('2024-02-15')
            },
            {
                id: 'user-listing-3',
                title: 'Набор чертежных инструментов',
                description: 'Полный набор для технического черчения',
                price: 800,
                status: 'draft',
                createdAt: new Date('2024-03-10')
            }
        ];

        return listings.filter(listing => status === 'all' || listing.status === status);
    }

    /**
     * Генерация mock данных для избранного
     */
    async function generateMockFavorites() {
        return [
            {
                id: 'fav-1',
                title: 'Ноутбук Dell для учёбы',
                description: 'Intel i5, 8GB RAM, отличное состояние',
                price: 35000,
                category: 'rental',
                condition: 'excellent',
                images: [],
                seller: {
                    id: 'seller-1',
                    name: 'Анна Петрова',
                    rating: 4.9,
                    reviewsCount: 15
                },
                createdAt: new Date('2024-03-01')
            },
            {
                id: 'fav-2',
                title: 'Репетиторство по физике',
                description: 'Подготовка к экзаменам, опыт 5 лет',
                price: 1000,
                category: 'services',
                condition: 'new',
                images: [],
                seller: {
                    id: 'seller-2',
                    name: 'Дмитрий Сидоров',
                    rating: 5.0,
                    reviewsCount: 28
                },
                createdAt: new Date('2024-02-28')
            }
        ];
    }

    // Глобальные функции для использования в HTML
    window.editListing = function(listingId) {
        console.log('Edit listing:', listingId);
        CampusMarketplace.ui.showNotification('Функция редактирования в разработке', 'info');
    };

    window.deleteListing = function(listingId) {
        if (confirm('Вы уверены, что хотите удалить это объявление?')) {
            try {
                CampusMarketplace.storage.deleteListing(listingId);
                CampusMarketplace.ui.showNotification('Объявление удалено', 'success');
                loadUserListings();
            } catch (error) {
                console.error('Error deleting listing:', error);
                CampusMarketplace.ui.showNotification('Ошибка при удалении объявления', 'error');
            }
        }
    };

    window.removeImage = removeImage;

    // =============================================================================
    // БАЗА ДАННЫХ И СОХРАНЕНИЕ
    // =============================================================================

    /**
     * Загрузка профиля из базы данных
     */
    function loadProfileFromDatabase() {
        // Получаем данные пользователя из localStorage или CampusMarketplace
        let profile = null;
        
        if (window.CampusMarketplace?.user?.data) {
            profile = window.CampusMarketplace.user.data;
        } else {
            const savedUser = localStorage.getItem('campusMarketplaceUser');
            if (savedUser) {
                try {
                    profile = JSON.parse(savedUser);
                } catch (error) {
                    console.error('Error parsing user data:', error);
                }
            }
        }
        
        // Если профиль не найден, перенаправляем на главную страницу
        if (!profile) {
            console.log('Профиль не найден, перенаправляем на главную страницу');
            window.location.href = '../index.html';
            return;
        }
        
        console.log('Загружен профиль:', profile);
        
        // Обновление UI профиля
        const userName = document.getElementById('userName');
        if (userName) {
            // Используем поле name из базы данных
            userName.textContent = profile.name || `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
        }

        // Обновление статистики
        updateProfileStats(profile);

        // Заполнение формы настроек
        if (elements.profileForm) {
            const firstNameField = elements.profileForm.querySelector('#firstName');
            const lastNameField = elements.profileForm.querySelector('#lastName');
            const emailField = elements.profileForm.querySelector('#email');
            const phoneField = elements.profileForm.querySelector('#phone');
            const bioField = elements.profileForm.querySelector('#bio');

            // Используем данные из базы данных
            if (firstNameField) firstNameField.value = profile.firstName || profile.name?.split(' ')[0] || '';
            if (lastNameField) lastNameField.value = profile.lastName || profile.name?.split(' ')[1] || '';
            if (emailField) emailField.value = profile.email || '';
            if (phoneField) phoneField.value = profile.phone || '';
            if (bioField) bioField.value = profile.bio || '';
        }

        // Обновление аватара
        if (profile.avatar && elements.avatarImg) {
            elements.avatarImg.src = profile.avatar;
            elements.avatarImg.style.display = 'block';
            elements.avatarPlaceholder.style.display = 'none';
        }
    }

    /**
     * Обновление статистики профиля
     */
    function updateProfileStats(profile) {
        // Получаем объявления пользователя из базы данных
        let userListings = [];
        if (window.CampusMarketplaceDB) {
            userListings = CampusMarketplaceDB.getUserListings(profile.id);
            console.log('Объявления пользователя из БД:', userListings);
        } else {
            // Fallback на старую систему
            userListings = CampusMarketplaceDB.getListings().filter(listing => {
                // Поддерживаем как новую структуру (userName), так и старую (seller.email)
                const matchesUserName = listing.userName === profile.name;
                const matchesSellerEmail = listing.seller && listing.seller.email === profile.email;
                return matchesUserName || matchesSellerEmail;
            });
        }

        // Подсчитываем статистику
        const stats = {
            totalListings: userListings.length,
            activeListings: userListings.filter(l => l.status === 'active').length,
            soldListings: userListings.filter(l => l.status === 'sold').length,
            totalEarnings: userListings
                .filter(l => l.status === 'sold')
                .reduce((sum, l) => sum + l.price, 0),
            averageRating: profile.rating || 4.8,
            totalReviews: profile.reviews || 0
        };

        // Обновляем элементы статистики
        const statsElements = {
            totalListings: document.getElementById('totalListings'),
            activeListings: document.getElementById('activeListings'),
            soldListings: document.getElementById('soldListings'),
            totalEarnings: document.getElementById('totalEarnings'),
            averageRating: document.getElementById('averageRating'),
            totalReviews: document.getElementById('totalReviews')
        };

        Object.keys(statsElements).forEach(key => {
            const element = statsElements[key];
            if (element) {
                if (key === 'totalEarnings') {
                    element.textContent = CampusMarketplace.utils.formatPrice(stats[key]);
                } else if (key === 'averageRating') {
                    element.textContent = stats[key].toFixed(1);
                } else {
                    element.textContent = stats[key];
                }
            }
        });
    }

    /**
     * Обновление счетчика сообщений
     */
    function updateMessageCount() {
        const messageCountElement = document.getElementById('messageCount');
        if (!messageCountElement) return;
        
        try {
            // Получаем текущего пользователя
            const currentUser = CampusMarketplaceDB.getCurrentUser();
            if (!currentUser) {
                // Если пользователь не авторизован, скрываем счетчик
                messageCountElement.style.display = 'none';
                return;
            }
            
            // Получаем непрочитанные сообщения пользователя
            const messages = CampusMarketplaceDB.getUserMessages(currentUser.id);
            const unreadCount = messages.filter(message => 
                !message.read && message.receiverId === currentUser.id
            ).length;
            
            // Обновляем счетчик
            if (unreadCount > 0) {
                messageCountElement.textContent = unreadCount;
                messageCountElement.style.display = 'inline';
            } else {
                messageCountElement.textContent = '';
                messageCountElement.style.display = 'none';
            }
            
            console.log('Счетчик сообщений обновлен:', unreadCount);
            
        } catch (error) {
            console.error('Ошибка при обновлении счетчика сообщений:', error);
            // В случае ошибки скрываем счетчик
            messageCountElement.style.display = 'none';
        }
    }

    /**
     * Обновление рейтинга профиля
     */
    function updateProfileRating() {
        try {
            // Получаем текущего пользователя
            const currentUser = CampusMarketplaceDB.getCurrentUser();
            if (!currentUser) {
                // Если пользователь не авторизован, показываем значения по умолчанию
                updateRatingElements(0, 0);
                return;
            }
            
            // Получаем отзывы пользователя (пока используем mock данные)
            // TODO: Добавить функцию getUserReviews в базу данных
            const mockReviews = [
                { rating: 5 },
                { rating: 4 },
                { rating: 5 }
            ];
            const totalReviews = mockReviews.length;
            
            if (totalReviews === 0) {
                // Если отзывов нет, показываем значения по умолчанию
                updateRatingElements(0, 0);
                return;
            }
            
            // Вычисляем средний рейтинг
            const totalRating = mockReviews.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = totalRating / totalReviews;
            
            // Обновляем элементы рейтинга
            updateRatingElements(averageRating, totalReviews);
            
            console.log('Рейтинг профиля обновлен:', { averageRating, totalReviews });
            
        } catch (error) {
            console.error('Ошибка при обновлении рейтинга профиля:', error);
            // В случае ошибки показываем значения по умолчанию
            updateRatingElements(0, 0);
        }
    }

    /**
     * Обновление элементов рейтинга
     */
    function updateRatingElements(rating, reviewCount) {
        // Обновляем боковую панель профиля
        const profileRatingValue = document.getElementById('profileRatingValue');
        const profileRatingCount = document.getElementById('profileRatingCount');
        const profileRatingStars = document.getElementById('profileRatingStars');
        
        if (profileRatingValue) {
            profileRatingValue.textContent = rating.toFixed(1);
        }
        
        if (profileRatingCount) {
            if (reviewCount === 0) {
                profileRatingCount.textContent = '(0 отзывов)';
            } else if (reviewCount === 1) {
                profileRatingCount.textContent = '(1 отзыв)';
            } else if (reviewCount < 5) {
                profileRatingCount.textContent = `(${reviewCount} отзыва)`;
            } else {
                profileRatingCount.textContent = `(${reviewCount} отзывов)`;
            }
        }
        
        if (profileRatingStars) {
            profileRatingStars.innerHTML = '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
        }
        
        // Обновляем раздел отзывов
        const overallRatingNumber = document.getElementById('overallRatingNumber');
        const overallRatingCount = document.getElementById('overallRatingCount');
        const overallRatingStars = document.getElementById('overallRatingStars');
        
        if (overallRatingNumber) {
            overallRatingNumber.textContent = rating.toFixed(1);
        }
        
        if (overallRatingCount) {
            if (reviewCount === 0) {
                overallRatingCount.textContent = 'Основано на 0 отзывах';
            } else if (reviewCount === 1) {
                overallRatingCount.textContent = 'Основано на 1 отзыве';
            } else if (reviewCount < 5) {
                overallRatingCount.textContent = `Основано на ${reviewCount} отзывах`;
            } else {
                overallRatingCount.textContent = `Основано на ${reviewCount} отзывах`;
            }
        }
        
        if (overallRatingStars) {
            overallRatingStars.innerHTML = '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
        }
    }

    /**
     * Обновление счетчиков объявлений по категориям
     */
    function updateListingCounts(userListings) {
        // Подсчет объявлений по категориям
        const counts = {
            all: userListings.length,
            active: userListings.filter(l => l.status === 'active').length,
            sold: userListings.filter(l => l.status === 'sold').length,
            draft: userListings.filter(l => l.status === 'draft').length,
            textbooks: userListings.filter(l => l.category === 'textbooks').length,
            supplies: userListings.filter(l => l.category === 'supplies').length,
            rental: userListings.filter(l => l.category === 'rental').length,
            services: userListings.filter(l => l.category === 'services').length
        };

        // Обновление счетчиков в табах
        elements.listingsTabBtns.forEach(btn => {
            const status = btn.dataset.status;
            const count = counts[status] || 0;
            
            const statusText = {
                'all': 'Все',
                'active': 'Активные',
                'sold': 'Проданные',
                'draft': 'Черновики',
                'archived': 'Архив'
            };
            
            const text = statusText[status] || status;
            btn.textContent = `${text} (${count})`;
        });
    }

    /**
     * Обновление счетчиков в табах объявлений
     */
    function updateListingTabCounts() {
        try {
            // Получаем текущего пользователя
            const currentUser = CampusMarketplaceDB.getCurrentUser();
            if (!currentUser) {
                // Если пользователь не авторизован, показываем нули
                updateListingTabCountsDisplay([0, 0, 0, 0]);
                return;
            }
            
            // Получаем объявления пользователя
            const userListings = CampusMarketplaceDB.getUserListings(currentUser.id);
            
            // Подсчитываем количество по статусам
            const counts = {
                active: userListings.filter(l => l.status === 'active').length,
                sold: userListings.filter(l => l.status === 'sold').length,
                draft: userListings.filter(l => l.status === 'draft').length,
                archived: userListings.filter(l => l.status === 'archived').length
            };
            
            // Обновляем отображение счетчиков
            updateListingTabCountsDisplay([
                counts.active,
                counts.sold,
                counts.draft,
                counts.archived
            ]);
            
            console.log('Счетчики объявлений обновлены:', counts);
            
        } catch (error) {
            console.error('Ошибка при обновлении счетчиков объявлений:', error);
            // В случае ошибки показываем нули
            updateListingTabCountsDisplay([0, 0, 0, 0]);
        }
    }

    /**
     * Обновление отображения счетчиков в табах объявлений
     */
    function updateListingTabCountsDisplay(counts) {
        const tabButtons = document.querySelectorAll('.listings-tabs .tab-btn');
        
        if (tabButtons.length >= 4) {
            const statusTexts = ['Активные', 'Проданные', 'Черновики', 'Архив'];
            
            tabButtons.forEach((btn, index) => {
                if (index < counts.length) {
                    const count = counts[index];
                    const statusText = statusTexts[index];
                    btn.textContent = `${statusText} (${count})`;
                }
            });
        }
    }

    /**
     * Обработка загрузки аватара
     */
    async function handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            // Проверяем размер файла (максимум 5MB)
            if (file.size > 5 * 1024 * 1024) {
                CampusMarketplace.ui.showNotification('Размер файла не должен превышать 5MB', 'error');
                return;
            }

            // Проверяем тип файла
            if (!file.type.startsWith('image/')) {
                CampusMarketplace.ui.showNotification('Пожалуйста, выберите изображение', 'error');
                return;
            }

            // Конвертируем в base64
            const base64 = await CampusMarketplace.utils.processImage(file);
            
            // Получаем текущего пользователя
            const currentUser = CampusMarketplaceDB.getCurrentUser();
            if (!currentUser) {
                CampusMarketplace.ui.showNotification('Пользователь не авторизован', 'error');
                return;
            }

            // Обновляем аватар в базе данных
            CampusMarketplaceDB.updateUserAvatar(currentUser.id, base64);
            
            // Обновляем отображение
            updateAvatarDisplay(base64);
            
            // Показываем уведомление об успехе
            CampusMarketplace.ui.showNotification('Аватар успешно обновлен!', 'success');
            
        } catch (error) {
            console.error('Ошибка при загрузке аватара:', error);
            CampusMarketplace.ui.showNotification('Ошибка при загрузке аватара', 'error');
        }
    }

    /**
     * Обновление отображения аватара
     */
    function updateAvatarDisplay(avatarData) {
        const avatarImg = document.getElementById('avatarImg');
        const avatarPlaceholder = document.getElementById('avatarPlaceholder');
        
        if (avatarImg && avatarPlaceholder) {
            avatarImg.src = avatarData;
            avatarImg.style.display = 'block';
            avatarPlaceholder.style.display = 'none';
        }
    }

    // =============================================================================
    // ВЫХОД ИЗ ПРОФИЛЯ
    // =============================================================================

    /**
     * Обработка выхода из профиля
     */
    function handleLogout() {
        if (confirm('Вы уверены, что хотите выйти?')) {
            // Очистка данных пользователя
            if (typeof CampusMarketplace !== 'undefined') {
                CampusMarketplace.user.isAuthenticated = false;
                CampusMarketplace.user.data = null;
            }
            
            // Очистка localStorage (опционально)
            localStorage.removeItem('campusMarketplaceUser');
            
            // Перенаправление на главную страницу
            window.location.href = '../index.html';
        }
    }

    // Добавляем обработчик выхода
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }

    // Добавляем обработчик загрузки аватара
    const avatarUpload = document.getElementById('avatarUpload');
    if (avatarUpload) {
        avatarUpload.addEventListener('click', () => {
            const avatarInput = document.createElement('input');
            avatarInput.type = 'file';
            avatarInput.accept = 'image/*';
            avatarInput.onchange = handleAvatarUpload;
            avatarInput.click();
        });
    }

    // Запуск инициализации
    init();

    // Экспорт для использования в других модулях
    window.ProfileModule = {
        switchTab,
        loadUserListings,
        handleLogout,
        updateMessageCount,
        state: ProfileState
    };
});
