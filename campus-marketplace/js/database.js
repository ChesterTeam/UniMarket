/**
 * База данных Campus Marketplace с глобальным каталогом
 * Все пользователи видят одинаковые объявления
 */

const CampusMarketplaceDB = {
    // Инициализация базы данных
    initialize: function() {
        console.log('=== CampusMarketplaceDB.initialize() ===');
        
        // Проверяем существующих пользователей
        const existingUsers = localStorage.getItem('campusMarketplaceUsers');
        console.log('Существующие пользователи в localStorage:', existingUsers);
        
        // Всегда вызываем createInitialUsers (она добавит только недостающих)
        console.log('Проверяем и добавляем недостающих начальных пользователей...');
        this.createInitialUsers();
        
        // Проверяем существующий каталог
        const existingListings = localStorage.getItem('campusMarketplaceListings');
        console.log('Существующий каталог в localStorage:', existingListings);
        
        // Если каталога нет, создаем пустой
        if (!existingListings) {
            console.log('Создаем пустой глобальный каталог...');
            this.createGlobalCatalog();
        } else {
            console.log('Каталог уже существует, проверяем версию...');
            // Проверяем и синхронизируем версию данных (только каталог, не пользователей)
            this.checkDataVersionSafe();
        }
        
        // Проверяем существующие сообщения
        const existingMessages = localStorage.getItem('campusMarketplaceMessages');
        console.log('Существующие сообщения в localStorage:', existingMessages);
        
        // Если сообщений нет, создаем пустые
        if (!existingMessages) {
            console.log('Создаем пустые сообщения...');
            this.createInitialMessages();
        } else {
            console.log('Сообщения уже существуют, пропускаем создание');
        }
        
        // Проверяем текущего пользователя
        const currentUser = this.getCurrentUser();
        console.log('Текущий пользователь после инициализации:', currentUser);
        
        console.log('База данных инициализирована');
    },

    // Безопасная инициализация (не сбрасывает данные пользователя)
    initializeSafe: function() {
        console.log('=== CampusMarketplaceDB.initializeSafe() ===');
        
        // Проверяем существующих пользователей
        const existingUsers = localStorage.getItem('campusMarketplaceUsers');
        console.log('Существующие пользователи в localStorage:', existingUsers);
        
        // Всегда вызываем createInitialUsers (она добавит только недостающих)
        console.log('Проверяем и добавляем недостающих начальных пользователей...');
        this.createInitialUsers();
        
        // Проверяем существующий каталог
        const existingListings = localStorage.getItem('campusMarketplaceListings');
        console.log('Существующий каталог в localStorage:', existingListings);
        
        // Если каталога нет, создаем пустой (но только если это первая инициализация)
        if (!existingListings) {
            console.log('Каталог не найден, создаем пустой...');
            this.createGlobalCatalog();
        } else {
            console.log('Каталог уже существует, НЕ проверяем версию (безопасно)');
            // НЕ проверяем версию данных при безопасной инициализации
        }
        
        // Проверяем существующие сообщения
        const existingMessages = localStorage.getItem('campusMarketplaceMessages');
        console.log('Существующие сообщения в localStorage:', existingMessages);
        
        // Если сообщений нет, создаем пустые
        if (!existingMessages) {
            console.log('Создаем пустые сообщения...');
            this.createInitialMessages();
        } else {
            console.log('Сообщения уже существуют, пропускаем создание');
        }
        
        // Проверяем текущего пользователя
        const currentUser = this.getCurrentUser();
        console.log('Текущий пользователь после безопасной инициализации:', currentUser);
        
        console.log('База данных безопасно инициализирована');
    },

    // =============================================================================
    // УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ
    // =============================================================================

    /**
     * Регистрация нового пользователя
     */
    registerUser: function(userData) {
        console.log('=== registerUser вызвана ===');
        console.log('Входные данные:', userData);
        
        // Проверяем существующих пользователей
        const existingUsers = this.getUsers();
        console.log('Существующие пользователи:', existingUsers);
        
        // Проверяем, не существует ли уже пользователь с таким email
        const existingUser = existingUsers.find(user => user.email === userData.email);
        if (existingUser) {
            console.log('Пользователь с таким email уже существует:', existingUser);
            throw new Error('Пользователь с таким email уже существует');
        }
        
        // Создаем нового пользователя
        const newUser = {
            id: this.generateId(),
            name: userData.name,
            email: userData.email,
            password: userData.password,
            rating: 0,
            reviews: 0,
            joinDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        console.log('Новый пользователь создан:', newUser);
        
        // Добавляем в массив пользователей
        existingUsers.push(newUser);
        console.log('Пользователь добавлен в массив. Новый массив:', existingUsers);
        
        // Сохраняем в localStorage
        console.log('Сохраняем в localStorage...');
        console.log('Ключ:', 'campusMarketplaceUsers');
        console.log('Данные для сохранения:', JSON.stringify(existingUsers));
        
        try {
            localStorage.setItem('campusMarketplaceUsers', JSON.stringify(existingUsers));
            console.log('localStorage.setItem выполнен успешно');
            
            // Проверяем, что данные действительно сохранились
            const savedData = localStorage.getItem('campusMarketplaceUsers');
            console.log('Проверка сохраненных данных:', savedData);
            
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                console.log('Парсированные данные:', parsedData);
                console.log('Количество пользователей в localStorage:', parsedData.length);
            } else {
                console.error('Данные не найдены в localStorage после сохранения!');
            }
            
        } catch (error) {
            console.error('Ошибка при сохранении в localStorage:', error);
            throw error;
        }
        
        console.log('=== registerUser завершена успешно ===');
        return newUser;
    },

    /**
     * Вход пользователя
     */
    loginUser: function(email, password) {
        console.log('=== loginUser вызвана ===');
        console.log('Попытка входа:', { email, password });
        
        const users = this.getUsers();
        console.log('Все пользователи в базе:', users);
        
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            console.log('Пользователь найден:', user);
            // Сохраняем данные пользователя в сессии
            localStorage.setItem('campusMarketplaceUser', JSON.stringify(user));
            return user;
        } else {
            console.log('Пользователь не найден или неверный пароль');
            throw new Error('Неверный email или пароль');
        }
    },

    /**
     * Получение всех пользователей
     */
    getUsers: function() {
        console.log('=== getUsers вызвана ===');
        const saved = localStorage.getItem('campusMarketplaceUsers');
        console.log('Данные из localStorage (campusMarketplaceUsers):', saved);
        
        if (saved) {
            try {
                const users = JSON.parse(saved);
                console.log('Пользователи загружены:', users);
                return users;
            } catch (error) {
                console.error('Ошибка парсинга пользователей:', error);
                return [];
            }
        }
        
        console.log('Пользователи не найдены, возвращаем пустой массив');
        return [];
    },

    /**
     * Получение пользователя по ID
     */
    getUserById: function(userId) {
        const users = this.getUsers();
        return users.find(user => user.id === userId);
    },

    // =============================================================================
    // ГЛОБАЛЬНЫЙ КАТАЛОГ (одинаковый для всех пользователей)
    // =============================================================================

    /**
     * Создание глобального каталога для всех пользователей
     */
    createGlobalCatalog: function() {
        console.log('=== Создание глобального каталога ===');
        
        // Проверяем, есть ли уже каталог
        const existingListings = localStorage.getItem('campusMarketplaceListings');
        if (existingListings) {
            console.log('Каталог уже существует, пропускаем создание');
            return JSON.parse(existingListings);
        }
        
        // Создаем ПУСТОЙ каталог (только при первой инициализации)
        const globalListings = [];
        
        // Сохраняем пустой каталог
        localStorage.setItem('campusMarketplaceListings', JSON.stringify(globalListings));
        
        // Устанавливаем версию данных
        const dataVersion = Date.now().toString();
        localStorage.setItem('campusMarketplaceDataVersion', dataVersion);
        
        console.log('Глобальный каталог создан (пустой):', globalListings);
        console.log('Версия данных установлена:', dataVersion);
        console.log('Количество объявлений в глобальном каталоге:', globalListings.length);
        
        return globalListings;
    },

    /**
     * Проверка и синхронизация версии данных
     */
    checkDataVersion: function() {
        const currentVersion = localStorage.getItem('campusMarketplaceDataVersion');
        const globalVersion = localStorage.getItem('campusMarketplaceGlobalVersion') || '0';
        
        console.log('Проверка версии данных:', { currentVersion, globalVersion });
        
        // Если версии не совпадают, синхронизируем
        if (currentVersion !== globalVersion) {
            console.log('Версии не совпадают, синхронизируем данные...');
            this.syncWithGlobalData();
            return true;
        }
        
        return false;
    },

    /**
     * Безопасная проверка версии данных (только каталог, не пользователей)
     */
    checkDataVersionSafe: function() {
        const currentVersion = localStorage.getItem('campusMarketplaceDataVersion');
        const globalVersion = localStorage.getItem('campusMarketplaceGlobalVersion') || '0';
        
        console.log('Безопасная проверка версии данных:', { currentVersion, globalVersion });
        
        // Если версии не совпадают, синхронизируем только каталог
        if (currentVersion !== globalVersion) {
            console.log('Версии не совпадают, синхронизируем только каталог...');
            this.syncWithGlobalDataSafe();
            return true;
        }
        
        return false;
    },

    /**
     * Синхронизация с глобальными данными
     */
    syncWithGlobalData: function() {
        console.log('=== Синхронизация с глобальными данными ===');
        
        // Получаем глобальную версию
        const globalVersion = localStorage.getItem('campusMarketplaceGlobalVersion') || '0';
        
        // Если глобальной версии нет, создаем новую
        if (globalVersion === '0') {
            console.log('Глобальной версии нет, создаем новую...');
            const newVersion = Date.now().toString();
            localStorage.setItem('campusMarketplaceGlobalVersion', newVersion);
            localStorage.setItem('campusMarketplaceDataVersion', newVersion);
            return;
        }
        
        // Синхронизируем каталог
        const globalListings = localStorage.getItem('campusMarketplaceGlobalListings');
        if (globalListings) {
            localStorage.setItem('campusMarketplaceListings', globalListings);
            console.log('Каталог синхронизирован с глобальными данными');
        }
        
        // Обновляем локальную версию
        localStorage.setItem('campusMarketplaceDataVersion', globalVersion);
        console.log('Версия данных обновлена:', globalVersion);
    },

    /**
     * Безопасная синхронизация с глобальными данными (только каталог)
     */
    syncWithGlobalDataSafe: function() {
        console.log('=== Безопасная синхронизация с глобальными данными ===');
        
        // Получаем глобальную версию
        const globalVersion = localStorage.getItem('campusMarketplaceGlobalVersion') || '0';
        
        // Если глобальной версии нет, создаем новую
        if (globalVersion === '0') {
            console.log('Глобальной версии нет, создаем новую...');
            const newVersion = Date.now().toString();
            localStorage.setItem('campusMarketplaceGlobalVersion', newVersion);
            localStorage.setItem('campusMarketplaceDataVersion', newVersion);
            return;
        }
        
        // Синхронизируем ТОЛЬКО каталог, не трогаем пользователей
        const globalListings = localStorage.getItem('campusMarketplaceGlobalListings');
        if (globalListings) {
            localStorage.setItem('campusMarketplaceListings', globalListings);
            console.log('Каталог синхронизирован с глобальными данными (безопасно)');
        }
        
        // Обновляем локальную версию
        localStorage.setItem('campusMarketplaceDataVersion', globalVersion);
        console.log('Версия данных обновлена (безопасно):', globalVersion);
        
        // Сохраняем информацию о том, что синхронизация прошла безопасно
        console.log('Данные пользователей сохранены, синхронизирован только каталог');
    },

    /**
     * Получение всех объявлений (глобальный каталог)
     */
    getListings: function() {
        console.log('=== getListings вызвана ===');
        const saved = localStorage.getItem('campusMarketplaceListings');
        console.log('Данные из localStorage (campusMarketplaceListings):', saved);
        
        if (saved) {
            try {
                const listings = JSON.parse(saved);
                console.log(`Загружено ${listings.length} объявлений:`, listings);
                
                // Дополнительная проверка каждого объявления
                listings.forEach((listing, index) => {
                    if (listing) {
                        console.log(`Объявление ${index}: id=${listing.id}, userId=${listing.userId}, userName=${listing.userName}, title=${listing.title}`);
                    } else {
                        console.log(`Объявление ${index}: undefined или null`);
                    }
                });
                
                return listings;
            } catch (error) {
                console.error('Ошибка при парсинге объявлений:', error);
                return [];
            }
        } else {
            console.log('Объявления не найдены, возвращаем пустой массив');
            return [];
        }
    },

    /**
     * Получение объявлений пользователя (теперь возвращает глобальный каталог)
     */
    getUserListings: function(userId) {
        console.log('=== getUserListings вызвана ===');
        console.log('Ищем объявления для пользователя ID:', userId);
        
        const listings = this.getListings();
        console.log('Всего объявлений в базе:', listings.length);
        
        if (!userId) {
            console.log('ID пользователя не указан, возвращаем все объявления');
            return listings;
        }
        
        // Фильтруем по userId (новое поле) или seller.id (старое поле для совместимости)
        const userListings = listings.filter(l => {
            if (!l) return false;
            
            const matchesUserId = l.userId === userId;
            const matchesSellerId = l.seller && l.seller.id === userId;
            
            console.log(`Объявление ${l.id}: userId=${l.userId}, seller.id=${l.seller?.id}, matchesUserId=${matchesUserId}, matchesSellerId=${matchesSellerId}`);
            
            return matchesUserId || matchesSellerId;
        });
        
        console.log(`Найдено ${userListings.length} объявлений для пользователя ${userId}:`, userListings);
        return userListings;
    },

    /**
     * Поиск и фильтрация объявлений
     */
    searchListings: function(filters = {}) {
        let listings = this.getListings();
        
        // Фильтр по категории
        if (filters.category && filters.category !== 'all') {
            listings = listings.filter(listing => listing.category === filters.category);
        }
        
        // Фильтр по поиску
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            listings = listings.filter(listing => 
                listing.title.toLowerCase().includes(searchLower) ||
                listing.description.toLowerCase().includes(searchLower)
            );
        }
        
        // Фильтр по цене
        if (filters.minPrice) {
            listings = listings.filter(listing => listing.price >= filters.minPrice);
        }
        if (filters.maxPrice) {
            listings = listings.filter(listing => listing.price <= filters.maxPrice);
        }
        
        // Фильтр по состоянию
        if (filters.condition && filters.condition.length > 0) {
            listings = listings.filter(listing => filters.condition.includes(listing.condition));
        }
        
        // Фильтр по рейтингу продавца
        if (filters.rating) {
            listings = listings.filter(listing => {
                // Проверяем рейтинг в разных полях для совместимости
                const sellerRating = listing.seller && listing.seller.rating;
                const userRating = listing.userRating;
                const rating = sellerRating || userRating || 0;
                return rating >= filters.rating;
            });
        }
        
        // Сортировка
        if (filters.sort === 'price-asc') {
            listings.sort((a, b) => a.price - b.price);
        } else if (filters.sort === 'price-desc') {
            listings.sort((a, b) => b.price - a.price);
        } else if (filters.sort === 'date-desc') {
            listings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (filters.sort === 'date-asc') {
            listings.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        }
        
        return listings;
    },

           /**
        * Добавление нового объявления
        */
       addListing: function(listingData) {
           console.log('=== addListing вызвана ===');
           console.log('Данные для добавления:', listingData);

           try {
               // Получаем текущего пользователя
               const currentUser = this.getCurrentUser();
               if (!currentUser) {
                   throw new Error('Пользователь не авторизован');
               }
               
               console.log('Текущий пользователь для привязки:', currentUser);
               
               // Генерируем уникальный ID
               const newListing = {
                   id: this.generateId(),
                   userId: currentUser.id, // Привязываем к пользователю
                   userName: currentUser.name, // Добавляем имя пользователя
                   ...listingData,
                   status: (listingData.status || 'active'),
                   createdAt: listingData.createdAt || new Date().toISOString(),
                   updatedAt: listingData.updatedAt || new Date().toISOString()
               };
               
               console.log('=== СОЗДАННОЕ ОБЪЯВЛЕНИЕ ===');
               console.log('ID объявления:', newListing.id);
               console.log('userId:', newListing.userId);
               console.log('userName:', newListing.userName);
               console.log('Полное объявление:', newListing);

               // Получаем существующие объявления
               const existingListings = this.getListings();
               console.log('Существующие объявления:', existingListings.length);

               // Проверяем, не существует ли уже объявление с таким ID
               const existingIndex = existingListings.findIndex(listing => listing.id === newListing.id);
               if (existingIndex !== -1) {
                   // Обновляем существующее объявление
                   existingListings[existingIndex] = newListing;
                   console.log('Существующее объявление обновлено');
               } else {
                   // Добавляем новое объявление
                   existingListings.push(newListing);
                   console.log('Новое объявление добавлено в массив');
               }

               // Сохраняем обновленный список
               localStorage.setItem('campusMarketplaceListings', JSON.stringify(existingListings));
               
               // Обновляем глобальную версию данных
               const newVersion = Date.now().toString();
               localStorage.setItem('campusMarketplaceGlobalVersion', newVersion);
               localStorage.setItem('campusMarketplaceGlobalListings', JSON.stringify(existingListings));
               
               console.log('Обновленный список сохранен в localStorage');
               console.log('Глобальная версия обновлена:', newVersion);
               
               // Проверяем, что данные действительно сохранились
               const savedListings = localStorage.getItem('campusMarketplaceListings');
               console.log('Проверка сохраненных данных:', savedListings);
               if (savedListings) {
                   const parsedListings = JSON.parse(savedListings);
                   console.log('Проверка: количество сохраненных объявлений:', parsedListings.length);
                   console.log('Проверка: последнее объявление:', parsedListings[parsedListings.length - 1]);
               }

               console.log('Объявление успешно добавлено:', newListing);
               return newListing;

           } catch (error) {
               console.error('Ошибка при добавлении объявления:', error);
               throw new Error('Не удалось добавить объявление: ' + error.message);
           }
       },

       /**
        * Обновление существующего объявления
        */
       updateListing: function(listingId, updatedData) {
           console.log('=== updateListing вызвана ===');
           console.log('ID объявления для обновления:', listingId);
           console.log('Новые данные:', updatedData);

           try {
               const existingListings = this.getListings();
               const index = existingListings.findIndex(listing => listing.id === listingId);
               
               if (index === -1) {
                   throw new Error('Объявление не найдено');
               }

               // Обновляем объявление
               existingListings[index] = {
                   ...existingListings[index],
                   ...updatedData,
                   // Сохраняем userId если он есть
                   userId: existingListings[index].userId || updatedData.userId,
                   updatedAt: new Date().toISOString()
               };

               // Сохраняем обновленный список
               localStorage.setItem('campusMarketplaceListings', JSON.stringify(existingListings));
               console.log('Объявление успешно обновлено:', existingListings[index]);

               return existingListings[index];

           } catch (error) {
               console.error('Ошибка при обновлении объявления:', error);
               throw new Error('Не удалось обновить объявление: ' + error.message);
           }
       },

       /**
        * Удаление объявления
        */
       deleteListing: function(listingId) {
           console.log('=== deleteListing вызвана ===');
           console.log('ID объявления для удаления:', listingId);

           try {
               // Получаем текущего пользователя
               const currentUser = this.getCurrentUser();
               if (!currentUser) {
                   throw new Error('Пользователь не авторизован');
               }
               
               const existingListings = this.getListings();
               const listingToDelete = existingListings.find(listing => listing.id === listingId);
               
               if (!listingToDelete) {
                   throw new Error('Объявление не найдено');
               }
               
               // Проверяем права на удаление (только владелец может удалить)
               if (listingToDelete.userId !== currentUser.id && listingToDelete.seller && listingToDelete.seller.id !== currentUser.id) {
                   throw new Error('У вас нет прав на удаление этого объявления');
               }
               
               const filteredListings = existingListings.filter(listing => listing.id !== listingId);
               
               // Сохраняем обновленный список
               localStorage.setItem('campusMarketplaceListings', JSON.stringify(filteredListings));
               console.log('Объявление успешно удалено');

               return true;

           } catch (error) {
               console.error('Ошибка при удалении объявления:', error);
               throw new Error('Не удалось удалить объявление: ' + error.message);
           }
       },

    // =============================================================================
    // СОЗДАНИЕ НАЧАЛЬНЫХ ДАННЫХ
    // =============================================================================

    /**
     * Создание начальных пользователей
     */
    createInitialUsers: function() {
        console.log('=== createInitialUsers вызвана ===');
        
        // Получаем существующих пользователей
        let existingUsers = [];
        const savedUsers = localStorage.getItem('campusMarketplaceUsers');
        
        if (savedUsers) {
            try {
                existingUsers = JSON.parse(savedUsers);
                console.log('Найдены существующие пользователи:', existingUsers.length);
            } catch (error) {
                console.error('Ошибка при парсинге существующих пользователей:', error);
                existingUsers = [];
            }
        }
        
        // Определяем, каких начальных пользователей нужно добавить
        const initialUserEmails = [
            'ivan.petrov@student.university.edu',
            'anna.sidorova@student.university.edu',
            'mikhail.kozlov@student.university.edu'
        ];
        
        // Проверяем, каких начальных пользователей еще нет
        const missingInitialUsers = [];
        
        const initialUsers = [
            {
                id: 'user_1',
                name: 'Иван Петров',
                email: 'ivan.petrov@student.university.edu',
                password: 'password123',
                rating: 4.8,
                reviews: 12,
                joinDate: '2023-09-01T00:00:00.000Z',
                createdAt: '2023-09-01T00:00:00.000Z',
                updatedAt: '2023-09-01T00:00:00.000Z'
            },
            {
                id: 'user_2',
                name: 'Анна Сидорова',
                email: 'anna.sidorova@student.university.edu',
                password: 'password123',
                rating: 4.6,
                reviews: 8,
                joinDate: '2023-09-15T00:00:00.000Z',
                createdAt: '2023-09-15T00:00:00.000Z',
                updatedAt: '2023-09-15T00:00:00.000Z'
            },
            {
                id: 'user_3',
                name: 'Михаил Козлов',
                email: 'mikhail.kozlov@student.university.edu',
                password: 'password123',
                rating: 4.9,
                reviews: 15,
                joinDate: '2023-08-20T00:00:00.000Z',
                createdAt: '2023-08-20T00:00:00.000Z',
                updatedAt: '2023-08-20T00:00:00.000Z'
            }
        ];
        
        // Добавляем только недостающих начальных пользователей
        initialUsers.forEach(initialUser => {
            const exists = existingUsers.some(user => user.email === initialUser.email);
            if (!exists) {
                missingInitialUsers.push(initialUser);
                console.log(`Добавляем недостающего начального пользователя: ${initialUser.name}`);
            }
        });
        
        if (missingInitialUsers.length > 0) {
            // Добавляем недостающих пользователей к существующим
            const allUsers = [...existingUsers, ...missingInitialUsers];
            localStorage.setItem('campusMarketplaceUsers', JSON.stringify(allUsers));
            console.log(`Добавлено ${missingInitialUsers.length} недостающих начальных пользователей`);
            console.log('Общее количество пользователей:', allUsers.length);
        } else {
            console.log('Все начальные пользователи уже существуют');
        }
        
        return existingUsers;
    },

    /**
     * Создание начальных сообщений
     */
    createInitialMessages: function() {
        // Проверяем, есть ли уже сообщения
        const existingMessages = localStorage.getItem('campusMarketplaceMessages');
        if (existingMessages) {
            console.log('Сообщения уже существуют, пропускаем создание начальных');
            return;
        }
        
        // Создаем пустой массив сообщений
        const initialMessages = [];
        
        localStorage.setItem('campusMarketplaceMessages', JSON.stringify(initialMessages));
        console.log('Начальные сообщения созданы (пустой массив):', initialMessages);
    },

    // =============================================================================
    // УТИЛИТЫ
    // =============================================================================

    /**
     * Генерация уникального ID
     */
    generateId: function() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    /**
     * Принудительная синхронизация данных (очистка и пересоздание)
     */
    forceSyncData: function() {
        console.log('=== Принудительная синхронизация данных ===');
        
        // Очищаем все данные КРОМЕ пользователей
        this.clearAllDataExceptUsers();
        
        // Пересоздаем начальные данные (пользователи сохраняются)
        this.createInitialUsers();
        this.createGlobalCatalog();
        this.createInitialMessages();
        
        console.log('Данные синхронизированы и пересозданы (пользователи сохранены)');
        
        // Показываем уведомление пользователю
        if (window.CampusMarketplace && window.CampusMarketplace.ui) {
            window.CampusMarketplace.ui.showNotification('Данные синхронизированы (пользователи сохранены)', 'success');
        }
    },

    /**
     * Очистка всех данных
     */
    clearAllData: function() {
        localStorage.removeItem('campusMarketplaceUsers');
        localStorage.removeItem('campusMarketplaceListings');
        localStorage.removeItem('campusMarketplaceMessages');
        localStorage.removeItem('campusMarketplaceUser');
        console.log('Все данные очищены');
    },

    /**
     * Очистка всех данных КРОМЕ пользователей
     */
    clearAllDataExceptUsers: function() {
        // Сохраняем пользователей
        const users = localStorage.getItem('campusMarketplaceUsers');
        const currentUser = localStorage.getItem('campusMarketplaceUser');
        
        // Очищаем все данные
        localStorage.removeItem('campusMarketplaceListings');
        localStorage.removeItem('campusMarketplaceMessages');
        localStorage.removeItem('campusMarketplaceUser');
        
        // Восстанавливаем пользователей
        if (users) {
            localStorage.setItem('campusMarketplaceUsers', users);
        }
        if (currentUser) {
            localStorage.setItem('campusMarketplaceUser', currentUser);
        }
        
        console.log('Все данные очищены (пользователи сохранены)');
    },

    /**
     * Очистка только объявлений
     */
    clearAllListings: function() {
        localStorage.removeItem('campusMarketplaceListings');
        console.log('Все объявления очищены');
        
        // Показываем уведомление пользователю
        if (window.CampusMarketplace && window.CampusMarketplace.ui) {
            window.CampusMarketplace.ui.showNotification('Каталог товаров очищен', 'success');
        }
    },

    /**
     * Полная очистка каталога товаров
     */
    clearCatalog: function() {
        console.log('=== Очистка каталога товаров ===');
        
        // Очищаем все объявления
        this.clearAllListings();
        
        // Создаем пустой каталог
        const emptyCatalog = [];
        localStorage.setItem('campusMarketplaceListings', JSON.stringify(emptyCatalog));
        
        console.log('Каталог товаров полностью очищен');
        
        // Показываем уведомление пользователю
        if (window.CampusMarketplace && window.CampusMarketplace.ui) {
            window.CampusMarketplace.ui.showNotification('Каталог товаров полностью очищен', 'success');
        }
        
        return emptyCatalog;
    },

    /**
     * ПРИНУДИТЕЛЬНАЯ очистка ВСЕХ данных
     */
    forceClearAllData: function() {
        console.log('=== ПРИНУДИТЕЛЬНАЯ очистка ВСЕХ данных ===');
        
        // Очищаем все ключи localStorage связанные с приложением
        const keysToRemove = [
            'campusMarketplaceListings',
            'campusMarketplaceUsers',
            'campusMarketplaceMessages',
            'campusMarketplaceCurrentUser',
            'campusMarketplaceDataVersion'
        ];
        
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
            console.log(`Удален ключ: ${key}`);
        });
        
        // Пересоздаем пустую базу данных
        this.createInitialUsers();
        this.createGlobalCatalog(); // Создаст пустой каталог
        this.createInitialMessages(); // Создаст пустые сообщения
        
        console.log('ВСЕ данные принудительно очищены и пересозданы');
        
        // Показываем уведомление пользователю
        if (window.CampusMarketplace && window.CampusMarketplace.ui) {
            window.CampusMarketplace.ui.showNotification('Все данные принудительно очищены!', 'success');
        }
        
        // Перезагружаем страницу для применения изменений
        setTimeout(() => {
            window.location.reload();
        }, 1000);
        
        return true;
    },

    /**
     * Синхронизация каталога с базой данных
     */
    syncCatalog: function() {
        console.log('=== Синхронизация каталога ===');
        
        // Пересоздаем глобальный каталог
        this.createGlobalCatalog();
        
        console.log('Каталог синхронизирован с базой данных');
        
        // Показываем уведомление пользователю
        if (window.CampusMarketplace && window.CampusMarketplace.ui) {
            window.CampusMarketplace.ui.showNotification('Каталог синхронизирован', 'success');
        }
        
        return this.getListings();
    },

    /**
     * Получение текущего авторизованного пользователя
     */
    getCurrentUser: function() {
        const savedUser = localStorage.getItem('campusMarketplaceUser');
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                console.log('Текущий пользователь:', user);
                return user;
            } catch (error) {
                console.error('Ошибка при парсинге пользователя:', error);
                return null;
            }
        }
        console.log('Пользователь не авторизован');
        return null;
    },

    /**
     * Обновление аватара пользователя
     */
    updateUserAvatar: function(userId, avatarData) {
        try {
            // Получаем пользователя
            const users = JSON.parse(localStorage.getItem('campusMarketplaceUsers') || '[]');
            const userIndex = users.findIndex(u => u.id === userId);
            
            if (userIndex === -1) {
                throw new Error('Пользователь не найден');
            }
            
            // Обновляем аватар
            users[userIndex].avatar = avatarData;
            
            // Сохраняем в localStorage
            localStorage.setItem('campusMarketplaceUsers', JSON.stringify(users));
            
            // Обновляем текущего пользователя
            const currentUser = this.getCurrentUser();
            if (currentUser && currentUser.id === userId) {
                currentUser.avatar = avatarData;
                localStorage.setItem('campusMarketplaceUser', JSON.stringify(currentUser));
            }
            
            return true;
        } catch (error) {
            console.error('Ошибка при обновлении аватара:', error);
            throw error;
        }
    }
};

// Экспорт для использования в других модулях
window.CampusMarketplaceDB = CampusMarketplaceDB;

console.log('CampusMarketplaceDB загружен с глобальным каталогом');
