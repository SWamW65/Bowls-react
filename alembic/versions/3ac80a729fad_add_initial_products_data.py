"""Add initial products data

Revision ID: 3ac80a729fad
Revises: a84e3fe028a9
Create Date: 2025-10-10 22:50:55.720699

"""
from typing import Sequence, Union

from alembic import op
from sqlalchemy.sql import table, column
from sqlalchemy import String, Float, Integer, Date
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3ac80a729fad'
down_revision: Union[str, Sequence[str], None] = 'a84e3fe028a9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Создаем объект таблицы для вставки данных
    products_table = table('products',
                           column('name', String),
                           column('price', Float),
                           column('quantity', Integer),
                           column('date', Date)
                           )

    # Вставляем данные с явным указанием кодировки
    op.execute("SET client_encoding TO 'UTF8';")

    # Вставляем тестовые данные
    op.bulk_insert(products_table,
                   [
                       {'name': 'Шар', 'price': 10.0, 'quantity': 250, 'date': '2025-09-30'},
                       {'name': 'Пончики', 'price': 8.0, 'quantity': 160, 'date': '2025-09-30'},
                       {'name': 'Лабубу', 'price': 7.0, 'quantity': 320, 'date': '2025-10-08'},
                       {'name': 'Единороги', 'price': 8.0, 'quantity': 189, 'date': '2025-10-08'},
                   ]
                   )


def downgrade():
    # Удаляем добавленные данные при откате
    op.execute("DELETE FROM products WHERE name IN ('Шар', 'Пончики', 'Лабубу', 'Единороги')")

