/**
 * JavaScript модуль для расширенной функциональности фильтров
 * Дополняет основную функциональность каталога специфичными для фильтров методами
 */

document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, что мы на странице каталога
    if (!document.getElementById('productsGrid')) {
        return;
    }

    // Состояние фильтров
    const FiltersState = {
        savedFilters: {},
        filterPresets: {},
        isInitialized: false
    };

    // =============================================================================
    // ИНИЦИАЛИЗАЦИЯ
    // =============================================================================

    function init() {
        // Загрузка сохраненных фильтров
        loadSavedFilters();
        
        // Настройка дополнительных обработчиков
        setupAdvancedFilters();
        
        // Создание пресетов фильтров
        createFilterPresets();
        
        FiltersState.isInitialized = true;
        console.log('Advanced filters initialized');
    }

    /**
     * Загрузка сохраненных фильтров из localStorage
     */
    function loadSavedFilters() {
        const savedFilters = localStorage.getItem('campusMarketplaceFilters');
        if (savedFilters) {
            try {
                FiltersState.savedFilters = JSON.parse(savedFilters);
                applySavedFilters();
            } catch (error) {
                console.error('Error loading saved filters:', error);
            }
        }
    }

    /**
     * Применение сохраненных фильтров
     */
    function applySavedFilters() {
        const filters = FiltersState.savedFilters;
        
        // Применение только если пользователь не пришел с параметрами URL
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.toString()) {
            return; // URL параметры имеют приоритет
        }

        // Применение сохраненных фильтров к UI
        if (filters.category) {
            const categoryRadio = document.querySelector(`input[name="category"][value="${filters.category}"]`);
            if (categoryRadio) categoryRadio.checked = true;
        }

        if (filters.minPrice) {
            const priceMin = document.getElementById('priceMin');
            if (priceMin) priceMin.value = filters.minPrice;
        }

        if (filters.maxPrice) {
            const priceMax = document.getElementById('priceMax');
            if (priceMax) priceMax.value = filters.maxPrice;
        }

        if (filters.condition && filters.condition.length > 0) {
            filters.condition.forEach(condition => {
                const checkbox = document.querySelector(`input[name="condition"][value="${condition}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }

        if (filters.university) {
            const universitySelect = document.getElementById('universityFilter');
            if (universitySelect) universitySelect.value = filters.university;
        }
    }

    /**
     * Настройка дополнительных фильтров
     */
    function setupAdvancedFilters() {
        // Кнопка сохранения фильтров
        createSaveFiltersButton();
        
        // Быстрые фильтры
        createQuickFilters();
        
        // Расширенные опции
        setupAdvancedOptions();
        
        // Автосохранение фильтров
        setupAutoSave();
    }

    // =============================================================================
    // СОХРАНЕНИЕ И ЗАГРУЗКА ФИЛЬТРОВ
    // =============================================================================

    /**
     * Создание кнопки сохранения фильтров
     */
    function createSaveFiltersButton() {
        const filtersHeader = document.querySelector('.filters-header');
        if (!filtersHeader) return;

        const saveBtn = document.createElement('button');
        saveBtn.className = 'save-filters-btn';
        saveBtn.innerHTML = '💾';
        saveBtn.title = 'Сохранить фильтры';
        saveBtn.style.cssText = `
            background: none;
            border: none;
            cursor: pointer;
            font-size: 16px;
            padding: 4px;
            margin-left: 8px;
            opacity: 0.7;
            transition: opacity 0.2s ease;
        `;

        saveBtn.addEventListener('mouseover', () => saveBtn.style.opacity = '1');
        saveBtn.addEventListener('mouseout', () => saveBtn.style.opacity = '0.7');
        saveBtn.addEventListener('click', saveCurrentFilters);

        filtersHeader.appendChild(saveBtn);
    }

    /**
     * Сохранение текущих фильтров
     */
    function saveCurrentFilters() {
        if (!window.CatalogModule) return;

        const currentFilters = window.CatalogModule.state.currentFilters;
        
        // Исключаем поиск и страницу из сохраненных фильтров
        const filtersToSave = {
            category: currentFilters.category,
            minPrice: currentFilters.minPrice,
            maxPrice: currentFilters.maxPrice,
            condition: currentFilters.condition,
            rating: currentFilters.rating,
            university: currentFilters.university,
            sort: currentFilters.sort
        };

        FiltersState.savedFilters = filtersToSave;
        localStorage.setItem('campusMarketplaceFilters', JSON.stringify(filtersToSave));
        
        CampusMarketplace.ui.showNotification('Фильтры сохранены', 'success');
    }

    /**
     * Автосохранение фильтров
     */
    function setupAutoSave() {
        // Сохранение фильтров при их изменении (с задержкой)
        let saveTimeout;
        
        const autoSave = () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(saveCurrentFilters, 2000); // Сохранение через 2 секунды после последнего изменения
        };

        // Отслеживание изменений фильтров
        const filterElements = [
            ...document.querySelectorAll('input[name="category"]'),
            ...document.querySelectorAll('input[name="condition"]'),
            document.getElementById('priceMin'),
            document.getElementById('priceMax'),
            document.getElementById('universityFilter'),
            document.getElementById('sortSelect')
        ].filter(el => el);

        filterElements.forEach(element => {
            element.addEventListener('change', autoSave);
            if (element.type === 'number') {
                element.addEventListener('input', autoSave);
            }
        });
    }

    // =============================================================================
    // БЫСТРЫЕ ФИЛЬТРЫ
    // =============================================================================

    /**
     * Создание быстрых фильтров
     */
    function createQuickFilters() {
        const sidebar = document.querySelector('.filters-sidebar');
        if (!sidebar) return;

        const quickFiltersSection = document.createElement('div');
        quickFiltersSection.className = 'filter-section quick-filters';
        quickFiltersSection.innerHTML = `
            <h4>Быстрые фильтры</h4>
            <div class="quick-filters-grid">
                <button class="quick-filter-btn" data-filter="new-cheap">
                    💰 Дешево и новое
                </button>
                <button class="quick-filter-btn" data-filter="textbooks-used">
                    📚 Учебники б/у
                </button>
                <button class="quick-filter-btn" data-filter="rental-electronics">
                    💻 Электроника в аренду
                </button>
                <button class="quick-filter-btn" data-filter="high-rated-sellers">
                    ⭐ Лучшие продавцы
                </button>
            </div>
        `;

        // Добавление стилей для быстрых фильтров
        const style = document.createElement('style');
        style.textContent = `
            .quick-filters-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
                margin-top: 12px;
            }

            .quick-filter-btn {
                background: linear-gradient(135deg, var(--secondary-background) 0%, var(--white) 100%);
                border: 1px solid var(--border-color);
                border-radius: var(--border-radius-sm);
                padding: 8px 12px;
                font-size: 12px;
                cursor: pointer;
                transition: all var(--transition-fast);
                text-align: center;
                line-height: 1.2;
            }

            .quick-filter-btn:hover {
                background: var(--primary-color);
                color: var(--white);
                transform: translateY(-1px);
                box-shadow: var(--shadow-sm);
            }

            @media (max-width: 768px) {
                .quick-filters-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(style);

        // Добавление обработчиков
        const quickFilterBtns = quickFiltersSection.querySelectorAll('.quick-filter-btn');
        quickFilterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filterType = btn.dataset.filter;
                applyQuickFilter(filterType);
            });
        });

        // Вставка в начало сайдбара (после заголовка фильтров)
        const filtersHeader = sidebar.querySelector('.filters-header');
        if (filtersHeader && filtersHeader.nextSibling) {
            sidebar.insertBefore(quickFiltersSection, filtersHeader.nextSibling);
        }
    }

    /**
     * Применение быстрого фильтра
     */
    function applyQuickFilter(filterType) {
        if (!window.CatalogModule) return;

        // Сброс текущих фильтров
        window.CatalogModule.clearAllFilters();

        // Применение быстрого фильтра
        switch (filterType) {
            case 'new-cheap':
                // Новые товары до 1000 рублей
                document.querySelector('input[name="condition"][value="new"]').checked = true;
                document.getElementById('priceMax').value = '1000';
                break;

            case 'textbooks-used':
                // Б/у учебники
                document.querySelector('input[name="category"][value="textbooks"]').checked = true;
                document.querySelector('input[name="condition"][value="good"]').checked = true;
                document.querySelector('input[name="condition"][value="excellent"]').checked = true;
                break;

            case 'rental-electronics':
                // Электроника в аренду
                document.querySelector('input[name="category"][value="rental"]').checked = true;
                break;

            case 'high-rated-sellers':
                // Продавцы с высоким рейтингом
                const ratingBtn = document.querySelector('.rating-btn[data-rating="5"]');
                if (ratingBtn) ratingBtn.click();
                break;
        }

        // Обновление каталога
        setTimeout(() => {
            if (window.CatalogModule && window.CatalogModule.loadProducts) {
                // Обновление состояния фильтров
                updateCatalogFiltersFromUI();
                window.CatalogModule.loadProducts();
            }
        }, 100);

        CampusMarketplace.ui.showNotification(`Применен быстрый фильтр: ${getQuickFilterName(filterType)}`, 'info');
    }

    /**
     * Обновление состояния фильтров каталога из UI
     */
    function updateCatalogFiltersFromUI() {
        if (!window.CatalogModule) return;

        const state = window.CatalogModule.state;
        
        // Категория
        const selectedCategory = document.querySelector('input[name="category"]:checked');
        state.currentFilters.category = selectedCategory ? selectedCategory.value : 'all';

        // Состояние
        const selectedConditions = [...document.querySelectorAll('input[name="condition"]:checked')];
        state.currentFilters.condition = selectedConditions.map(cb => cb.value);

        // Цена
        const priceMin = document.getElementById('priceMin');
        const priceMax = document.getElementById('priceMax');
        state.currentFilters.minPrice = priceMin.value ? parseInt(priceMin.value) : null;
        state.currentFilters.maxPrice = priceMax.value ? parseInt(priceMax.value) : null;

        // Рейтинг
        const activeRating = document.querySelector('.rating-btn.active');
        state.currentFilters.rating = activeRating ? parseInt(activeRating.dataset.rating) : null;

        // Университет
        const universitySelect = document.getElementById('universityFilter');
        state.currentFilters.university = universitySelect.value || '';

        // Обновление активных фильтров в UI
        if (window.CatalogModule.updateActiveFilters) {
            window.CatalogModule.updateActiveFilters();
        }
    }

    /**
     * Получение названия быстрого фильтра
     */
    function getQuickFilterName(filterType) {
        const names = {
            'new-cheap': 'Дешево и новое',
            'textbooks-used': 'Учебники б/у',
            'rental-electronics': 'Электроника в аренду',
            'high-rated-sellers': 'Лучшие продавцы'
        };
        return names[filterType] || filterType;
    }

    // =============================================================================
    // РАСШИРЕННЫЕ ОПЦИИ
    // =============================================================================

    /**
     * Настройка расширенных опций фильтрации
     */
    function setupAdvancedOptions() {
        // Добавление переключателя "Только с фото"
        addPhotoFilter();
        
        // Добавление фильтра по дате
        addDateFilter();
        
        // Добавление фильтра по количеству просмотров
        addPopularityFilter();
    }

    /**
     * Добавление фильтра "Только с фото"
     */
    function addPhotoFilter() {
        const conditionSection = document.querySelector('.filter-section:has(h4:contains("Состояние"))') ||
                                document.querySelector('.filter-section:nth-child(4)'); // Приблизительный селектор
        
        if (!conditionSection) return;

        const photoFilterHTML = `
            <div class="filter-section">
                <h4>Дополнительно</h4>
                <div class="filter-options">
                    <label class="filter-option">
                        <input type="checkbox" name="hasPhoto" value="true">
                        <span class="checkmark"></span>
                        Только с фотографиями
                    </label>
                    <label class="filter-option">
                        <input type="checkbox" name="isNegotiable" value="true">
                        <span class="checkmark"></span>
                        Торг уместен
                    </label>
                </div>
            </div>
        `;

        conditionSection.insertAdjacentHTML('afterend', photoFilterHTML);

        // Добавление обработчиков
        const photoCheckbox = document.querySelector('input[name="hasPhoto"]');
        const negotiableCheckbox = document.querySelector('input[name="isNegotiable"]');

        if (photoCheckbox) {
            photoCheckbox.addEventListener('change', () => {
                // В реальном приложении здесь была бы фильтрация
                console.log('Photo filter changed:', photoCheckbox.checked);
            });
        }

        if (negotiableCheckbox) {
            negotiableCheckbox.addEventListener('change', () => {
                // В реальном приложении здесь была бы фильтрация
                console.log('Negotiable filter changed:', negotiableCheckbox.checked);
            });
        }
    }

    /**
     * Добавление фильтра по дате
     */
    function addDateFilter() {
        const sidebar = document.querySelector('.filters-sidebar');
        if (!sidebar) return;

        const dateFilterHTML = `
            <div class="filter-section date-filter-section">
                <h4>Дата размещения</h4>
                <div class="date-filter-options">
                    <label class="filter-option">
                        <input type="radio" name="dateFilter" value="today">
                        <span class="checkmark"></span>
                        Сегодня
                    </label>
                    <label class="filter-option">
                        <input type="radio" name="dateFilter" value="week">
                        <span class="checkmark"></span>
                        За неделю
                    </label>
                    <label class="filter-option">
                        <input type="radio" name="dateFilter" value="month">
                        <span class="checkmark"></span>
                        За месяц
                    </label>
                    <label class="filter-option">
                        <input type="radio" name="dateFilter" value="all" checked>
                        <span class="checkmark"></span>
                        За всё время
                    </label>
                </div>
            </div>
        `;

        sidebar.insertAdjacentHTML('beforeend', dateFilterHTML);

        // Добавление обработчиков
        const dateRadios = document.querySelectorAll('input[name="dateFilter"]');
        dateRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.checked) {
                    console.log('Date filter changed:', radio.value);
                    // В реальном приложении здесь была бы фильтрация
                }
            });
        });
    }

    /**
     * Добавление фильтра по популярности
     */
    function addPopularityFilter() {
        // Этот фильтр уже реализован через сортировку, но можно добавить отдельный чекбокс
        const additionalSection = document.querySelector('.date-filter-section');
        if (!additionalSection) return;

        const popularityHTML = `
            <div class="filter-options" style="margin-top: 16px;">
                <label class="filter-option">
                    <input type="checkbox" name="popularOnly" value="true">
                    <span class="checkmark"></span>
                    Только популярные (10+ просмотров)
                </label>
            </div>
        `;

        additionalSection.insertAdjacentHTML('beforeend', popularityHTML);
    }

    // =============================================================================
    // ПРЕСЕТЫ ФИЛЬТРОВ
    // =============================================================================

    /**
     * Создание пресетов фильтров
     */
    function createFilterPresets() {
        FiltersState.filterPresets = {
            'students-essentials': {
                name: 'Студенческий набор',
                filters: {
                    category: 'supplies',
                    maxPrice: 500,
                    condition: ['new', 'excellent']
                }
            },
            'budget-textbooks': {
                name: 'Бюджетные учебники',
                filters: {
                    category: 'textbooks',
                    maxPrice: 1000,
                    condition: ['good', 'fair']
                }
            },
            'premium-electronics': {
                name: 'Премиум электроника',
                filters: {
                    category: 'rental',
                    minPrice: 10000,
                    condition: ['new', 'excellent'],
                    rating: 5
                }
            }
        };
    }

    /**
     * Применение пресета фильтров
     */
    function applyFilterPreset(presetId) {
        const preset = FiltersState.filterPresets[presetId];
        if (!preset) return;

        // Сброс текущих фильтров
        if (window.CatalogModule) {
            window.CatalogModule.clearAllFilters();
        }

        // Применение пресета
        const filters = preset.filters;
        
        // Применение к UI элементам
        Object.keys(filters).forEach(key => {
            const value = filters[key];
            
            switch (key) {
                case 'category':
                    const categoryRadio = document.querySelector(`input[name="category"][value="${value}"]`);
                    if (categoryRadio) categoryRadio.checked = true;
                    break;
                    
                case 'minPrice':
                    const priceMin = document.getElementById('priceMin');
                    if (priceMin) priceMin.value = value;
                    break;
                    
                case 'maxPrice':
                    const priceMax = document.getElementById('priceMax');
                    if (priceMax) priceMax.value = value;
                    break;
                    
                case 'condition':
                    if (Array.isArray(value)) {
                        value.forEach(condition => {
                            const checkbox = document.querySelector(`input[name="condition"][value="${condition}"]`);
                            if (checkbox) checkbox.checked = true;
                        });
                    }
                    break;
                    
                case 'rating':
                    const ratingBtn = document.querySelector(`.rating-btn[data-rating="${value}"]`);
                    if (ratingBtn) ratingBtn.click();
                    break;
            }
        });

        // Обновление каталога
        setTimeout(() => {
            updateCatalogFiltersFromUI();
            if (window.CatalogModule && window.CatalogModule.loadProducts) {
                window.CatalogModule.loadProducts();
            }
        }, 100);

        CampusMarketplace.ui.showNotification(`Применен пресет: ${preset.name}`, 'info');
    }

    // =============================================================================
    // ПУБЛИЧНЫЕ МЕТОДЫ
    // =============================================================================

    /**
     * Получение сохраненных фильтров
     */
    function getSavedFilters() {
        return FiltersState.savedFilters;
    }

    /**
     * Применение пресета по ID
     */
    function usePreset(presetId) {
        applyFilterPreset(presetId);
    }

    /**
     * Получение списка доступных пресетов
     */
    function getAvailablePresets() {
        return Object.keys(FiltersState.filterPresets).map(id => ({
            id,
            name: FiltersState.filterPresets[id].name
        }));
    }

    // =============================================================================
    // ИНИЦИАЛИЗАЦИЯ
    // =============================================================================

    // Запуск инициализации после небольшой задержки, чтобы дать загрузиться основному каталогу
    setTimeout(init, 500);

    // Экспорт публичных методов
    window.FiltersModule = {
        getSavedFilters,
        usePreset,
        getAvailablePresets,
        applyQuickFilter,
        saveCurrentFilters,
        isInitialized: () => FiltersState.isInitialized
    };
});
