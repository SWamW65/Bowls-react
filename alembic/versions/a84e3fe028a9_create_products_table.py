"""Create products table

Revision ID: a84e3fe028a9
Revises: 9065e57ca0fe
Create Date: 2025-10-10 22:35:16.208988

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a84e3fe028a9'
down_revision: Union[str, Sequence[str], None] = '9065e57ca0fe'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Создаем таблицу products
    op.create_table('products',
                    sa.Column('id', sa.Integer(), nullable=False),
                    sa.Column('name', sa.String(length=100), nullable=False),
                    sa.Column('price', sa.Float(), nullable=False),
                    sa.Column('quantity', sa.Integer(), nullable=False),
                    sa.Column('date', sa.Date(), nullable=False),
                    sa.PrimaryKeyConstraint('id')
                    )
    # Создаем индекс для id
    op.create_index(op.f('ix_products_id'), 'products', ['id'], unique=False)

    # Если нужны начальные данные, можно добавить:
    # op.bulk_insert('products', [
    #     {'name': 'Шар', 'price': 10.0, 'quantity': 250, 'date': '2025-09-30'},
    #     {'name': 'Пончики', 'price': 8.0, 'quantity': 160, 'date': '2025-09-30'},
    # ])


def downgrade():
    # Удаляем таблицу при откате миграции
    op.drop_index(op.f('ix_products_id'), table_name='products')
    op.drop_table('products')