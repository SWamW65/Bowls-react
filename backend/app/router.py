import logging
from typing import List
from datetime import datetime, date, timedelta
from sqlalchemy import extract, func
from fastapi import APIRouter, Path
from fastapi.params import Depends
from sqlalchemy.orm import Session
from database import get_db
from models import ProductResponse, ProductCreate, DailySummeryResponse, CurrentDailyProductResponse, \
    CurrentSalaryResponse, MonthYearResponse, UserLogin, UserCreate, Token
from tables import ProductDB, UserDB
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status
from fastapi.responses import JSONResponse
from auth import (
    authenticate_user, create_access_token, get_password_hash,
    get_current_active_user, ACCESS_TOKEN_EXPIRE_MINUTES, SECRET_KEY
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api")

# ЭНДПОИНТЫ АВТОРИЗАЦИИ
@router.post("/register", response_model=Token)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    # Проверяем, существует ли пользователь
    db_user = db.query(UserDB).filter(
        (UserDB.username == user.username) | (UserDB.email == user.email)
    ).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с таким именем или email уже существует"
        )

    # Создаем нового пользователя

    hashed_password = get_password_hash(user.password)
    db_user = UserDB(username=user.username, email=user.email, hashed_password=hashed_password)

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
async def login(user: UserLogin, db: Session = Depends(get_db)):
    authenticated_user = authenticate_user(db, user.username, user.password)
    if not authenticated_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверное имя пользователя или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": authenticated_user.username}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/health")
async def health_check():
    return JSONResponse(
        content={"status": "healthy", "service": "backend"},
        status_code=200
    )

# ОТПРАВКА ИЗДЕЛИЙ НА ГЛАВНОЙ
@router.post("/submit", response_model=ProductResponse)
async def send_product(
        product: ProductCreate,
        db: Session = Depends(get_db),
        current_user: UserDB = Depends(get_current_active_user)
):
    try:
        db_product = ProductDB(
            name=product.name,
            quantity=product.quantity,
            price=product.price,
            date=product.date,
            user_id=current_user.id
        )
        db.add(db_product)
        db.commit()
        db.refresh(db_product)

        logger.info(f"Продукт успешно добавлен с ID: {db_product.id}")
        return db_product

    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Ошибка базы данных: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка добавления продукта в базу данныхы"
        )

# ЗАГРУЗКА ДАННЫХ ЗА ТЕКУЩИЙ МЕСЯЦ В РАЗДЕЛЕ ОБЩИЙ ПОДЧСЕТ
@router.get("/get-current-month", response_model=List[DailySummeryResponse])
def product_month_get(db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_active_user)):
    today = datetime.now()

    daily_summery = (db.query(
        ProductDB.date,
        func.sum(ProductDB.quantity).label('total_quantity'),
        func.sum(ProductDB.price * ProductDB.quantity).label('total_amount')
    ).filter(
        extract('year', ProductDB.date) == today.year,
        extract('month', ProductDB.date) == today.month,
        ProductDB.user_id == current_user.id
    ).group_by(
        ProductDB.date
    ).order_by(
        ProductDB.date.desc()).all())
    result = [
        DailySummeryResponse(
            date=summary_row.date,
            total_quantity=summary_row.total_quantity,
            total_amount=round(summary_row.total_amount, 2)
        )
        for summary_row in daily_summery
    ]

    return result

# ЗАГРУЗКА ДАННЫХ ЗА ДЕНЬ ДЕТАЛЬНО ПО ДНЮ
@router.get("/get-for-day/{selected_date}", response_model=List[ProductResponse])
def product_day_get(selected_date: date, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_active_user)):
    try:
        products = db.query(ProductDB).filter(
            ProductDB.date == selected_date,
            ProductDB.user_id == current_user.id
        ).order_by(
            ProductDB.id.desc()
        ).all()

        return products

    except SQLAlchemyError as e:
        logger.error(f"Ошибка базы данных: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка получения данных из базы данных"
        )

# ЗАГРУЗКА ДАННЫХ В КОМПОНЕНТ CurrentDayProducts ДЛЯ ПОЛУЧЕНИЯ ИЗДЕЛИЙ ЗА ЭТОТ ДЕНЬ НА ГЛАВНОЙ
@router.get("/get-only-product-for-day", response_model=List[CurrentDailyProductResponse])
def only_product_day_get(db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_active_user)):
    try:
        today = date.today()
        products = db.query(ProductDB.id, ProductDB.date, ProductDB.name).filter(
            ProductDB.date == today,
            ProductDB.user_id == current_user.id
        ).order_by(
            ProductDB.id.desc()
        ).all()

        return products

    except SQLAlchemyError as e:
        logger.error(f"Ошибка базы данных: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка получения данных из базы данных"
        )

# УДАЛЕНИЕ ИЗДЕЛИЙ ИЗ БЛОКА CurrentDayProducts
@router.delete("/delete-product-current-day/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product_current_day(
        id: int = Path(..., gt=0),
        db: Session = Depends(get_db),
        current_user: UserDB = Depends(get_current_active_user)
):
    try:
        db_product = db.query(ProductDB).get(id)
        if not db_product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Продукт не найден"
            )

        db.query(ProductDB).filter(
            ProductDB.id == id,
            ProductDB.user_id == current_user.id
        ).delete()
        db.commit()

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка удаления продукта: {str(e)}"
        )

# ЗАГРУЗКА ДАННЫХ В КОМПОНЕНТ CurrentSalaryBlock
@router.get("/get-current-salary", response_model=CurrentSalaryResponse)
def current_salary(db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_active_user)):
    try:
        today = date.today()
        first_day_of_month = date(today.year, today.month, 1)

        # Сумма за текущий месяц
        month_result = (db.query(
            func.sum(ProductDB.price * ProductDB.quantity).label('month_total')
        ).filter(
    extract('year', ProductDB.date) == today.year,
            extract('month', ProductDB.date) == today.month,
            ProductDB.user_id == current_user.id
        ).first())

        month_total = month_result.month_total or 0.0

        # Сумма за сегодня
        total_result = (db.query(
            func.sum(ProductDB.price * ProductDB.quantity).label('today_total')
        ).filter(
            ProductDB.date == today,
            ProductDB.user_id == current_user.id
        ).first())

        today_total = total_result.today_total or 0.0

        return CurrentSalaryResponse(
            current_month=first_day_of_month,
            month_total=round(month_total, 2),
            today_total=round(today_total, 2)
        )
    except SQLAlchemyError as e:
        logger.error(f"Ошибка базы данных: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка получения данных о зарплате"
        )


# ВЫГРУЖАЕМ МЕСЯЦЫ И ГОДЫ ЗА ТЕКУЩИЙ ГОД В CalendarMenu.jsx
@router.get("/get-months-for-menu", response_model=MonthYearResponse)
def months_for_menu(db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_active_user)):
    try:
        today = date.today()
        current_year = today.year

        # Получаем уникальные месяцы из базы данных
        months_query = (db.query(
            func.date_trunc('month', ProductDB.date).label('month')
        ).filter(
            extract('year', ProductDB.date) == current_year,
            ProductDB.user_id == current_user.id
        ).distinct().all())

        # Получаем уникальные годы из базы данных
        years_query = (db.query(
            extract('year', ProductDB.date).label('year')
        ).distinct().all())

        # Форматируем месяцы (первый день каждого месяца)
        months = [row.month for row in months_query]

        # Форматируем годы
        years = [int(row.year) for row in years_query]

        # Текущий месяц (первый день)
        current_month = date(today.year, today.month, 1)

        return MonthYearResponse(
            months=months,
            years=years,
            current_month=current_month,
            current_year=current_year
        )

    except SQLAlchemyError as e:
        logger.error(f"Ошибка базы данных: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка получения данных для меню"
        )

# ЭНДПОИНТ ДЛЯ ЗАГРУЗКИ ДАННЫХ ПО ВЫБРАННОМУ МЕСЯЦУ И ГОДУ
@router.get("/get-products-by-month", response_model=List[DailySummeryResponse])
def get_products_by_month(
        year: int,
        month: int,
        db: Session = Depends(get_db),
        current_user: UserDB = Depends(get_current_active_user),
):
    try:
        daily_summery = (db.query(
    ProductDB.date,
            func.sum(ProductDB.quantity).label('total_quantity'),
            func.sum(ProductDB.price * ProductDB.quantity).label('total_amount')
        ).filter(
    extract('year', ProductDB.date) == year,
            extract('month', ProductDB.date) == month,
            ProductDB.user_id == current_user.id
        ).group_by(
            ProductDB.date
        ).order_by(
            ProductDB.date.desc()).all())

        result = [
            DailySummeryResponse(
                date=summary_row.date,
                total_quantity=summary_row.total_quantity,
                total_amount=round(summary_row.total_amount, 2)
            )
            for summary_row in daily_summery
        ]

        return result

    except SQLAlchemyError as e:
        logger.error(f"Ошибка базы данных: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка получения данных за выбранный месяц"
        )