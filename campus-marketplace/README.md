# Campus Marketplace

Студенческий маркетплейс для покупки, продажи и обмена учебных материалов.

## 🚀 Возможности

- **Аутентификация пользователей** - вход и регистрация
- **Каталог товаров** - просмотр, фильтрация, поиск
- **Добавление объявлений** - создание новых предложений
- **Система сообщений** - связь между покупателями и продавцами
- **Профили пользователей** - управление личной информацией
- **База данных** - хранение всех данных в localStorage

## 👥 Тестовые аккаунты

### Существующие пользователи:

| Email | Пароль | Имя | Рейтинг |
|-------|--------|-----|---------|
| `anna.petrova@student.edu` | `password123` | Анна Петрова | 4.8 ⭐ |
| `mikhail.sidorov@student.edu` | `password123` | Михаил Сидоров | 4.6 ⭐ |
| `elena.kozlova@student.edu` | `password123` | Елена Козлова | 4.9 ⭐ |
| `dmitry.volkov@student.edu` | `password123` | Дмитрий Волков | 4.4 ⭐ |

### Регистрация новых пользователей:
- Перейдите на страницу `/pages/register.html`
- Заполните форму регистрации
- Новый пользователь автоматически добавится в базу данных

## 🗄️ База данных (CampusMarketplaceDB)

### Основные функции:

#### Пользователи:
- `getUsers()` - получить всех пользователей
- `getUserById(userId)` - получить пользователя по ID
- `registerUser(userData)` - зарегистрировать нового пользователя
- `updateUser(userId, updateData)` - обновить данные пользователя
- `deleteUser(userId)` - удалить пользователя
- `addUserReview(userId, reviewData)` - добавить отзыв пользователю

#### Объявления:
- `getListings()` - получить все объявления
- `getListingById(listingId)` - получить объявление по ID
- `getUserListings(userId)` - получить объявления пользователя
- `addListing(listingData)` - добавить новое объявление
- `updateListing(listingId, updateData)` - обновить объявление
- `deleteListing(listingId)` - удалить объявление
- `searchListings(filters)` - поиск объявлений с фильтрами

#### Сообщения:
- `getUserMessages(userId)` - получить сообщения пользователя
- `addMessage(messageData)` - добавить новое сообщение

#### Утилиты:
- `generateId()` - генерация уникального ID
- `clearAllData()` - очистить все данные (для тестирования)
- `exportData()` - экспорт данных в JSON
- `importData(jsonData)` - импорт данных из JSON

### Структура данных:

#### Пользователь:
```javascript
{
    id: 'user1',
    name: 'Анна Петрова',
    email: 'anna.petrova@student.edu',
    password: 'password123',
    rating: 4.8,
    reviews: 12,
    avatar: 'https://...',
    joinDate: '2024-01-15'
}
```

#### Объявление:
```javascript
{
    id: '1',
    title: 'Учебник по математическому анализу',
    description: 'Описание товара...',
    price: 1500,
    category: 'textbooks',
    condition: 'good',
    image: 'https://...',
    seller: {
        id: 'user1',
        name: 'Анна Петрова',
        rating: 4.8
    },
    createdAt: '2024-03-15T10:00:00.000Z',
    updatedAt: '2024-03-15T10:00:00.000Z'
}
```

#### Сообщение:
```javascript
{
    id: 'msg1',
    senderId: 'user1',
    receiverId: 'user2',
    text: 'Текст сообщения',
    timestamp: '2024-03-15T10:00:00.000Z'
}
```

## 🔧 Использование

### 1. Инициализация:
```javascript
// База данных автоматически инициализируется при загрузке страницы
CampusMarketplaceDB.initialize();
```

### 2. Добавление объявления:
```javascript
const newListing = CampusMarketplaceDB.addListing({
    title: 'Название товара',
    description: 'Описание товара',
    price: 1000,
    category: 'textbooks',
    condition: 'new',
    image: 'https://example.com/image.jpg',
    seller: {
        id: 'user1',
        name: 'Имя пользователя',
        rating: 5.0
    }
});
```

### 3. Поиск объявлений:
```javascript
const results = CampusMarketplaceDB.searchListings({
    category: 'textbooks',
    search: 'математика',
    minPrice: 500,
    maxPrice: 2000,
    condition: ['new', 'excellent'],
    rating: 4,
    sort: 'price-asc'
});
```

### 4. Регистрация пользователя:
```javascript
const newUser = CampusMarketplaceDB.registerUser({
    name: 'Иван Иванов',
    email: 'ivan@example.com',
    password: 'password123'
});
```

## 📁 Структура проекта

```
campus-marketplace/
├── index.html              # Главная страница
├── pages/
│   ├── catalog.html        # Каталог товаров
│   ├── profile.html        # Профиль пользователя
│   └── register.html       # Регистрация
├── css/
│   ├── styles.css          # Основные стили
│   ├── catalog.css         # Стили каталога
│   └── profile.css         # Стили профиля
├── js/
│   ├── database.js         # База данных
│   ├── main.js             # Основная логика
│   ├── catalog.js          # Логика каталога
│   ├── profile.js          # Логика профиля
│   ├── search.js           # Поиск
│   └── filters.js          # Фильтры
└── README.md               # Документация
```

## 🚀 Запуск

1. Клонируйте репозиторий
2. Откройте `index.html` в браузере
3. Или запустите локальный сервер:
   ```bash
   python -m http.server 8000
   ```
4. Откройте `http://localhost:8000`

## 🔒 Безопасность

- Все пароли хранятся в открытом виде (для демонстрации)
- В продакшене используйте хеширование паролей
- Добавьте валидацию на сервере
- Используйте HTTPS для защиты данных

## 📝 Лицензия

Этот проект создан для демонстрации возможностей веб-разработки. Используйте на свой страх и риск.

## 🤝 Поддержка

По всем вопросам обращайтесь: chesterteamhack@gmail.com
