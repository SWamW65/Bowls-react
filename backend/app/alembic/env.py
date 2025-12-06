# alembic/env.py (полный пример)

import os
import sys
from logging.config import fileConfig
from dotenv import load_dotenv

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# Загружаем .env файл из корня проекта
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path=env_path)

# Добавляем путь к папке backend
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# Затем добавляем путь к app внутри backend
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend', 'app'))

# Импортируем модели
try:
    from database import Base, DATABASE_URL
except ImportError:
    # Альтернативный путь импорта
    import sys
    sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend', 'app'))
    from database import Base, DATABASE_URL

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Если DATABASE_URL импортирована напрямую
db_url = DATABASE_URL
# ИЛИ получаем из переменных окружения
# db_url = os.getenv("DATABASE_URL")

if not db_url:
    raise ValueError("DATABASE_URL не установлен")

config.set_main_option("sqlalchemy.url", db_url)

target_metadata = Base.metadata

def run_migrations_offline():
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()