/**
 * JavaScript модуль для функциональности поиска
 * Обрабатывает глобальный поиск, автодополнение, историю поиска
 */

document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const elements = {
        searchInput: document.getElementById('searchInput'),
        searchBtn: document.getElementById('searchBtn'),
        searchSuggestions: document.getElementById('searchSuggestions')
    };

    // Состояние поиска
    const SearchState = {
        currentQuery: '',
        suggestions: [],
        searchHistory: [],
        isLoading: false,
        activeIndex: -1
    };

    // =============================================================================
    // ИНИЦИАЛИЗАЦИЯ
    // =============================================================================

    function init() {
        // Проверяем, есть ли элементы поиска на странице
        if (!elements.searchInput) return;

        // Загрузка истории поиска из localStorage
        loadSearchHistory();
        
        // Настройка обработчиков событий
        setupEventHandlers();
        
        console.log('Search module initialized');
    }

    /**
     * Загрузка истории поиска из localStorage
     */
    function loadSearchHistory() {
        const savedHistory = localStorage.getItem('campusMarketplaceSearchHistory');
        if (savedHistory) {
            try {
                SearchState.searchHistory = JSON.parse(savedHistory);
            } catch (error) {
                console.error('Error loading search history:', error);
                SearchState.searchHistory = [];
            }
        }
    }

    /**
     * Сохранение истории поиска в localStorage
     */
    function saveSearchHistory() {
        try {
            localStorage.setItem('campusMarketplaceSearchHistory', JSON.stringify(SearchState.searchHistory));
        } catch (error) {
            console.error('Error saving search history:', error);
        }
    }

    /**
     * Настройка обработчиков событий
     */
    function setupEventHandlers() {
        // Поисковый ввод
        if (elements.searchInput) {
            elements.searchInput.addEventListener('input', 
                window.CampusMarketplace?.utils?.debounce ? 
                window.CampusMarketplace.utils.debounce(handleSearchInput, 300) : 
                handleSearchInput
            );
            
            elements.searchInput.addEventListener('focus', handleSearchFocus);
            elements.searchInput.addEventListener('blur', handleSearchBlur);
            elements.searchInput.addEventListener('keydown', handleSearchKeydown);
        }

        // Кнопка поиска
        if (elements.searchBtn) {
            elements.searchBtn.addEventListener('click', handleSearchSubmit);
        }

        // Форма поиска (если есть)
        const searchForm = elements.searchInput?.closest('form');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                handleSearchSubmit();
            });
        }

        // Глобальные обработчики
        document.addEventListener('click', handleGlobalClick);
    }

    // =============================================================================
    // ОБРАБОТЧИКИ СОБЫТИЙ
    // =============================================================================

    /**
     * Обработка ввода в поисковое поле
     */
    function handleSearchInput(e) {
        const query = e.target.value.trim();
        SearchState.currentQuery = query;

        if (query.length > 0) {
            loadSearchSuggestions(query);
        } else {
            showSearchHistory();
        }
    }

    /**
     * Обработка фокуса на поисковом поле
     */
    function handleSearchFocus() {
        if (SearchState.currentQuery.length > 0) {
            loadSearchSuggestions(SearchState.currentQuery);
        } else {
            showSearchHistory();
        }
    }

    /**
     * Обработка потери фокуса поискового поля
     */
    function handleSearchBlur() {
        // Задержка для обработки кликов по подсказкам
        setTimeout(() => {
            hideSuggestions();
        }, 200);
    }

    /**
     * Обработка нажатий клавиш в поисковом поле
     */
    function handleSearchKeydown(e) {
        const suggestions = elements.searchSuggestions?.querySelectorAll('.search-suggestion');
        if (!suggestions || suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                SearchState.activeIndex = Math.min(SearchState.activeIndex + 1, suggestions.length - 1);
                updateActiveSuggestion(suggestions);
                break;

            case 'ArrowUp':
                e.preventDefault();
                SearchState.activeIndex = Math.max(SearchState.activeIndex - 1, -1);
                updateActiveSuggestion(suggestions);
                break;

            case 'Enter':
                e.preventDefault();
                if (SearchState.activeIndex >= 0) {
                    const activeSuggestion = suggestions[SearchState.activeIndex];
                    const query = activeSuggestion.textContent.trim();
                    executeSearch(query);
                } else {
                    handleSearchSubmit();
                }
                break;

            case 'Escape':
                hideSuggestions();
                elements.searchInput.blur();
                break;

            default:
                SearchState.activeIndex = -1;
                break;
        }
    }

    /**
     * Обработка отправки поискового запроса
     */
    function handleSearchSubmit() {
        const query = elements.searchInput.value.trim();
        if (query) {
            executeSearch(query);
        }
    }

    /**
     * Обработка глобальных кликов
     */
    function handleGlobalClick(e) {
        // Скрытие подсказок при клике вне поискового блока
        if (!e.target.closest('.search-container')) {
            hideSuggestions();
        }
    }

    // =============================================================================
    // ЛОГИКА ПОИСКА
    // =============================================================================

    /**
     * Выполнение поискового запроса
     */
    function executeSearch(query) {
        if (!query.trim()) return;

        // Добавление в историю поиска
        addToSearchHistory(query);

        // Скрытие подсказок
        hideSuggestions();

        // Переход к результатам поиска
        navigateToSearchResults(query);

        CampusMarketplace.ui.showNotification(`Поиск: "${query}"`, 'info');
    }

    /**
     * Переход к результатам поиска
     */
    function navigateToSearchResults(query) {
        // Определяем текущую страницу
        const currentPath = window.location.pathname;
        
        if (currentPath.includes('catalog.html')) {
            // Если мы уже на странице каталога, обновляем поиск
            if (window.CatalogModule) {
                window.CatalogModule.state.currentFilters.search = query;
                window.CatalogModule.loadProducts();
            }
        } else {
            // Переходим на страницу каталога с поисковым запросом
            const catalogUrl = currentPath.includes('pages/') 
                ? 'catalog.html' 
                : 'pages/catalog.html';
            
            window.location.href = `${catalogUrl}?search=${encodeURIComponent(query)}`;
        }
    }

    /**
     * Добавление запроса в историю поиска
     */
    function addToSearchHistory(query) {
        // Удаляем дубликаты
        SearchState.searchHistory = SearchState.searchHistory.filter(item => 
            item.query.toLowerCase() !== query.toLowerCase()
        );

        // Добавляем новый запрос в начало
        SearchState.searchHistory.unshift({
            query: query,
            timestamp: new Date()
        });

        // Ограничиваем количество сохраненных запросов
        SearchState.searchHistory = SearchState.searchHistory.slice(0, 10);

        // Сохраняем в localStorage
        saveSearchHistory();
    }

    /**
     * Загрузка поисковых подсказок
     */
    async function loadSearchSuggestions(query) {
        if (SearchState.isLoading) return;

        SearchState.isLoading = true;

        try {
            const suggestions = await generateSearchSuggestions(query);
            SearchState.suggestions = suggestions;
            displaySuggestions(suggestions, 'suggestions');
        } catch (error) {
            console.error('Error loading search suggestions:', error);
        } finally {
            SearchState.isLoading = false;
        }
    }

    /**
     * Показ истории поиска
     */
    function showSearchHistory() {
        if (SearchState.searchHistory.length > 0) {
            const historyItems = SearchState.searchHistory.slice(0, 5).map(item => ({
                text: item.query,
                type: 'history'
            }));
            displaySuggestions(historyItems, 'history');
        } else {
            hideSuggestions();
        }
    }

    // =============================================================================
    // ОТОБРАЖЕНИЕ ПОДСКАЗОК
    // =============================================================================

    /**
     * Отображение подсказок
     */
    function displaySuggestions(suggestions, type) {
        if (!elements.searchSuggestions || suggestions.length === 0) {
            hideSuggestions();
            return;
        }

        elements.searchSuggestions.innerHTML = '';

        // Заголовок для истории поиска
        if (type === 'history') {
            const header = document.createElement('div');
            header.className = 'suggestions-header';
            header.innerHTML = `
                <span>Недавние поиски</span>
                <button class="clear-history-btn" type="button">Очистить</button>
            `;
            elements.searchSuggestions.appendChild(header);

            // Обработчик очистки истории
            const clearBtn = header.querySelector('.clear-history-btn');
            clearBtn.addEventListener('click', clearSearchHistory);
        }

        // Создание элементов подсказок
        suggestions.forEach((suggestion, index) => {
            const suggestionElement = createSuggestionElement(suggestion, type, index);
            elements.searchSuggestions.appendChild(suggestionElement);
        });

        // Показ контейнера подсказок
        elements.searchSuggestions.style.display = 'block';
        SearchState.activeIndex = -1;
    }

    /**
     * Создание элемента подсказки
     */
    function createSuggestionElement(suggestion, type, index) {
        const element = document.createElement('div');
        element.className = 'search-suggestion';
        
        if (type === 'history') {
            element.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span>${suggestion.text}</span>
                <button class="remove-suggestion" data-index="${index}" type="button">×</button>
            `;

            // Обработчик удаления из истории
            const removeBtn = element.querySelector('.remove-suggestion');
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeFromHistory(index);
            });
        } else {
            element.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                    <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span>${highlightQuery(suggestion.text, SearchState.currentQuery)}</span>
            `;
        }

        // Обработчик клика по подсказке
        element.addEventListener('click', () => {
            executeSearch(suggestion.text);
        });

        return element;
    }

    /**
     * Подсветка поискового запроса в подсказке
     */
    function highlightQuery(text, query) {
        if (!query) return text;

        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<strong>$1</strong>');
    }

    /**
     * Обновление активной подсказки
     */
    function updateActiveSuggestion(suggestions) {
        suggestions.forEach((suggestion, index) => {
            suggestion.classList.toggle('active', index === SearchState.activeIndex);
        });

        // Прокрутка к активной подсказке
        if (SearchState.activeIndex >= 0) {
            const activeSuggestion = suggestions[SearchState.activeIndex];
            activeSuggestion.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }
    }

    /**
     * Скрытие подсказок
     */
    function hideSuggestions() {
        if (elements.searchSuggestions) {
            elements.searchSuggestions.style.display = 'none';
            elements.searchSuggestions.innerHTML = '';
        }
        SearchState.activeIndex = -1;
    }

    // =============================================================================
    // УПРАВЛЕНИЕ ИСТОРИЕЙ
    // =============================================================================

    /**
     * Удаление элемента из истории поиска
     */
    function removeFromHistory(index) {
        SearchState.searchHistory.splice(index, 1);
        saveSearchHistory();
        showSearchHistory();
    }

    /**
     * Очистка всей истории поиска
     */
    function clearSearchHistory() {
        SearchState.searchHistory = [];
        saveSearchHistory();
        hideSuggestions();
        CampusMarketplace.ui.showNotification('История поиска очищена', 'info');
    }

    // =============================================================================
    // ГЕНЕРАЦИЯ ПОДСКАЗОК
    // =============================================================================

    /**
     * Генерация поисковых подсказок
     */
    async function generateSearchSuggestions(query) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const suggestions = [];
                
                // Популярные категории
                const categories = [
                    'Учебники по математике',
                    'Учебники по физике',
                    'Канцтовары',
                    'Ноутбуки в аренду',
                    'Репетиторство',
                    'Курсовые работы'
                ];

                // Популярные товары
                const products = [
                    'Учебник математический анализ',
                    'Физика Савельев',
                    'Тетради 48 листов',
                    'Ручки Pilot',
                    'Калькулятор Casio',
                    'Папка-регистратор',
                    'Ноутбук Dell',
                    'Планшет iPad',
                    'Репетитор математика',
                    'Помощь курсовая'
                ];

                // Фильтрация по запросу
                const allItems = [...categories, ...products];
                const filtered = allItems.filter(item =>
                    item.toLowerCase().includes(query.toLowerCase())
                ).slice(0, 6);

                // Преобразование в формат подсказок
                const mappedSuggestions = filtered.map(item => ({
                    text: item,
                    type: 'suggestion'
                }));

                resolve(mappedSuggestions);
            }, 150);
        });
    }

    // =============================================================================
    // ПУБЛИЧНЫЕ МЕТОДЫ
    // =============================================================================

    /**
     * Программный поиск
     */
    function performSearch(query) {
        if (elements.searchInput) {
            elements.searchInput.value = query;
        }
        executeSearch(query);
    }

    /**
     * Получение истории поиска
     */
    function getSearchHistory() {
        return SearchState.searchHistory;
    }

    /**
     * Очистка поискового поля
     */
    function clearSearchInput() {
        if (elements.searchInput) {
            elements.searchInput.value = '';
            SearchState.currentQuery = '';
            hideSuggestions();
        }
    }

    // =============================================================================
    // CSS СТИЛИ ДЛЯ ПОДСКАЗОК
    // =============================================================================

    // Добавление стилей для подсказок, если их еще нет
    if (!document.getElementById('search-suggestions-styles')) {
        const style = document.createElement('style');
        style.id = 'search-suggestions-styles';
        style.textContent = `
            .suggestions-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 16px;
                border-bottom: 1px solid var(--border-color);
                font-size: 12px;
                color: var(--text-secondary);
                font-weight: 500;
            }

            .clear-history-btn {
                background: none;
                border: none;
                color: var(--primary-color);
                cursor: pointer;
                font-size: 12px;
                padding: 4px 8px;
                border-radius: 4px;
                transition: background-color var(--transition-fast);
            }

            .clear-history-btn:hover {
                background-color: var(--secondary-background);
            }

            .search-suggestion {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 16px;
                cursor: pointer;
                transition: background-color var(--transition-fast);
                position: relative;
            }

            .search-suggestion:hover,
            .search-suggestion.active {
                background-color: var(--secondary-background);
            }

            .search-suggestion svg {
                color: var(--text-secondary);
                flex-shrink: 0;
            }

            .search-suggestion span {
                flex: 1;
                color: var(--text-primary);
            }

            .search-suggestion strong {
                color: var(--primary-color);
                font-weight: 600;
            }

            .remove-suggestion {
                position: absolute;
                right: 8px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                color: var(--text-secondary);
                cursor: pointer;
                padding: 4px;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                display: none;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                line-height: 1;
            }

            .search-suggestion:hover .remove-suggestion {
                display: flex;
            }

            .remove-suggestion:hover {
                background-color: var(--error-color);
                color: var(--white);
            }
        `;
        document.head.appendChild(style);
    }

    // Инициализация модуля
    init();

    // Экспорт публичных методов
    window.SearchModule = {
        performSearch,
        getSearchHistory,
        clearSearchInput,
        clearSearchHistory
    };
});
