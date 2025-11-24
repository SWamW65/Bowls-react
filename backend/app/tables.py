from datetime import date
from sqlalchemy import Column, Integer, String, ForeignKey, DECIMAL, Date, Float, Boolean
from sqlalchemy.orm import relationship
from database import Base


class UserDB(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)

class ProductDB (Base):
    __tablename__ = 'products'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False)
    date = Column(Date, nullable=False, default=date.today)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)

    user = relationship("UserDB")

