# bowls System

## Project setup

1. Make sure you have Docker and Docker Compose installed.
2. Clone this repository.
3. Create a `.env` file in the project root if you need local overrides. The backend Docker service already receives `DATABASE_URL=postgresql://postgres:samlink@db:5432/bowls` from `docker-compose.yml`.
4. Stop old containers if they are running:

```bash
docker compose down
```

If your Docker installation only supports the legacy command, use `docker-compose` instead of `docker compose`.

5. Build and start the project:

```bash
docker compose up -d --build
```

6. Check container logs if something does not start:

```bash
docker compose logs -f backend
```

## Как это синхронизировать с Docker на вашем компьютере

Код синхронизируется не через Docker, а через Git и локальную папку проекта. Обычно порядок такой:

1. Остановите контейнеры, если проект сейчас запущен:

```bash
docker compose down
```

2. Заберите изменения из репозитория. Если обычный `git pull` у вас не работает из-за непривязанной ветки, используйте вашу текущую удаленную ветку `Master/origin`:

```bash
git pull Master origin
```

3. Пересоберите и запустите контейнеры, чтобы Docker взял новые зависимости, Dockerfile, `docker-compose.yml` и код приложения:

```bash
docker compose up -d --build
```

Если контейнеры не были запущены, первый шаг с `docker compose down` можно пропустить. Если у вас старая версия Docker Compose, замените `docker compose` на `docker-compose`.

Если `git pull Master origin` пишет `Already up to date`, но файлы на компьютере не поменялись, значит в ветке `Master/origin` этих изменений еще нет. Изменения, сделанные в PR/ветке Codex, сначала нужно смержить или запушить в тот remote/branch, откуда вы делаете pull. Проверьте, есть ли нужный commit в вашей локальной истории:

```bash
git log --oneline -5
```

Если в истории нет commit с изменениями Alembic/README, значит вы подтягиваете не ту ветку или PR еще не смержен в `Master/origin`. После merge/push повторите:

```bash
git pull Master origin
docker compose up -d --build
```

Если `git pull` пишет `There is no tracking information for the current branch`, значит текущая локальная ветка не привязана к удаленной ветке. Это не проблема Docker и не проблема Alembic. Проверьте имя remote и ветки:

```bash
git remote -v
git branch -vv
```

Сначала обновите список удаленных веток:

```bash
git fetch --all --prune
git branch -r
```

Если в списке есть `Master/fix/alembic-work`, привяжите ветку один раз и повторите `git pull`:

```bash
git branch --set-upstream-to=Master/fix/alembic-work fix/alembic-work
git pull
```

Если Git пишет `the requested upstream branch 'Master/fix/alembic-work' does not exist`, значит такой ветки на remote сейчас нет или она называется иначе. В этом случае есть два частых варианта:

1. Нужно подтянуть основную ветку проекта, а не `fix/alembic-work`:

```bash
git fetch Master
git pull Master main
```

Если основная ветка называется `master`, используйте:

```bash
git pull Master master
```

Если `git branch -r` показывает только `Master/HEAD -> Master/origin` и `Master/origin`, значит доступная удаленная ветка называется `origin`. Тогда подтяните ее так:

```bash
git pull Master origin
```

Или привяжите текущую локальную ветку к ней:

```bash
git branch --set-upstream-to=Master/origin fix/alembic-work
git pull
```

2. Нужно впервые отправить вашу локальную ветку `fix/alembic-work` на remote и сразу привязать upstream:

```bash
git push -u Master fix/alembic-work
```

Одноразовый вариант pull без привязки ветки работает только если такая ветка уже есть на remote:

```bash
git pull Master fix/alembic-work
```

Если у вас remote называется `origin`, замените `Master` на `origin` в командах выше.

3. Backend перед запуском сам выполнит миграции Alembic:

```bash
alembic upgrade head
```

Эта команда уже прописана в `docker-compose.yml` для backend-контейнера, поэтому отдельно запускать ее обычно не нужно.

4. Если нужно запустить миграции вручную внутри backend-контейнера:

```bash
docker compose exec backend alembic upgrade head
```

5. Если база в Docker уже была создана раньше и вы хотите полностью начать с чистой базы, удалите volume PostgreSQL. Это удалит данные:

```bash
docker compose down -v
docker compose up -d --build
```

Обычный `docker compose down` контейнеры остановит, но данные PostgreSQL в volume сохранит.

## Alembic и `init_db`

Alembic теперь отвечает за создание и изменение схемы базы данных. Поэтому отдельный `init_db()`/`Base.metadata.create_all()` в приложении не нужен: иначе получится два разных механизма, которые пытаются управлять одними и теми же таблицами.

Текущий порядок такой:

1. Docker ждет, пока PostgreSQL станет healthy.
2. Backend запускает `alembic upgrade head`.
3. Alembic применяет все миграции из `backend/app/alembic/versions`.
4. После успешных миграций стартует FastAPI-приложение.

Полезные команды:

```bash
# Посмотреть текущую ревизию БД
docker compose exec backend alembic current

# Применить миграции вручную
docker compose exec backend alembic upgrade head

# Создать новую миграцию после изменения SQLAlchemy-моделей
docker compose exec backend alembic revision --autogenerate -m "describe change"
```

После автогенерации миграции всегда откройте новый файл в `backend/app/alembic/versions` и проверьте, что Alembic не предлагает случайно удалить нужные таблицы или колонки.

## Настройка pgAdmin после запуска

1. Откройте http://localhost:8081 в браузере.
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
   - Для бэкапа можно использовать `docker compose down` + копирование Docker volumes

3. **Оптимизация**:
   - Для production можно добавить конфигурацию для ограничения ресурсов
   - Настроить логирование

Теперь у вас есть полноценный веб-интерфейс для управления базой данных прямо в браузере!
