from datetime import date

from sqlalchemy import Column, Integer, String, ForeignKey, DECIMAL, Date, Float
from sqlalchemy.orm import relationship

from database import Base

class ProductDB (Base):
    __tablename__ = 'products'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False)
    date = Column(Date, nullable=False, default=date.today)

# class ProductDB(Base):
#     __tablename__ = 'products'
#     product_id = Column(Integer, primary_key=True, index=True)
#     product_name = Column(String(100), nullable=False)
#     prices = relationship("PriceDB", back_populates='product')
#     productions = relationship("ProductionEntryDB", back_populates='product')
#
# class PriceDB(Base):
#     __tablename__ = 'price'
#     price_id = Column(Integer, primary_key=True, index=True)
#     product_id = Column(Integer, ForeignKey('products.product_id', ondelete="CASCADE"), nullable=False)
#     price_value = Column(DECIMAL(10, 2), nullable=False)
#     valid_from = Column(Date, nullable=False)
#     valid_to = Column(Date, nullable=True)
#     product = relationship('ProductDB', back_populates='prices')
#
# class ProductionEntryDB(Base):
#     __tablename__ = 'production_entries'
#     entry_id = Column(Integer, primary_key=True, index=True)
#     product_id = Column(Integer, ForeignKey('products.product_id', ondelete="CASCADE"), nullable=False)
#     quantity = Column(Integer, nullable=False)
#     entry_date = Column(Date, nullable=False, default=date.today)
#     product = relationship('ProductDB', back_populates='productions')
#
#
#
#
