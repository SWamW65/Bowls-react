# bowls System

## Project setup

1. Make sure you have Docker and Docker Compose installed
2. Clone this repository
3. Remove old containers command:

```bash
docker-compose down
```

4. Run the following command:

back console
```bash
docker-compose up -d --build
```
front console 
```bash
docker-compose up --build
```


## Настройка pgAdmin после запуска

1. Откройте http://localhost:5050 в браузере
2. Войдите с учетными данными:
   - Email: admin@bowls.com
   - Password: admin123
3. Добавьте сервер PostgreSQL:
   - Правой кнопкой на "Servers" → "Create" → "Server"
   - Введите имя "bowls PostgreSQL"
   - На вкладке "Connection":
     - Host name/address: `db` (имя сервиса в docker-compose)
     - Port: 5432
     - Username: postgres
     - Password: samlink

## Дополнительные улучшения

1. **Безопасность**:
   - В production измените пароли (особенно pgAdmin)
   - Добавьте .env файл для хранения секретов

2. **Резервное копирование**:
   - Данные PostgreSQL и pgAdmin сохраняются в volumes
   - Для бэкапа можно использовать `docker-compose down` + копирование папок volumes

3. **Оптимизация**:
   - Для production можно добавить конфигурацию для ограничения ресурсов
   - Настроить логирование

Теперь у вас есть полноценный веб-интерфейс для управления базой данных прямо в браузере!