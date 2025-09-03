/**
 * Основной JavaScript модуль для Campus Marketplace
 * Содержит общую функциональность, используемую на всех страницах
 */

// Глобальные переменные и состояние приложения
const CampusMarketplace = {
    // Состояние пользователя
    user: {
        isAuthenticated: false,
        data: null
    },

    // Конфигурация
    config: {
        apiUrl: '/api', // В реальном проекте здесь будет URL API
        itemsPerPage: 12,
        maxImageSize: 5 * 1024 * 1024, // 5MB
        allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
        localStorageKeys: {
            user: 'campusMarketplaceUser',
            listings: 'campusMarketplaceListings',
            filters: 'campusMarketplaceFilters',
            favorites: 'campusMarketplaceFavorites'
        }
    },

    // Кэш данных
    cache: {
        listings: new Map(),
        users: new Map()
    },

    // Утилиты
    utils: {
        formatPrice: function(price) {
            return new Intl.NumberFormat('ru-RU', {
                style: 'currency',
                currency: 'RUB',
                minimumFractionDigits: 0
            }).format(price);
        },
        getCategoryName: function(category) {
            const names = {
                textbooks: 'Учебники',
                supplies: 'Канцтовары',
                rental: 'Аренда оборудования',
                services: 'Услуги'
            };
            return names[category] || category;
        },
        getConditionName: function(condition) {
            const names = {
                new: 'Новое',
                excellent: 'Отличное',
                good: 'Хорошее',
                fair: 'Удовлетворительное'
            };
            return names[condition] || condition;
        }
    },

    // API методы
    api: {},

    // UI компоненты
    ui: {},

    // Методы сохранения
    storage: {}
};

// =============================================================================
// МЕТОДЫ РАБОТЫ С LOCALSTORAGE
// =============================================================================

/**
 * Сохранение пользователя в localStorage
 * @param {Object} userData - Данные пользователя
 */
CampusMarketplace.storage.saveUser = function(userData) {
    console.log('CampusMarketplace.storage.saveUser вызвана с данными:', userData);
    
    try {
        localStorage.setItem(
            CampusMarketplace.config.localStorageKeys.user,
            JSON.stringify(userData)
        );
        console.log('Пользователь успешно сохранен в localStorage');
    } catch (error) {
        console.error('Error saving user data:', error);
    }
};

/**
 * Загрузка пользователя из localStorage
 * @returns {Object|null} Данные пользователя или null
 */
CampusMarketplace.storage.loadUser = function() {
    console.log('CampusMarketplace.storage.loadUser вызвана');
    
    try {
        const userData = localStorage.getItem(
            CampusMarketplace.config.localStorageKeys.user
        );
        console.log('Данные пользователя из localStorage:', userData);
        
        const result = userData ? JSON.parse(userData) : null;
        console.log('Результат loadUser:', result);
        
        return result;
    } catch (error) {
        console.error('Error loading user data:', error);
        return null;
    }
};

/**
 * Удаление данных пользователя из localStorage
 */
CampusMarketplace.storage.removeUser = function() {
    console.log('CampusMarketplace.storage.removeUser вызвана');
    
    try {
        localStorage.removeItem(CampusMarketplace.config.localStorageKeys.user);
        console.log('Пользователь успешно удален из localStorage');
    } catch (error) {
        console.error('Error removing user data:', error);
    }
};

/**
 * Сохранение объявлений в localStorage
 * @param {Array} listings - Массив объявлений
 */
CampusMarketplace.storage.saveListings = function(listings) {
    console.log('CampusMarketplace.storage.saveListings вызвана с данными:', listings);
    
    try {
        localStorage.setItem(
            CampusMarketplace.config.localStorageKeys.listings,
            JSON.stringify(listings)
        );
        console.log('Объявления успешно сохранены в localStorage');
    } catch (error) {
        console.error('Error saving listings:', error);
    }
};

/**
 * Загрузка объявлений из localStorage
 * @returns {Array} Массив объявлений
 */
CampusMarketplace.storage.loadListings = function() {
    console.log('CampusMarketplace.storage.loadListings вызвана');
    
    try {
        const listingsData = localStorage.getItem(
            CampusMarketplace.config.localStorageKeys.listings
        );
        console.log('Данные объявлений из localStorage:', listingsData);
        
        const result = listingsData ? JSON.parse(listingsData) : [];
        console.log('Результат loadListings:', result);
        
        return result;
    } catch (error) {
        console.error('Error loading listings:', error);
        return [];
    }
};

/**
 * Добавление нового объявления
 * @param {Object} listing - Объявление
 */
CampusMarketplace.storage.addListing = function(listing) {
    console.log('CampusMarketplace.storage.addListing вызвана с данными:', listing);
    
    if (CampusMarketplaceDB) {
        CampusMarketplaceDB.addListing(listing);
    } else {
        const listings = CampusMarketplace.storage.loadListings();
        listings.push(listing);
        CampusMarketplace.storage.saveListings(listings);
    }
    
    console.log('Объявление добавлено в localStorage');
};

/**
 * Обновление объявления
 * @param {string} listingId - ID объявления
 * @param {Object} updatedData - Обновленные данные
 */
CampusMarketplace.storage.updateListing = function(listingId, updatedData) {
    console.log('CampusMarketplace.storage.updateListing вызвана для ID:', listingId, 'с данными:', updatedData);
    
    if (CampusMarketplaceDB) {
        CampusMarketplaceDB.updateListing(listingId, updatedData);
        console.log('Объявление обновлено в базе данных');
    } else {
        const listings = CampusMarketplace.storage.loadListings();
        const index = listings.findIndex(listing => listing.id === listingId);
        if (index !== -1) {
            listings[index] = { ...listings[index], ...updatedData };
            CampusMarketplace.storage.saveListings(listings);
            console.log('Объявление обновлено в localStorage');
        } else {
            console.log('Объявление не найдено для обновления');
        }
    }
};

/**
 * Удаление объявления
 * @param {string} listingId - ID объявления
 */
CampusMarketplace.storage.deleteListing = function(listingId) {
    console.log('CampusMarketplace.storage.deleteListing вызвана для ID:', listingId);
    
    if (CampusMarketplaceDB) {
        CampusMarketplaceDB.deleteListing(listingId);
        console.log('Объявление удалено из базы данных');
    } else {
        const listings = CampusMarketplace.storage.loadListings();
        const filteredListings = listings.filter(listing => listing.id !== listingId);
        CampusMarketplace.storage.saveListings(filteredListings);
        console.log('Объявление удалено из localStorage');
    }
};

/**
 * Сохранение избранных объявлений
 * @param {Array} favorites - Массив ID избранных объявлений
 */
CampusMarketplace.storage.saveFavorites = function(favorites) {
    console.log('CampusMarketplace.storage.saveFavorites вызвана с данными:', favorites);
    
    try {
        localStorage.setItem(
            CampusMarketplace.config.localStorageKeys.favorites,
            JSON.stringify(favorites)
        );
        console.log('Избранное успешно сохранено в localStorage');
    } catch (error) {
        console.error('Error saving favorites:', error);
    }
};

/**
 * Загрузка избранных объявлений
 * @returns {Array} Массив ID избранных объявлений
 */
CampusMarketplace.storage.loadFavorites = function() {
    console.log('CampusMarketplace.storage.loadFavorites вызвана');
    
    try {
        const favoritesData = localStorage.getItem(
            CampusMarketplace.config.localStorageKeys.favorites
        );
        console.log('Данные избранного из localStorage:', favoritesData);
        
        const result = favoritesData ? JSON.parse(favoritesData) : [];
        console.log('Результат loadFavorites:', result);
        
        return result;
    } catch (error) {
        console.error('Error loading favorites:', error);
        return [];
    }
};

/**
 * Добавление в избранное
 * @param {string} listingId - ID объявления
 */
CampusMarketplace.storage.addToFavorites = function(listingId) {
    console.log('CampusMarketplace.storage.addToFavorites вызвана для ID:', listingId);
    
    const favorites = CampusMarketplace.storage.loadFavorites();
    if (!favorites.includes(listingId)) {
        favorites.push(listingId);
        CampusMarketplace.storage.saveFavorites(favorites);
        console.log('Объявление добавлено в избранное');
    } else {
        console.log('Объявление уже в избранном');
    }
};

/**
 * Удаление из избранного
 * @param {string} listingId - ID объявления
 */
CampusMarketplace.storage.removeFromFavorites = function(listingId) {
    console.log('CampusMarketplace.storage.removeFromFavorites вызвана для ID:', listingId);
    
    const favorites = CampusMarketplace.storage.loadFavorites();
    const updatedFavorites = favorites.filter(id => id !== listingId);
    CampusMarketplace.storage.saveFavorites(updatedFavorites);
    
    console.log('Объявление удалено из избранного');
};

/**
 * Сохранение фильтров
 * @param {Object} filters - Объект фильтров
 */
CampusMarketplace.storage.saveFilters = function(filters) {
    console.log('CampusMarketplace.storage.saveFilters вызвана с данными:', filters);
    
    try {
        localStorage.setItem(
            CampusMarketplace.config.localStorageKeys.filters,
            JSON.stringify(filters)
        );
        console.log('Фильтры успешно сохранены в localStorage');
    } catch (error) {
        console.error('Error saving filters:', error);
    }
};

/**
 * Загрузка фильтров
 * @returns {Object} Объект фильтров
 */
CampusMarketplace.storage.loadFilters = function() {
    console.log('CampusMarketplace.storage.loadFilters вызвана');
    
    try {
        const filtersData = localStorage.getItem(
            CampusMarketplace.config.localStorageKeys.filters
        );
        console.log('Данные фильтров из localStorage:', filtersData);
        
        const result = filtersData ? JSON.parse(filtersData) : {};
        console.log('Результат loadFilters:', result);
        
        return result;
    } catch (error) {
        console.error('Error loading filters:', error);
        return {};
    }
};

/**
 * Инициализация данных - загрузка сохраненных данных при запуске
 */
CampusMarketplace.storage.initialize = function() {
    console.log('CampusMarketplace.storage.initialize вызвана');
    
    // Загрузка пользователя
    const savedUser = CampusMarketplace.storage.loadUser();
    console.log('Сохраненный пользователь:', savedUser);
    
    if (savedUser) {
        CampusMarketplace.user.isAuthenticated = true;
        CampusMarketplace.user.data = savedUser;
        console.log('Пользователь загружен в состояние приложения');
    }

    // Больше не создаем mock данные - используем базу данных
    // const savedListings = CampusMarketplace.storage.loadListings();
    // if (savedListings.length === 0) {
    //     const mockListings = generateMockListings();
    //     CampusMarketplace.storage.saveListings(mockListings);
    // }
    
    console.log('CampusMarketplace.storage.initialize завершена');
};

// =============================================================================
// УТИЛИТЫ
// =============================================================================

/**
 * Форматирование цены
 * @param {number} price - Цена в рублях
 * @returns {string} Отформатированная цена
 */
CampusMarketplace.utils.formatPrice = function(price) {
    console.log('formatPrice вызвана для цены:', price);
    
    if (price === 0) {
        console.log('Цена 0, возвращаем "Бесплатно"');
        return 'Бесплатно';
    }
    
    const result = new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
    
    console.log('Отформатированная цена:', result);
    return result;
};

/**
 * Форматирование даты
 * @param {Date|string} date - Дата
 * @returns {string} Отформатированная дата
 */
CampusMarketplace.utils.formatDate = function(date) {
    console.log('formatDate вызвана для даты:', date);
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffTime = Math.abs(now - dateObj);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let result;
    if (diffDays === 1) {
        result = 'Сегодня';
    } else if (diffDays === 2) {
        result = 'Вчера';
    } else if (diffDays <= 7) {
        result = `${diffDays} дня назад`;
    } else {
        result = dateObj.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short'
        });
    }
    
    console.log('Отформатированная дата:', result);
    return result;
};

/**
 * Debounce функция для ограничения частоты вызовов
 * @param {Function} func - Функция для вызова
 * @param {number} wait - Задержка в миллисекундах
 * @returns {Function} Debounced функция
 */
CampusMarketplace.utils.debounce = function(func, wait) {
    console.log('debounce вызвана для функции:', func.name || 'anonymous', 'с задержкой:', wait);
    
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Создание уникального ID
 * @returns {string} Уникальный ID
 */
CampusMarketplace.utils.generateId = function() {
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    console.log('Сгенерирован ID:', id);
    return id;
};

/**
 * Валидация email
 * @param {string} email - Email для проверки
 * @returns {boolean} Результат валидации
 */
CampusMarketplace.utils.validateEmail = function(email) {
    console.log('validateEmail вызвана для email:', email);
    
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const result = re.test(email);
    
    console.log('Результат валидации email:', result);
    return result;
};

/**
 * Обработка файлов изображений
 * @param {File} file - Файл изображения
 * @returns {Promise<string>} URL изображения
 */
CampusMarketplace.utils.processImage = function(file) {
    console.log('processImage вызвана для файла:', file);
    
    return new Promise((resolve, reject) => {
        // Проверка типа файла
        if (!CampusMarketplace.config.allowedImageTypes.includes(file.type)) {
            console.log('Неподдерживаемый тип файла:', file.type);
            reject(new Error('Неподдерживаемый тип файла'));
            return;
        }

        // Проверка размера файла
        if (file.size > CampusMarketplace.config.maxImageSize) {
            console.log('Размер файла превышает лимит:', file.size, '>', CampusMarketplace.config.maxImageSize);
            reject(new Error('Размер файла превышает 5MB'));
            return;
        }

        console.log('Файл прошел проверку, читаем...');
        const reader = new FileReader();
        reader.onload = (e) => {
            console.log('Файл успешно прочитан');
            resolve(e.target.result);
        };
        reader.onerror = () => {
            console.log('Ошибка чтения файла');
            reject(new Error('Ошибка чтения файла'));
        };
        reader.readAsDataURL(file);
    });
};

// =============================================================================
// API МЕТОДЫ (симуляция)
// =============================================================================

/**
 * Получение списка объявлений с фильтрами
 * @param {Object} filters - Параметры фильтрации
 * @returns {Promise<Object>} Результат с объявлениями
 */
CampusMarketplace.api.getListings = async function(filters = {}) {
    console.log('CampusMarketplace.api.getListings вызван с фильтрами:', filters);
    
    // Использование базы данных или сохраненных данных
    return new Promise((resolve) => {
        setTimeout(() => {
            let savedListings = [];
            if (window.CampusMarketplaceDB) {
                console.log('Используем базу данных');
                savedListings = CampusMarketplaceDB.getListings();
            } else {
                console.log('База данных не загружена, используем fallback');
                savedListings = CampusMarketplace.storage.loadListings();
            }
            
            console.log('Полученные объявления:', savedListings);
            let filteredListings = [...savedListings];

            // Применение фильтров
            if (filters.category && filters.category !== 'all') {
                filteredListings = filteredListings.filter(item => 
                    item.category === filters.category
                );
            }

            if (filters.minPrice) {
                filteredListings = filteredListings.filter(item => 
                    item.price >= filters.minPrice
                );
            }

            if (filters.maxPrice) {
                filteredListings = filteredListings.filter(item => 
                    item.price <= filters.maxPrice
                );
            }

            if (filters.condition && filters.condition.length > 0) {
                filteredListings = filteredListings.filter(item => 
                    filters.condition.includes(item.condition)
                );
            }

            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                filteredListings = filteredListings.filter(item =>
                    item.title.toLowerCase().includes(searchTerm) ||
                    item.description.toLowerCase().includes(searchTerm)
                );
            }

            // Фильтр по рейтингу продавца
            if (filters.rating) {
                filteredListings = filteredListings.filter(item => 
                    parseFloat(item.seller.rating) >= filters.rating
                );
            }

            // Сортировка
            if (filters.sort) {
                switch (filters.sort) {
                    case 'price-asc':
                        filteredListings.sort((a, b) => a.price - b.price);
                        break;
                    case 'price-desc':
                        filteredListings.sort((a, b) => b.price - a.price);
                        break;
                    case 'date-desc':
                        filteredListings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                        break;
                    case 'date-asc':
                        filteredListings.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                        break;
                    case 'rating':
                        filteredListings.sort((a, b) => parseFloat(b.seller.rating) - parseFloat(a.seller.rating));
                        break;
                    case 'popular':
                    default:
                        // Сортировка по популярности (можно добавить логику)
                        break;
                }
            }

            // Пагинация
            const page = filters.page || 1;
            const itemsPerPage = CampusMarketplace.config.itemsPerPage;
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedListings = filteredListings.slice(startIndex, endIndex);

            resolve({
                items: paginatedListings,
                total: filteredListings.length,
                page: page,
                totalPages: Math.ceil(filteredListings.length / itemsPerPage)
            });
        }, 500); // Симуляция задержки сети
    });
};

/**
 * Получение деталей объявления
 * @param {string} id - ID объявления
 * @returns {Promise<Object>} Детали объявления
 */
CampusMarketplace.api.getListing = async function(id) {
    console.log('CampusMarketplace.api.getListing вызван для ID:', id);
    
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const cachedListing = CampusMarketplace.cache.listings.get(id);
            if (cachedListing) {
                console.log('Объявление найдено в кэше:', cachedListing);
                resolve(cachedListing);
                return;
            }

            console.log('Объявление не найдено в кэше, ищем в БД');
            // Генерация mock данных для конкретного объявления
            const listing = generateMockListing(id);
            if (listing) {
                console.log('Объявление найдено в БД:', listing);
                CampusMarketplace.cache.listings.set(id, listing);
                resolve(listing);
            } else {
                console.log('Объявление не найдено');
                reject(new Error('Объявление не найдено'));
            }
        }, 300);
    });
};

/**
 * Создание нового объявления
 * @param {Object} listingData - Данные объявления
 * @returns {Promise<Object>} Созданное объявление
 */
CampusMarketplace.api.createListing = async function(listingData) {
    console.log('CampusMarketplace.api.createListing вызван с данными:', listingData);
    
    return new Promise((resolve) => {
        setTimeout(() => {
            const userData = CampusMarketplace.user.data;
            console.log('Данные пользователя для создания объявления:', userData);
            
            const newListing = {
                id: CampusMarketplace.utils.generateId(),
                ...listingData,
                createdAt: new Date(),
                updatedAt: new Date(),
                seller: {
                    id: userData?.id || 'current-user',
                    name: userData?.name || 'Иван Иванов',
                    avatar: userData?.avatar || null,
                    rating: userData?.rating || 4.8,
                    reviewsCount: userData?.reviews || 0
                },
                status: 'active',
                views: 0,
                favorites: 0
            };
            
            console.log('Создано новое объявление:', newListing);
            
            // Сохранение в базу данных или localStorage
            if (window.CampusMarketplaceDB) {
                console.log('Добавляем в базу данных');
                // Добавляем в базу данных
                CampusMarketplaceDB.addListing(newListing);
            } else {
                console.log('База данных не загружена, используем fallback');
                // Fallback на localStorage
                CampusMarketplace.storage.addListing(newListing);
            }
            
            CampusMarketplace.cache.listings.set(newListing.id, newListing);
            resolve(newListing);
        }, 800);
    });
};

// =============================================================================
// UI КОМПОНЕНТЫ
// =============================================================================

/**
 * Получение изображения по умолчанию для категории
 */
function getDefaultProductImage(category) {
    const placeholders = {
        textbooks: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23f3f4f6%22/%3E%3Ctext%20x%3D%22200%22%20y%3D%22150%22%20text-anchor%3D%22middle%22%20font-family%3D%22Arial%22%20font-size%3D%2218%22%20fill%3D%22%23666%22%3E%D0%A3%D1%87%D0%B5%D0%B1%D0%BD%D0%B8%D0%BA%3C/text%3E%3C/svg%3E',
        supplies: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23fef3c7%22/%3E%3Ctext%20x%3D%22200%22%20y%3D%22150%22%20text-anchor%3D%22middle%22%20font-family%3D%22Arial%22%20font-size%3D%2218%22%20fill%3D%22%23d97706%22%3E%D0%9A%D0%BD%D1%86%D1%82%D0%BE%D0%B2%D0%B0%D1%80%D1%8B%3C/text%3E%3C/svg%3E',
        rental: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23dcfce7%22/%3E%3Ctext%20x%3D%22200%22%20y%3D%22150%22%20text-anchor%3D%22middle%22%20font-family%3D%22Arial%22%20font-size%3D%2218%22%20fill%3D%22%23166534%22%3E%D0%90%D1%80%D0%B5%D0%BD%D0%B4%D0%B0%3C/text%3E%3C/svg%3E',
        services: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23fee2e2%22/%3E%3Ctext%20x%3D%22200%22%20y%3D%22150%22%20text-anchor%3D%22middle%22%20font-family%3D%22Arial%22%20font-size%3D%2218%22%20fill%3D%22%23dc2626%22%3E%D0%A3%D1%81%D0%BB%D1%83%D0%B3%D0%B8%3C/text%3E%3C/svg%3E'
    };
    const placeholder = placeholders[category] || placeholders.textbooks;
    return placeholder;
}

/**
 * Создание карточки объявления
 * @param {Object} listing - Данные объявления
 * @returns {HTMLElement} DOM элемент карточки
 */
CampusMarketplace.ui.createListingCard = function(listing) {
    console.log('=== createListingCard вызвана ===');
    console.log('Данные объявления:', listing);
    
    if (!listing || !listing.title) {
        console.error('Некорректные данные объявления:', listing);
        return null;
    }
    
    const card = document.createElement('div');
    card.className = 'listing-card';
    card.dataset.id = listing.id;
    
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
    
    console.log('URL изображения:', imageUrl);
    
    card.innerHTML = `
        <div class="listing-image">
            <img src="${imageUrl}" alt="${listing.title}" class="listing-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="listing-placeholder" style="display: none;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="2"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" stroke-width="2"/>
                </svg>
            </div>
            <div class="listing-price">${CampusMarketplace.utils.formatPrice(listing.price)}</div>
        </div>
        <div class="listing-content">
            <h3 class="listing-title">${listing.title}</h3>
            <p class="listing-description">${listing.description.substring(0, 100)}${listing.description.length > 100 ? '...' : ''}</p>
            <div class="listing-meta">
                <span class="listing-category">${CampusMarketplace.utils.getCategoryName(listing.category)}</span>
                <span class="listing-condition">${CampusMarketplace.utils.getConditionName(listing.condition)}</span>
            </div>
            <div class="listing-footer">
                <div class="listing-seller">
                    <span>★ ${listing.seller?.rating || listing.userRating || 0}</span>
                    <span>${listing.seller?.name || listing.userName || 'Неизвестно'}</span>
                </div>
                <button class="btn-secondary btn-sm contact-seller" onclick="event.stopPropagation(); CampusMarketplace.ui.openChat('${listing.seller?.id || listing.userId || ''}', '${listing.seller?.name || listing.userName || 'Неизвестно'}')">
                    Связаться
                </button>
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => {
        CampusMarketplace.ui.openListingModal(listing.id);
    });
    
    console.log('Карточка создана:', card);
    return card;
};

/**
 * Создание элемента активного фильтра
 * @param {string} label - Название фильтра
 * @param {string} value - Значение фильтра
 * @param {Function} onRemove - Callback для удаления
 * @returns {HTMLElement} DOM элемент тега фильтра
 */
CampusMarketplace.ui.createFilterTag = function(label, value, onRemove) {
    const tag = document.createElement('div');
    tag.className = 'filter-tag';
    tag.innerHTML = `
        <span>${label}</span>
        <button class="filter-tag-remove" type="button">&times;</button>
    `;

    const removeBtn = tag.querySelector('.filter-tag-remove');
    removeBtn.addEventListener('click', () => {
        tag.remove();
        if (onRemove) onRemove(value);
    });

    return tag;
};

/**
 * Показ уведомления
 * @param {string} message - Текст уведомления
 * @param {string} type - Тип уведомления (success, error, info)
 */
CampusMarketplace.ui.showNotification = function(message, type = 'info') {
    // Создание контейнера для уведомлений, если его нет
    let container = document.getElementById('notifications-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notifications-container';
        container.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 12px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }

    // Создание уведомления
    const notification = document.createElement('div');
    notification.style.cssText = `
        background: ${type === 'success' ? '#30D158' : type === 'error' ? '#FF3B30' : '#007AFF'};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        pointer-events: auto;
        max-width: 300px;
        word-wrap: break-word;
    `;
    notification.textContent = message;

    container.appendChild(notification);

    // Анимация появления
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Автоматическое исчезновение
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
};

/**
 * Открытие модального окна с деталями объявления
 * @param {string} listingId - ID объявления
 */
CampusMarketplace.ui.openListingModal = async function(listingId) {
    try {
        const listing = await CampusMarketplace.api.getListing(listingId);
        
        // Создание модального окна
        let modal = document.getElementById('listingDetailModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'listingDetailModal';
            modal.className = 'modal';
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="modal-content product-modal-content">
                <div class="modal-header">
                    <h3>${listing.title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="product-details">
                        <div class="product-images">
                            <div class="main-image" style="background-image: url('${listing.images && listing.images[0] ? listing.images[0] : ''}')"></div>
                            ${listing.images && listing.images.length > 1 ? `
                                <div class="image-thumbnails">
                                    ${listing.images.map((img, index) => `
                                        <div class="thumbnail ${index === 0 ? 'active' : ''}" 
                                             style="background-image: url('${img}')"
                                             data-image="${img}"></div>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                        <div class="product-info">
                            <div class="product-price">${CampusMarketplace.utils.formatPrice(listing.price)}</div>
                            <div class="product-meta">
                                <div class="meta-item">
                                    <span class="meta-label">Категория:</span>
                                    <span class="meta-value">${getCategoryName(listing.category)}</span>
                                </div>
                                <div class="meta-item">
                                    <span class="meta-label">Состояние:</span>
                                    <span class="meta-value">${getConditionName(listing.condition)}</span>
                                </div>
                                <div class="meta-item">
                                    <span class="meta-label">Опубликовано:</span>
                                    <span class="meta-value">${CampusMarketplace.utils.formatDate(listing.createdAt)}</span>
                                </div>
                            </div>
                            <div class="seller-info">
                                <div class="seller-avatar"></div>
                                <div class="seller-details">
                                    <h5>${listing.seller.name}</h5>
                                    <div class="seller-rating">
                                        <span>★</span>
                                        ${listing.seller.rating} (${listing.seller.reviewsCount} отзывов)
                                    </div>
                                </div>
                            </div>
                            <div class="product-description">
                                <h4>Описание</h4>
                                <p>${listing.description}</p>
                            </div>
                        </div>
                    </div>
                    <div class="product-actions">
                        <button class="btn-primary" id="contactSellerBtn">Связаться с продавцом</button>
                        <button class="btn-secondary" id="addToFavoritesBtn">В избранное</button>
                    </div>
                </div>
            </div>
        `;

        // Добавление обработчиков
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => CampusMarketplace.ui.closeModal(modal));

        const thumbnails = modal.querySelectorAll('.thumbnail');
        const mainImage = modal.querySelector('.main-image');
        
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', () => {
                thumbnails.forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
                mainImage.style.backgroundImage = `url('${thumb.dataset.image}')`;
            });
        });

        // Показ модального окна
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

    } catch (error) {
        CampusMarketplace.ui.showNotification('Ошибка загрузки объявления', 'error');
        console.error('Error loading listing:', error);
    }
};

/**
 * Закрытие модального окна
 * @param {HTMLElement} modal - Элемент модального окна
 */
CampusMarketplace.ui.closeModal = function(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    }, 300);
};

// =============================================================================
// ОБРАБОТЧИКИ СОБЫТИЙ И ИНИЦИАЛИЗАЦИЯ
// =============================================================================

/**
 * Инициализация общих обработчиков событий
 */
function initializeGlobalEventHandlers() {
    // Закрытие модальных окон по клику вне контента
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            CampusMarketplace.ui.closeModal(e.target);
        }
    });

    // Закрытие модальных окон по нажатию Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                CampusMarketplace.ui.closeModal(activeModal);
            }
        }
    });

    // Обработка мобильного меню
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            const navLinks = document.querySelector('.nav-links');
            navLinks.classList.toggle('mobile-open');
        });
    }

    // Обработка кнопки "Создать объявление" на главной странице
    const addListingBtn = document.getElementById('addListingBtn');
    if (addListingBtn) {
        addListingBtn.addEventListener('click', showAddListingModal);
    }

    // Модальное окно добавления объявления на главной странице
    const addListingModal = document.getElementById('addListingModal');
    if (addListingModal) {
        const closeBtn = addListingModal.querySelector('#addListingModalClose');
        const cancelBtn = addListingModal.querySelector('#cancelAddListing');
        const form = addListingModal.querySelector('#addListingForm');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                console.log('Закрытие модального окна по кнопке X');
                hideAddListingModal();
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                console.log('Закрытие модального окна по кнопке Отмена');
                hideAddListingModal();
            });
        }

        if (form) {
            form.addEventListener('submit', handleAddListingSubmit);
        }

        // Закрытие по клику на фон
        addListingModal.addEventListener('click', (e) => {
            console.log('Клик по модальному окну:', e.target, '===', addListingModal);
            if (e.target === addListingModal) {
                console.log('Клик по фону модального окна, закрываем...');
                hideAddListingModal();
            }
        });
    }
}

/**
 * Загрузка популярных объявлений для главной страницы
 */
async function loadPopularListings() {
    console.log('loadPopularListings вызвана');
    
    const container = document.getElementById('popularListings');
    if (!container) {
        console.log('Popular listings container not found');
        return;
    }

    try {
        console.log('Loading popular listings from database...');
        
        // Получаем объявления из базы данных
        let items = [];
        if (window.CampusMarketplaceDB) {
            console.log('Используем базу данных');
            items = CampusMarketplaceDB.getListings();
        } else {
            console.log('База данных не загружена, используем fallback');
            // Fallback на старую систему, если БД не загружена
            const result = await CampusMarketplace.api.getListings({ 
                sort: 'popular',
                page: 1
            });
            items = result.items || result || [];
        }

        console.log(`Found ${items.length} listings:`, items);

        // Показываем первые 6 объявлений
        const popularItems = items.slice(0, 6);
        container.innerHTML = '';

        if (popularItems.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">Пока нет объявлений</p>';
            return;
        }

        popularItems.forEach((listing, index) => {
            console.log('Создаем карточку для:', listing);
            const card = CampusMarketplace.ui.createListingCard(listing);
            card.classList.add('fade-in');
            card.style.animationDelay = `${index * 0.1}s`;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading popular listings:', error);
        container.innerHTML = '<p style="text-align: center; color: var(--error-color); padding: 40px;">Ошибка загрузки объявлений</p>';
    }
}

// =============================================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// =============================================================================

// Функция generateMockListings удалена - используем базу данных

/**
 * Получение конкретного объявления по ID
 */
function generateMockListing(id) {
    console.log('generateMockListing вызвана для ID:', id);
    
    // Используем базу данных вместо localStorage
    if (window.CampusMarketplaceDB) {
        console.log('Используем базу данных');
        const result = CampusMarketplaceDB.getListings().find(listing => listing.id === id) || null;
        console.log('Результат из БД:', result);
        return result;
    }
    
    // Fallback на старую систему
    console.log('Используем fallback');
    const savedListings = CampusMarketplace.storage.loadListings();
    const result = savedListings.find(listing => listing.id === id) || null;
    console.log('Результат из fallback:', result);
    return result;
}

/**
 * Получение названия категории на русском языке
 */
function getCategoryName(category) {
    console.log('getCategoryName вызвана для категории:', category);
    
    const names = {
        textbooks: 'Учебники',
        supplies: 'Канцтовары',
        rental: 'Аренда оборудования',
        services: 'Услуги'
    };
    
    const result = names[category] || category;
    console.log('Результат getCategoryName:', result);
    
    return result;
}

/**
 * Получение названия состояния на русском языке
 */
function getConditionName(condition) {
    console.log('getConditionName вызвана для состояния:', condition);
    
    const names = {
        new: 'Новое',
        excellent: 'Отличное',
        good: 'Хорошее',
        fair: 'Удовлетворительное'
    };
    
    const result = names[condition] || condition;
    console.log('Результат getConditionName:', result);
    
    return result;
}

// =============================================================================
// ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
// =============================================================================

// Удаляем дублирующую инициализацию - она перенесена в конец файла

// Экспорт глобального объекта для использования в других модулях
window.CampusMarketplace = CampusMarketplace;

// Функция для обновления навигации в зависимости от статуса авторизации
function updateNavigationUI() {
    console.log('updateNavigationUI вызвана');
    
    // Проверяем аутентификацию через базу данных или localStorage
    let isAuthenticated = false;
    let userData = null;
    
    if (window.CampusMarketplaceDB) {
        // Проверяем localStorage для пользователя
        const savedUser = localStorage.getItem('campusMarketplaceUser');
        console.log('Сохраненный пользователь:', savedUser);
        
        if (savedUser) {
            try {
                userData = JSON.parse(savedUser);
                isAuthenticated = true;
                // Обновляем состояние приложения
                CampusMarketplace.user.isAuthenticated = true;
                CampusMarketplace.user.data = userData;
                console.log('Пользователь аутентифицирован:', userData);
            } catch (e) {
                console.error('Error parsing user data:', e);
                localStorage.removeItem('campusMarketplaceUser');
            }
        }
    } else {
        // Fallback на старую систему
        isAuthenticated = CampusMarketplace.user.isAuthenticated || 
                         localStorage.getItem('campusMarketplaceUser');
    }
    
    // Ищем элементы навигации на всех страницах
    const loginBtn = document.querySelector('.login-btn');
    const profileBtn = document.querySelector('.profile-btn');
    
    // Ищем элементы навигации в профиле по ID
    const profileLoginBtn = document.getElementById('loginBtn');
    const profileLogoutBtn = document.getElementById('logoutBtn');
    
    console.log('Найденные элементы:', { loginBtn, profileBtn, profileLoginBtn, profileLogoutBtn });
    console.log('Статус аутентификации:', isAuthenticated);
    
    if (isAuthenticated) {
        // Пользователь авторизован
        if (loginBtn) {
            loginBtn.textContent = 'Выйти';
            loginBtn.onclick = logout;
            console.log('Кнопка входа изменена на "Выйти"');
        }
        if (profileBtn) {
            profileBtn.style.display = 'inline-block';
            console.log('Кнопка профиля показана');
        }
        
        // Обновляем навигацию в профиле
        if (profileLoginBtn) {
            profileLoginBtn.style.display = 'none';
        }
        if (profileLogoutBtn) {
            profileLogoutBtn.style.display = 'inline-block';
            profileLogoutBtn.onclick = logout;
        }
    } else {
        // Пользователь не авторизован
        if (loginBtn) {
            loginBtn.textContent = 'Войти';
            loginBtn.onclick = showLoginModal;
            console.log('Кнопка входа изменена на "Войти"');
        }
        if (profileBtn) {
            profileBtn.style.display = 'none';
            console.log('Кнопка профиля скрыта');
        }
        
        // Обновляем навигацию в профиле
        if (profileLoginBtn) {
            profileLoginBtn.style.display = 'inline-block';
            profileLoginBtn.onclick = showLoginModal;
        }
        if (profileLogoutBtn) {
            profileLogoutBtn.style.display = 'none';
        }
    }
}

// Функция выхода
function logout() {
    console.log('logout вызвана');
    
    // Очищаем данные пользователя
    localStorage.removeItem('campusMarketplaceUser');
    CampusMarketplace.user.isAuthenticated = false;
    CampusMarketplace.user.data = null;
    
    console.log('Данные пользователя очищены');
    
    // Обновляем UI
    updateNavigationUI();
    
    // Показываем уведомление
    if (CampusMarketplace.ui.showNotification) {
        CampusMarketplace.ui.showNotification('Вы успешно вышли из аккаунта', 'success');
    }
    
    // Перенаправляем на главную страницу
    if (window.location.pathname !== '/' && !window.location.pathname.endsWith('index.html')) {
        console.log('Перенаправляем на главную страницу');
        window.location.href = '../index.html';
    } else {
        console.log('Перезагружаем текущую страницу');
        location.reload();
    }
}

// Функция открытия модального окна входа
function showLoginModal() {
    console.log('showLoginModal вызвана');
    
    // Проверяем, не открыто ли уже модальное окно
    const existingModal = document.getElementById('loginModal');
    if (existingModal) {
        console.log('Модальное окно уже существует, показываем его');
        existingModal.classList.add('active');
        return;
    }
    
    console.log('Создаем новое модальное окно');
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'loginModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Вход</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <form id="loginForm">
                    <div class="form-group">
                        <label for="loginEmail">Email:</label>
                        <input type="email" id="loginEmail" required>
                    </div>
                    <div class="form-group">
                        <label for="loginPassword">Пароль:</label>
                        <input type="password" id="loginPassword" required>
                    </div>
                    <button type="submit" class="btn-primary">Войти</button>
                </form>
                <p>Нет аккаунта? <a href="/pages/register.html">Зарегистрироваться</a></p>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
        console.log('Закрытие модального окна по кнопке');
        CampusMarketplace.ui.closeModal(modal);
        // Удаляем модальное окно после закрытия
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
                console.log('Модальное окно удалено из DOM');
            }
        }, 300);
    });

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

        try {
            console.log('Попытка входа с:', { email, password });
            
            // Ждем загрузки базы данных
            if (!window.CampusMarketplaceDB) {
                console.log('База данных не загружена, ждем...');
                await new Promise(resolve => {
                    const checkDB = () => {
                        if (window.CampusMarketplaceDB) {
                            resolve();
                        } else {
                            setTimeout(checkDB, 100);
                        }
                    };
                    checkDB();
                });
            }
            
            console.log('База данных загружена, вызываем loginUser');
            const user = await CampusMarketplaceDB.loginUser(email, password);
            console.log('Результат loginUser:', user);
            
            if (user) {
                console.log('Вход успешен, обновляем состояние');
                CampusMarketplace.user.isAuthenticated = true;
                CampusMarketplace.user.data = user;
                
                console.log('Вызываем updateNavigationUI');
                updateNavigationUI();
                
                if (CampusMarketplace.ui.showNotification) {
                    CampusMarketplace.ui.showNotification('Вы успешно вошли!', 'success');
                }
                
                if (CampusMarketplace.ui.closeModal) {
                    CampusMarketplace.ui.closeModal(modal);
                } else {
                    modal.remove();
                }
                
                // Удаляем модальное окно после успешного входа
                setTimeout(() => {
                    if (modal.parentNode) {
                        modal.parentNode.removeChild(modal);
                        console.log('Модальное окно удалено после успешного входа');
                    }
                }, 300);
                
                // После успешной авторизации, если пользователь был на странице каталога,
                // обновляем список объявлений
                if (window.location.pathname.includes('catalog.html')) {
                    loadPopularListings();
                }
            } else {
                console.log('Вход не удался - неверные данные');
                if (CampusMarketplace.ui.showNotification) {
                    CampusMarketplace.ui.showNotification('Неверный email или пароль. Проверьте правильность введенных данных или зарегистрируйтесь.', 'error');
                } else {
                    alert('Неверный email или пароль. Проверьте правильность введенных данных или зарегистрируйтесь.');
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            if (CampusMarketplace.ui.showNotification) {
                CampusMarketplace.ui.showNotification('Ошибка при входе: ' + error.message, 'error');
            } else {
                alert('Ошибка при входе: ' + error.message);
            }
        }
        });
    }
}

// Функция загрузки сообщений из БД
function loadChatMessages(sellerId, currentUserId) {
    console.log('loadChatMessages вызвана для:', { sellerId, currentUserId });
    
    if (!window.CampusMarketplaceDB) {
        console.error('База данных не загружена');
        return;
    }
    
    const messages = CampusMarketplaceDB.getUserMessages(currentUserId);
    console.log('Получены сообщения:', messages);
    
    const chatMessages = document.getElementById('chatMessages');
    console.log('Элемент chatMessages:', chatMessages);
    
    if (!chatMessages) return;
    
    // Фильтруем сообщения между текущим пользователем и продавцом
    const conversationMessages = messages.filter(msg => 
        (msg.senderId === currentUserId && msg.receiverId === sellerId) ||
        (msg.senderId === sellerId && msg.receiverId === currentUserId)
    );
    
    console.log('Отфильтрованные сообщения для разговора:', conversationMessages);
    
    // Сортируем по времени
    conversationMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // Отображаем сообщения
    chatMessages.innerHTML = conversationMessages.map(msg => {
        const isOwn = msg.senderId === currentUserId;
        const time = new Date(msg.timestamp).toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        return `
            <div class="message ${isOwn ? 'own' : 'other'}">
                <div class="message-content">
                    <p>${msg.text}</p>
                    <span class="message-time">${time}</span>
                </div>
            </div>
        `;
    }).join('');
    
    // Прокручиваем к последнему сообщению
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Функция отправки сообщения
function sendChatMessage(sellerId, sellerName) {
    console.log('sendChatMessage вызвана для:', { sellerId, sellerName });
    
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    console.log('Текст сообщения:', message);
    
    // Получаем данные текущего пользователя
    let currentUser = null;
    
    if (CampusMarketplace.user.data) {
        currentUser = CampusMarketplace.user.data;
        console.log('Пользователь из CampusMarketplace.user.data:', currentUser);
    } else {
        const savedUser = localStorage.getItem('campusMarketplaceUser');
        if (savedUser) {
            try {
                currentUser = JSON.parse(savedUser);
                console.log('Пользователь из localStorage:', currentUser);
            } catch (e) {
                console.error('Error parsing user data:', e);
                return;
            }
        }
    }
    
    if (!currentUser) {
        alert('Ошибка: пользователь не найден');
        return;
    }
    
    console.log('Текущий пользователь для отправки:', currentUser);
    
    // Добавляем сообщение в БД
    if (window.CampusMarketplaceDB) {
        console.log('Добавляем сообщение в БД');
        const newMessage = CampusMarketplaceDB.addMessage({
            senderId: currentUser.id,
            receiverId: sellerId,
            text: message
        });
        
        // Очищаем поле ввода
        input.value = '';
        
        // Перезагружаем сообщения
        console.log('Перезагружаем сообщения');
        loadChatMessages(sellerId, currentUser.id);
        
        // Симулируем ответ продавца через 2-3 секунды
        setTimeout(() => {
            const responses = [
                'Спасибо за сообщение! Я скоро отвечу.',
                'Здравствуйте! Да, товар еще доступен.',
                'Конечно, можем договориться о встрече.',
                'Отличный вопрос! Давайте обсудим детали.'
            ];
            
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            console.log('Отправляем ответ продавца:', randomResponse);
            
            CampusMarketplaceDB.addMessage({
                senderId: sellerId,
                receiverId: currentUser.id,
                text: randomResponse
            });
            
            loadChatMessages(sellerId, currentUser.id);
        }, 2000 + Math.random() * 1000);
    } else {
        alert('Ошибка: база данных не загружена');
    }
}

// Обновляем функцию показа правил для исправления проблемы со скроллом
function showRulesModal() {
    const modal = document.createElement('div');
    modal.className = 'rules-modal';
    modal.innerHTML = `
        <div class="rules-content">
            <div class="rules-header">
                <h2>Правила использования</h2>
                <button class="close-btn" onclick="closeRulesModal()">&times;</button>
            </div>
            <div class="rules-body">
                <h4>1. Общие положения</h4>
                <p>Данная платформа предназначена для студентов и преподавателей образовательных учреждений для обмена товарами и услугами.</p>
                
                <h4>2. Регистрация и аккаунты</h4>
                <ul>
                    <li>Для использования платформы необходимо зарегистрироваться</li>
                    <li>Один пользователь может иметь только один аккаунт</li>
                    <li>Запрещается создание фейковых аккаунтов</li>
                </ul>
                
                <h4>3. Размещение объявлений</h4>
                <ul>
                    <li>Запрещается размещение незаконного контента</li>
                    <li>Товары должны соответствовать описанию</li>
                    <li>Цены должны быть указаны в рублях</li>
                </ul>
                
                <h4>4. Общение между пользователями</h4>
                <ul>
                    <li>Запрещается оскорбления и угрозы</li>
                    <li>Общение должно быть вежливым</li>
                    <li>Запрещается спам и реклама сторонних услуг</li>
                </ul>
                
                <h4>5. Безопасность</h4>
                <ul>
                    <li>Не передавайте личные данные третьим лицам</li>
                    <li>Встречи проводите в безопасных местах</li>
                    <li>Проверяйте товар перед покупкой</li>
                </ul>
                
                <h4>6. Поддержка</h4>
                <p>По всем вопросам обращайтесь в поддержку: <a href="mailto:chesterteamhack@gmail.com" class="contact-support">chesterteamhack@gmail.com</a></p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Предотвращаем скролл body
    document.body.style.overflow = 'hidden';
    
    // Добавляем обработчик клика для закрытия
    const closeBtn = modal.querySelector('.close-btn');
    closeBtn.addEventListener('click', closeRulesModal);
}

// Функция закрытия правил
function closeRulesModal() {
    const modal = document.querySelector('.rules-modal');
    if (modal) {
        modal.remove();
        // Восстанавливаем скролл
        document.body.style.overflow = '';
    }
}

// Удаляем дублирующуюся функцию - она уже определена выше

// Функция получения случайного изображения для категории
function getRandomProductImage(category) {
    console.log('getRandomProductImage вызвана для категории:', category);
    
    const images = {
        textbooks: [
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop'
        ],
        supplies: [
            'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1589187775328-882e91b3d810?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'
        ],
        rental: [
            'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=300&fit=crop'
        ],
        services: [
            'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=300&fit=crop'
        ]
    };
    
    const categoryImages = images[category] || images.textbooks;
    const selectedImage = categoryImages[Math.floor(Math.random() * categoryImages.length)];
    console.log('Выбрано изображение:', selectedImage);
    
    return selectedImage;
}

// Функция открытия чата
CampusMarketplace.ui.openChat = function(sellerId, sellerName) {
    console.log('openChat вызвана для:', { sellerId, sellerName });
    
    // Получаем данные текущего пользователя
    let currentUser = null;
    
    if (CampusMarketplace.user.data) {
        currentUser = CampusMarketplace.user.data;
        console.log('Пользователь из CampusMarketplace.user.data:', currentUser);
    } else {
        const savedUser = localStorage.getItem('campusMarketplaceUser');
        if (savedUser) {
            try {
                currentUser = JSON.parse(savedUser);
                console.log('Пользователь из localStorage:', currentUser);
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }
    }
    
    if (!currentUser) {
        alert('Для отправки сообщений необходимо войти в аккаунт');
        return;
    }
    
    console.log('Открываем чат для пользователя:', currentUser);
    
    const modal = document.createElement('div');
    modal.className = 'chat-modal';
    modal.innerHTML = `
        <div class="chat-container">
            <div class="chat-header">
                <h3>Чат с ${sellerName}</h3>
                <button class="close-btn" onclick="this.closest('.chat-modal').remove()">&times;</button>
            </div>
            <div class="chat-messages" id="chatMessages">
                <!-- Сообщения будут загружены здесь -->
            </div>
            <div class="chat-input-container">
                <input type="text" class="chat-input" id="chatInput" placeholder="Введите сообщение...">
                <button class="btn-primary" onclick="sendChatMessage('${sellerId}', '${sellerName}')">Отправить</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Блокируем скролл страницы
    document.body.style.overflow = 'hidden';
    
    // Загружаем существующие сообщения
    console.log('Загружаем сообщения для:', { sellerId, currentUserId: currentUser.id });
    loadChatMessages(sellerId, currentUser.id);
    
    // Фокус на поле ввода
    setTimeout(() => {
        const input = modal.querySelector('#chatInput');
        if (input) input.focus();
    }, 100);
    
    // Обработчик Enter для отправки
    const input = modal.querySelector('#chatInput');
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            sendChatMessage(sellerId, sellerName);
        }
    });
    
    // Обработчик закрытия модального окна
    const closeBtn = modal.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
        modal.remove();
        document.body.style.overflow = '';
    });
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Campus Marketplace...');
    try {
        // Инициализируем базу данных
        if (window.CampusMarketplaceDB) {
            CampusMarketplaceDB.initialize();
        }
        
        CampusMarketplace.storage.initialize();
        initializeGlobalEventHandlers();
        
        if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
            console.log('Loading popular listings...');
            setTimeout(() => {
                loadPopularListings();
            }, 100);
        }
        
        // Обработка кликов по категориям на главной странице
        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach(card => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                window.location.href = `/pages/catalog.html?category=${category}`;
            });
        });

        // Обработка ссылок помощи в подвале
        const supportLink = document.getElementById('supportLink');
        if (supportLink) {
            supportLink.addEventListener('click', (e) => {
                e.preventDefault();
                CampusMarketplace.ui.showNotification('Свяжитесь с нами: chesterteamhack@gmail.com', 'info');
            });
        }

        const faqLink = document.getElementById('faqLink');
        if (faqLink) {
            faqLink.addEventListener('click', (e) => {
                e.preventDefault();
                CampusMarketplace.ui.showNotification('Частые вопросы скоро будут доступны', 'info');
            });
        }

        const rulesLink = document.getElementById('rulesLink');
        if (rulesLink) {
            rulesLink.addEventListener('click', (e) => {
                e.preventDefault();
                showRulesModal();
            });
        }
        
        // Обновляем UI в зависимости от статуса авторизации
        updateNavigationUI();
        
        // Делаем функцию updateNavigationUI глобально доступной
        window.updateNavigationUI = updateNavigationUI;
        
        // Обработчик для статической формы входа на главной странице
        const staticLoginForm = document.getElementById('staticLoginForm');
        if (staticLoginForm) {
            staticLoginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('loginEmail').value;
                const password = document.getElementById('loginPassword').value;

                try {
                    console.log('Попытка входа через статическую форму:', { email, password });
                    
                    // Ждем загрузки базы данных
                    if (!window.CampusMarketplaceDB) {
                        console.log('База данных не загружена, ждем...');
                        await new Promise(resolve => {
                            const checkDB = () => {
                                if (window.CampusMarketplaceDB) {
                                    resolve();
                                } else {
                                    setTimeout(checkDB, 100);
                                }
                            };
                            checkDB();
                        });
                    }
                    
                    console.log('База данных загружена, вызываем loginUser');
                    const user = await CampusMarketplaceDB.loginUser(email, password);
                    console.log('Результат loginUser:', user);
                    
                    if (user) {
                        console.log('Вход успешен, обновляем состояние');
                        CampusMarketplace.user.isAuthenticated = true;
                        CampusMarketplace.user.data = user;
                        
                        console.log('Вызываем updateNavigationUI');
                        updateNavigationUI();
                        
                        if (CampusMarketplace.ui.showNotification) {
                            CampusMarketplace.ui.showNotification('Вы успешно вошли!', 'success');
                        }
                        
                        // Закрываем модальное окно
                        const loginModal = document.getElementById('loginModal');
                        if (loginModal) {
                            loginModal.style.display = 'none';
                        }
                        
                        // После успешной авторизации обновляем список объявлений
                        if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
                            loadPopularListings();
                        }
                    } else {
                        console.log('Вход не удался - неверные данные');
                        if (CampusMarketplace.ui.showNotification) {
                            CampusMarketplace.ui.showNotification('Неверный email или пароль. Проверьте правильность введенных данных или зарегистрируйтесь.', 'error');
                        } else {
                            alert('Неверный email или пароль. Проверьте правильность введенных данных или зарегистрируйтесь.');
                        }
                    }
                } catch (error) {
                    console.error('Login error:', error);
                    if (CampusMarketplace.ui.showNotification) {
                        CampusMarketplace.ui.showNotification('Ошибка при входе: ' + error.message, 'error');
                    } else {
                        alert('Ошибка при входе: ' + error.message);
                    }
                }
            });
        }
        
        console.log('Campus Marketplace initialized successfully');
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

// =============================================================================
// ФУНКЦИИ ДЛЯ МОДАЛЬНОГО ОКНА СОЗДАНИЯ ОБЪЯВЛЕНИЯ
// =============================================================================

function showAddListingModal() {
    const modal = document.getElementById('addListingModal');
    if (modal) {
        // Показываем модальное окно напрямую через стили
        modal.style.display = 'flex';
        modal.style.opacity = '1';
        modal.style.visibility = 'visible';
        
        // Сброс формы
        const form = modal.querySelector('#addListingForm');
        if (form) {
            form.reset();
        }
        
        console.log('Модальное окно создания объявления показано');
    }
}

function hideAddListingModal() {
    const modal = document.getElementById('addListingModal');
    if (modal) {
        // Скрываем модальное окно напрямую через стили
        modal.style.display = 'none';
        modal.style.opacity = '0';
        modal.style.visibility = 'hidden';
        
        console.log('Модальное окно создания объявления скрыто');
    }
}

function handleAddListingSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const listingData = {
        title: formData.get('title'),
        description: formData.get('description'),
        price: parseInt(formData.get('price')),
        category: formData.get('category'),
        condition: formData.get('condition'),
        image: formData.get('image') || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop'
    };

    console.log('Добавление нового объявления:', listingData);

    try {
        // Проверяем, что пользователь авторизован
        const currentUser = CampusMarketplaceDB.getCurrentUser();
        if (!currentUser) {
            alert('Для добавления объявления необходимо войти в систему');
            hideAddListingModal();
            return;
        }

        // Добавляем объявление в базу данных
        const newListing = CampusMarketplaceDB.addListing({
            ...listingData,
            seller: {
                id: currentUser.id,
                name: currentUser.name,
                rating: currentUser.rating || 4.5
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            global: true // Делаем объявление глобальным
        });

        console.log('Объявление добавлено:', newListing);

        // Закрываем модальное окно
        hideAddListingModal();

        // Показываем уведомление
        if (CampusMarketplace.ui && CampusMarketplace.ui.showNotification) {
            CampusMarketplace.ui.showNotification('Объявление успешно добавлено!', 'success');
        } else {
            alert('Объявление успешно добавлено!');
        }

        // Перезагружаем популярные объявления на главной странице
        if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
            loadPopularListings();
        }

    } catch (error) {
        console.error('Ошибка при добавлении объявления:', error);
        if (CampusMarketplace.ui && CampusMarketplace.ui.showNotification) {
            CampusMarketplace.ui.showNotification('Ошибка при добавлении объявления', 'error');
        } else {
            alert('Ошибка при добавлении объявления: ' + error.message);
        }
    }
}
