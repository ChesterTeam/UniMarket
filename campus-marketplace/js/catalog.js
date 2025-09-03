/**
 * JavaScript модуль для страницы каталога
 * Обрабатывает фильтрацию, сортировку, поиск и пагинацию товаров
 */

document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, что мы на странице каталога
    if (!document.getElementById('productsGrid')) {
        return;
    }

    // Состояние каталога
    const CatalogState = {
        currentFilters: {
            category: 'all',
            search: '',
            minPrice: null,
            maxPrice: null,
            condition: [],
            rating: null,
            university: '',
            sort: 'date-desc'
        },
        currentPage: 1,
        isLoading: false,
        viewMode: 'grid' // grid или list
    };

    // Элементы DOM
    const elements = {
        productsGrid: document.getElementById('productsGrid'),
        loadingState: document.getElementById('loadingState'),
        emptyState: document.getElementById('emptyState'),
        resultsCount: document.getElementById('resultsCount'),
        activeFilters: document.getElementById('activeFilters'),
        pagination: document.getElementById('pagination'),
        
        // Фильтры
        searchInput: document.getElementById('catalogSearchInput'),
        categoryRadios: document.querySelectorAll('input[name="category"]'),
        conditionCheckboxes: document.querySelectorAll('input[name="condition"]'),
        priceMin: document.getElementById('priceMin'),
        priceMax: document.getElementById('priceMax'),
        priceSlider: document.getElementById('priceSlider'),
        ratingBtns: document.querySelectorAll('.rating-btn'),
        universitySelect: document.getElementById('universityFilter'),
        
        // Управление
        sortSelect: document.getElementById('sortSelect'),
        clearFilters: document.getElementById('clearFilters'),
        resetFiltersBtn: document.getElementById('resetFiltersBtn'),
        gridViewBtn: document.getElementById('gridView'),
        listViewBtn: document.getElementById('listView')
    };

    // =============================================================================
    // ИНИЦИАЛИЗАЦИЯ
    // =============================================================================

    function init() {
        // Инициализируем базу данных безопасно
        if (window.CampusMarketplaceDB) {
            CampusMarketplaceDB.initializeSafe();
            console.log('База данных безопасно инициализирована в каталоге');
        } else {
            console.log('База данных не найдена в каталоге');
        }
        
        // Парсинг URL параметров
        parseURLParams();
        
        // Настройка обработчиков событий
        setupEventHandlers();
        
        // Загрузка данных
        loadProducts();
        
        // Обновляем UI в зависимости от статуса авторизации
        if (window.updateNavigationUI) {
            updateNavigationUI();
        }
        
        console.log('Catalog initialized');
    }

    /**
     * Парсинг параметров URL для установки начальных фильтров
     */
    function parseURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Установка категории из URL
        const category = urlParams.get('category');
        if (category) {
            CatalogState.currentFilters.category = category;
            const categoryRadio = document.querySelector(`input[name="category"][value="${category}"]`);
            if (categoryRadio) {
                categoryRadio.checked = true;
            }
        }

        // Установка поискового запроса
        const search = urlParams.get('search');
        if (search) {
            CatalogState.currentFilters.search = search;
            if (elements.searchInput) {
                elements.searchInput.value = search;
            }
        }
    }

    /**
     * Настройка всех обработчиков событий
     */
    function setupEventHandlers() {
        // Поиск
        if (elements.searchInput) {
            elements.searchInput.addEventListener('input', 
                CampusMarketplace.utils.debounce(handleSearchChange, 300)
            );
        }

        // Кнопка поиска
        const searchBtn = document.getElementById('catalogSearchBtn');
        if (searchBtn) {
            searchBtn.addEventListener('click', handleSearchSubmit);
        }

        // Категории
        elements.categoryRadios.forEach(radio => {
            radio.addEventListener('change', handleCategoryChange);
        });

        // Состояние товара
        elements.conditionCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', handleConditionChange);
        });

        // Ценовой диапазон
        if (elements.priceMin) {
            elements.priceMin.addEventListener('input', 
                CampusMarketplace.utils.debounce(handlePriceChange, 500)
            );
        }

        if (elements.priceMax) {
            elements.priceMax.addEventListener('input', 
                CampusMarketplace.utils.debounce(handlePriceChange, 500)
            );
        }

        if (elements.priceSlider) {
            elements.priceSlider.addEventListener('input', handlePriceSliderChange);
        }

        // Рейтинг продавца
        elements.ratingBtns.forEach(btn => {
            btn.addEventListener('click', handleRatingChange);
        });

        // Сортировка
        if (elements.sortSelect) {
            elements.sortSelect.addEventListener('change', handleSortChange);
        }

        // Сброс фильтров
        if (elements.clearFilters) {
            elements.clearFilters.addEventListener('click', clearAllFilters);
        }

        if (elements.resetFiltersBtn) {
            elements.resetFiltersBtn.addEventListener('click', clearAllFilters);
        }

        // Переключение вида
        if (elements.gridViewBtn) {
            elements.gridViewBtn.addEventListener('click', () => switchView('grid'));
        }

        if (elements.listViewBtn) {
            elements.listViewBtn.addEventListener('click', () => switchView('list'));
        }

        // Кнопки добавления объявления убраны
    }

    // =============================================================================
    // ОБРАБОТЧИКИ ФИЛЬТРОВ
    // =============================================================================

    function handleSearchChange(e) {
        CatalogState.currentFilters.search = e.target.value.trim();
        CatalogState.currentPage = 1;
        updateActiveFilters();
        loadProducts();
    }

    function handleSearchSubmit(e) {
        e.preventDefault();
        const searchValue = elements.searchInput.value.trim();
        CatalogState.currentFilters.search = searchValue;
        CatalogState.currentPage = 1;
        updateActiveFilters();
        loadProducts();
    }

    function handleCategoryChange(e) {
        CatalogState.currentFilters.category = e.target.value;
        CatalogState.currentPage = 1;
        updateActiveFilters();
        loadProducts();
    }

    function handleConditionChange(e) {
        const value = e.target.value;
        const conditions = CatalogState.currentFilters.condition;
        
        if (e.target.checked) {
            if (!conditions.includes(value)) {
                conditions.push(value);
            }
        } else {
            const index = conditions.indexOf(value);
            if (index > -1) {
                conditions.splice(index, 1);
            }
        }
        
        CatalogState.currentPage = 1;
        updateActiveFilters();
        loadProducts();
    }

    function handlePriceChange() {
        const minPrice = elements.priceMin.value ? parseInt(elements.priceMin.value) : null;
        const maxPrice = elements.priceMax.value ? parseInt(elements.priceMax.value) : null;
        
        CatalogState.currentFilters.minPrice = minPrice;
        CatalogState.currentFilters.maxPrice = maxPrice;
        CatalogState.currentPage = 1;
        
        updateActiveFilters();
        loadProducts();
    }

    function handlePriceSliderChange(e) {
        const value = parseInt(e.target.value);
        elements.priceMax.value = value;
        CatalogState.currentFilters.maxPrice = value;
        CatalogState.currentPage = 1;
        updateActiveFilters();
        loadProducts();
    }

    function handleRatingChange(e) {
        const button = e.currentTarget; // Используем currentTarget вместо target
        const rating = parseInt(button.dataset.rating);
        
        // Убираем активный класс со всех кнопок
        elements.ratingBtns.forEach(btn => btn.classList.remove('active'));
        
        // Если кликнули по уже активной кнопке, сбрасываем фильтр
        if (CatalogState.currentFilters.rating === rating) {
            CatalogState.currentFilters.rating = null;
        } else {
            CatalogState.currentFilters.rating = rating;
            button.classList.add('active');
        }
        
        CatalogState.currentPage = 1;
        updateActiveFilters();
        loadProducts();
    }

    function handleUniversityChange(e) {
        CatalogState.currentFilters.university = e.target.value;
        CatalogState.currentPage = 1;
        updateActiveFilters();
        loadProducts();
    }

    function handleSortChange(e) {
        CatalogState.currentFilters.sort = e.target.value;
        CatalogState.currentPage = 1;
        loadProducts();
    }

    // =============================================================================
    // УПРАВЛЕНИЕ ФИЛЬТРАМИ
    // =============================================================================

    /**
     * Обновление отображения активных фильтров
     */
    function updateActiveFilters() {
        if (!elements.activeFilters) return;

        elements.activeFilters.innerHTML = '';
        const filters = CatalogState.currentFilters;

        // Категория
        if (filters.category && filters.category !== 'all') {
            const categoryName = getCategoryName(filters.category);
            const tag = CampusMarketplace.ui.createFilterTag(
                `Категория: ${categoryName}`, 
                'category',
                () => {
                    CatalogState.currentFilters.category = 'all';
                    document.querySelector('input[name="category"][value="all"]').checked = true;
                    updateActiveFilters();
                    loadProducts();
                }
            );
            elements.activeFilters.appendChild(tag);
        }

        // Поиск
        if (filters.search) {
            const tag = CampusMarketplace.ui.createFilterTag(
                `Поиск: "${filters.search}"`,
                'search',
                () => {
                    CatalogState.currentFilters.search = '';
                    elements.searchInput.value = '';
                    updateActiveFilters();
                    loadProducts();
                }
            );
            elements.activeFilters.appendChild(tag);
        }

        // Цена
        if (filters.minPrice || filters.maxPrice) {
            let priceText = 'Цена: ';
            if (filters.minPrice && filters.maxPrice) {
                priceText += `${filters.minPrice} - ${filters.maxPrice} ₽`;
            } else if (filters.minPrice) {
                priceText += `от ${filters.minPrice} ₽`;
            } else if (filters.maxPrice) {
                priceText += `до ${filters.maxPrice} ₽`;
            }

            const tag = CampusMarketplace.ui.createFilterTag(
                priceText,
                'price',
                () => {
                    CatalogState.currentFilters.minPrice = null;
                    CatalogState.currentFilters.maxPrice = null;
                    elements.priceMin.value = '';
                    elements.priceMax.value = '';
                    updateActiveFilters();
                    loadProducts();
                }
            );
            elements.activeFilters.appendChild(tag);
        }

        // Состояние товара
        if (filters.condition.length > 0) {
            filters.condition.forEach(condition => {
                const conditionName = getConditionName(condition);
                const tag = CampusMarketplace.ui.createFilterTag(
                    `Состояние: ${conditionName}`,
                    `condition-${condition}`,
                    () => {
                        const index = CatalogState.currentFilters.condition.indexOf(condition);
                        if (index > -1) {
                            CatalogState.currentFilters.condition.splice(index, 1);
                        }
                        const checkbox = document.querySelector(`input[name="condition"][value="${condition}"]`);
                        if (checkbox) checkbox.checked = false;
                        updateActiveFilters();
                        loadProducts();
                    }
                );
                elements.activeFilters.appendChild(tag);
            });
        }

        // Рейтинг
        if (filters.rating) {
            const tag = CampusMarketplace.ui.createFilterTag(
                `Рейтинг: ${filters.rating}+ звёзд`,
                'rating',
                () => {
                    CatalogState.currentFilters.rating = null;
                    elements.ratingBtns.forEach(btn => btn.classList.remove('active'));
                    updateActiveFilters();
                    loadProducts();
                }
            );
            elements.activeFilters.appendChild(tag);
        }

        // Университет
        if (filters.university) {
            const universityName = elements.universitySelect.options[elements.universitySelect.selectedIndex].text;
            const tag = CampusMarketplace.ui.createFilterTag(
                `Университет: ${universityName}`,
                'university',
                () => {
                    CatalogState.currentFilters.university = '';
                    elements.universitySelect.value = '';
                    updateActiveFilters();
                    loadProducts();
                }
            );
            elements.activeFilters.appendChild(tag);
        }
    }

    /**
     * Сброс всех фильтров
     */
    function clearAllFilters() {
        // Сброс состояния
        CatalogState.currentFilters = {
            category: 'all',
            search: '',
            minPrice: null,
            maxPrice: null,
            condition: [],
            rating: null,
            university: '',
            sort: 'date-desc'
        };
        CatalogState.currentPage = 1;

        // Сброс UI элементов
        if (elements.searchInput) elements.searchInput.value = '';
        
        const allCategoryRadio = document.querySelector('input[name="category"][value="all"]');
        if (allCategoryRadio) allCategoryRadio.checked = true;

        elements.conditionCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });

        if (elements.priceMin) elements.priceMin.value = '';
        if (elements.priceMax) elements.priceMax.value = '';
        if (elements.priceSlider) elements.priceSlider.value = elements.priceSlider.max;

        elements.ratingBtns.forEach(btn => btn.classList.remove('active'));

        if (elements.universitySelect) elements.universitySelect.value = '';
        if (elements.sortSelect) elements.sortSelect.value = 'date-desc';

        // Обновление
        updateActiveFilters();
        loadProducts();
    }

    // =============================================================================
    // ЗАГРУЗКА И ОТОБРАЖЕНИЕ ТОВАРОВ
    // =============================================================================

    /**
     * Загрузка товаров с применением фильтров
     */
    async function loadProducts() {
        if (CatalogState.isLoading) return;

        CatalogState.isLoading = true;
        showLoadingState();

        try {
            const filters = {
                ...CatalogState.currentFilters,
                page: CatalogState.currentPage
            };

            console.log('=== loadProducts вызвана ===');
            console.log('Применяемые фильтры:', filters);
            console.log('CampusMarketplaceDB доступен:', !!window.CampusMarketplaceDB);

            let result;
            
            // Используем базу данных, если доступна
            if (window.CampusMarketplaceDB) {
                console.log('Загружаем товары из базы данных с фильтрами');
                
                // НЕ проверяем версию данных при загрузке (безопасно)
                // CampusMarketplaceDB.checkDataVersionSafe();
                
                // Получаем все объявления из базы данных
                const allListings = CampusMarketplaceDB.getListings();
                console.log('Все объявления в базе данных:', allListings);
                console.log('Количество всех объявлений:', allListings.length);
                
                // Применяем фильтры
                const filteredListings = CampusMarketplaceDB.searchListings(filters);
                console.log('Отфильтрованные объявления:', filteredListings);
                console.log('Количество отфильтрованных объявлений:', filteredListings.length);
                
                result = {
                    items: filteredListings,
                    total: filteredListings.length,
                    page: 1,
                    totalPages: 1
                };
            } else {
                console.log('База данных не доступна, используем API');
                result = await CampusMarketplace.api.getListings(filters);
            }
            
            console.log('Результат загрузки:', result);
            console.log('result.items:', result.items);
            console.log('result.items.length:', result.items.length);
            
            // Проверяем, что items действительно содержит объявления
            if (result.items && result.items.length > 0) {
                console.log('Первый элемент:', result.items[0]);
                console.log('Последний элемент:', result.items[result.items.length - 1]);
            }
            
            displayProducts(result.items);
            updateResultsCount(result.total);
            updatePagination(result);

            // Показ пустого состояния, если нет результатов
            if (result.total === 0) {
                showEmptyState();
            }

        } catch (error) {
            console.error('Error loading products:', error);
            if (CampusMarketplace.ui && CampusMarketplace.ui.showNotification) {
                CampusMarketplace.ui.showNotification('Ошибка загрузки товаров', 'error');
            } else {
                alert('Ошибка загрузки товаров: ' + error.message);
            }
            showEmptyState();
        } finally {
            CatalogState.isLoading = false;
            hideLoadingState();
        }
    }

    /**
     * Отображение списка товаров
     */
    function displayProducts(products) {
        console.log('=== displayProducts вызвана ===');
        console.log('Количество продуктов:', products.length);
        console.log('Продукты:', products);
        
        if (!elements.productsGrid) {
            console.error('productsGrid не найден!');
            return;
        }
        
        console.log('productsGrid найден:', elements.productsGrid);

        elements.productsGrid.innerHTML = '';
        elements.emptyState.style.display = 'none';

        if (products.length === 0) {
            console.log('Нет продуктов, показываем пустое состояние');
            showEmptyState();
            return;
        }

        console.log('Создаем карточки для', products.length, 'продуктов');
        
        products.forEach((product, index) => {
            console.log(`Создаем карточку ${index + 1} для:`, product);
            
            try {
                const card = CampusMarketplace.ui.createListingCard(product);
                console.log(`Карточка ${index + 1} создана:`, card);
                
                if (card) {
                    card.classList.add('fade-in');
                    elements.productsGrid.appendChild(card);
                    console.log(`Карточка ${index + 1} добавлена в DOM`);
                } else {
                    console.error(`Карточка ${index + 1} не была создана (null)`);
                }
                
            } catch (error) {
                console.error(`Ошибка при создании карточки ${index + 1}:`, error);
            }
        });
        
        console.log('Все карточки созданы. Количество карточек в DOM:', elements.productsGrid.children.length);
        
        // Дополнительная проверка
        console.log('=== ДОПОЛНИТЕЛЬНАЯ ПРОВЕРКА ===');
        console.log('productsGrid.innerHTML:', elements.productsGrid.innerHTML.substring(0, 500));
        console.log('productsGrid.children:', Array.from(elements.productsGrid.children).map(child => ({
            tagName: child.tagName,
            className: child.className,
            id: child.id,
            textContent: child.textContent?.substring(0, 100)
        })));
        
        // Проверяем CSS стили
        const computedStyle = window.getComputedStyle(elements.productsGrid);
        console.log('CSS стили productsGrid:', {
            display: computedStyle.display,
            visibility: computedStyle.visibility,
            opacity: computedStyle.opacity,
            height: computedStyle.height,
            width: computedStyle.width
        });
    }

    /**
     * Обновление счётчика результатов
     */
    function updateResultsCount(total) {
        if (elements.resultsCount) {
            const word = total === 1 ? 'товар' : total < 5 ? 'товара' : 'товаров';
            elements.resultsCount.textContent = `Найдено: ${total} ${word}`;
        }
    }

    /**
     * Обновление пагинации
     */
    function updatePagination(result) {
        if (!elements.pagination) return;

        elements.pagination.innerHTML = '';

        if (result.totalPages <= 1) return;

        const currentPage = result.page;
        const totalPages = result.totalPages;

        // Кнопка "Предыдущая"
        const prevBtn = createPaginationButton('‹', currentPage - 1, currentPage === 1);
        elements.pagination.appendChild(prevBtn);

        // Кнопки страниц
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        if (startPage > 1) {
            const firstBtn = createPaginationButton(1, 1);
            elements.pagination.appendChild(firstBtn);
            
            if (startPage > 2) {
                const dots = document.createElement('span');
                dots.textContent = '...';
                dots.className = 'pagination-dots';
                elements.pagination.appendChild(dots);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = createPaginationButton(i, i, false, i === currentPage);
            elements.pagination.appendChild(pageBtn);
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const dots = document.createElement('span');
                dots.textContent = '...';
                dots.className = 'pagination-dots';
                elements.pagination.appendChild(dots);
            }
            
            const lastBtn = createPaginationButton(totalPages, totalPages);
            elements.pagination.appendChild(lastBtn);
        }

        // Кнопка "Следующая"
        const nextBtn = createPaginationButton('›', currentPage + 1, currentPage === totalPages);
        elements.pagination.appendChild(nextBtn);
    }

    /**
     * Создание кнопки пагинации
     */
    function createPaginationButton(text, page, disabled = false, active = false) {
        const button = document.createElement('button');
        button.className = 'pagination-btn';
        button.textContent = text;
        
        if (disabled) {
            button.disabled = true;
        }
        
        if (active) {
            button.classList.add('active');
        }
        
        if (!disabled && !active) {
            button.addEventListener('click', () => {
                CatalogState.currentPage = page;
                loadProducts();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
        
        return button;
    }

    // =============================================================================
    // УПРАВЛЕНИЕ СОСТОЯНИЯМИ UI
    // =============================================================================

    function showLoadingState() {
        if (elements.loadingState) {
            elements.loadingState.style.display = 'flex';
        }
        if (elements.productsGrid) {
            elements.productsGrid.style.opacity = '0.5';
        }
    }

    function hideLoadingState() {
        if (elements.loadingState) {
            elements.loadingState.style.display = 'none';
        }
        if (elements.productsGrid) {
            elements.productsGrid.style.opacity = '1';
        }
    }

    function showEmptyState() {
        if (elements.emptyState) {
            elements.emptyState.style.display = 'flex';
        }
        if (elements.productsGrid) {
            elements.productsGrid.innerHTML = '';
        }
    }

    /**
     * Переключение режима отображения (сетка/список)
     */
    function switchView(mode) {
        CatalogState.viewMode = mode;

        // Обновление кнопок
        elements.gridViewBtn.classList.toggle('active', mode === 'grid');
        elements.listViewBtn.classList.toggle('active', mode === 'list');

        // Обновление сетки товаров
        if (elements.productsGrid) {
            elements.productsGrid.classList.toggle('list-view', mode === 'list');
        }

        // Сохранение предпочтения в localStorage
        localStorage.setItem('catalogViewMode', mode);
    }

    // =============================================================================
    // МОДАЛЬНОЕ ОКНО ДОБАВЛЕНИЯ ОБЪЯВЛЕНИЯ УБРАНО
    // =============================================================================

    // =============================================================================
    // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
    // =============================================================================

    function getCategoryName(category) {
        const names = {
            textbooks: 'Учебники',
            supplies: 'Канцтовары',
            rental: 'Аренда оборудования',
            services: 'Услуги'
        };
        return names[category] || category;
    }

    function getConditionName(condition) {
        const names = {
            new: 'Новое',
            excellent: 'Отличное',
            good: 'Хорошее',
            fair: 'Удовлетворительное'
        };
        return names[condition] || condition;
    }

    // =============================================================================
    // ИНИЦИАЛИЗАЦИЯ
    // =============================================================================

    // Восстановление режима просмотра из localStorage
    const savedViewMode = localStorage.getItem('catalogViewMode') || 'grid';
    switchView(savedViewMode);

    // Запуск инициализации
    init();

    // Экспорт функций для использования в других модулях
    window.CatalogModule = {
        loadProducts,
        clearAllFilters,
        switchView,
        state: CatalogState
    };
});
