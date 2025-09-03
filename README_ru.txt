# Campus Marketplace — локальная версия (FastAPI + SQLite)

Эта сборка включает:
- **Frontend** (папка `campus-marketplace/`) — готовая статика (HTML/CSS/JS).
- **Backend** (папка `app/`) — FastAPI + SQLAlchemy + SQLite.
- **Локальная база данных** — файл `campus_marketplace.db` создаётся автоматически.
- **Автозапуск на Windows** — `run_all.bat` (создаёт venv, устанавливает зависимости, запускает Uvicorn).
- **API-адаптер** — `js/api_adapter.js` перенаправляет вызовы `CampusMarketplaceDB` в FastAPI.

## Быстрый старт (Windows)

1. Убедитесь, что установлен **Python 3.10+**.
2. Запустите файл: **`run_all.bat`** (двойной клик).
   - Скрипт создаст виртуальное окружение `.venv` (если его нет),
   - установит зависимости из `requirements.txt`,
   - запустит сервер: `http://127.0.0.1:8000`.
3. Откройте браузер и перейдите по адресу: **http://127.0.0.1:8000**
   - Frontend обслуживается самим FastAPI как статические файлы.
   - API доступно по префиксу: **`/api`**, например: `http://127.0.0.1:8000/api/listings`

## Структура
```
.
├─ app/
│  ├─ main.py           # Точка входа FastAPI (API + раздача статики)
│  ├─ database.py       # Подключение к SQLite
│  ├─ models.py         # SQLAlchemy модели
│  ├─ schemas.py        # Pydantic-схемы
│  └─ crud.py           # Бизнес-логика
├─ campus-marketplace/  # Вся статика (HTML, CSS, JS, изображения)
│  └─ js/api_adapter.js # Переназначение методов DB на API вызовы
├─ requirements.txt
├─ run_all.bat          # Автозапуск (venv + uvicorn)
└─ README_ru.txt        # Этот файл
```

## Замечания по фронтенду
- В `index.html` и страницах в `pages/` автоматически подключён `js/api_adapter.js`.
- Адаптер **не ломает** существующую логику и просто перенаправляет ключевые методы `CampusMarketplaceDB` на API (по умолчанию `/api`).
- Для простоты изображения объявлений передаются **как base64**-строки или массив URL-ов и сохраняются в БД как JSON (TEXT).

## Примеры API
- Список пользователей: `GET /api/users`
- Поиск объявлений: `GET /api/listings?q=алгебра&category=Учебники&page=1&page_size=12&sort=price_asc`
- Создание объявления: `POST /api/listings`
  ```json
  {
    "title": "Учебник по физике",
    "description": "Состояние отличное",
    "price": 700,
    "category": "Учебники",
    "condition": "Как новый",
    "images": [],
    "location": "УРФУ, ГУК",
    "seller_id": 1
  }
  ```
- Обновление объявления: `PUT /api/listings/1`
- Удаление объявления: `DELETE /api/listings/1`

## Где база данных?
Файл `campus_marketplace.db` будет создан в корне рядом с этим README (после первого запуска сервера).

## Запуск вручную (без .bat)
```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000
```
После запуска перейдите: `http://127.0.0.1:8000`

## Примечание
В некоторых местах фронтенд может ожидать старое локальное хранилище. Адаптер покрывает операции:
- `getUsers()`,
- `searchListings(filters)` — возвращает объект `{ items, total, page, page_size }`,
- `addListing(listingData)`,
- `updateListing(id, data)`,
- `deleteListing(id)`.

При желании можно расширить адаптер, добавив другие методы и маппинг полей.