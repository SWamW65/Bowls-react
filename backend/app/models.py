from typing import List
from pydantic import BaseModel, conint
from datetime import date

# МОДЕЛИ ДЛЯ АВТОРИЗАЦИИ
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# ОТПРАВКА ОТЧЕТА ПО ИЗДЕЛИЯМ ЗА ДЕНЬ
class ProductCreate(BaseModel):
    name: str
    price: float
    quantity: conint(gt=0)
    date: date

class ProductResponse(BaseModel):
    id: int
    name: str
    price: float
    quantity: conint(gt=0)
    date: date

class DailySummeryResponse(BaseModel):
    date: date
    total_quantity: int
    total_amount: float

class CurrentDailyProductResponse(BaseModel):
    id: int
    name: str
    date: date

class CurrentSalaryResponse(BaseModel):
    current_month: date  # Первый день текущего месяца
    month_total: float   # Сумма за месяц
    today_total: float   # Сумма за сегодня

class MonthYearResponse(BaseModel):
    months: List[date]
    years: List[int]
    current_month: date
    current_year: int

