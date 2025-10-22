import logging
from typing import List

from click.testing import Result

logger = logging.getLogger(__name__)

from datetime import datetime
from sqlalchemy import extract, func

from fastapi import APIRouter
from fastapi.params import Depends
from sqlalchemy.orm import Session

from database import get_db
from models import ProductResponse, ProductCreate, DailySummeryResponse
from tables import ProductDB

from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/api")

@router.get("/health")
async def health_check():
    return JSONResponse(
        content={"status": "healthy", "service": "backend"},
        status_code=200
    )

@router.post("/submit", response_model=ProductResponse)
async def sendproduct(product: ProductCreate, db: Session = Depends(get_db)):
    try:
        db_product = ProductDB(
            name=product.name,
            quantity=product.quantity,
            price=product.price,
            date=product.date
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
        
@router.get("/get-current-month", response_model=List[DailySummeryResponse])
def productmonthget(db: Session = Depends(get_db)):
    today = datetime.now()

    daily_summery = (db.query(
        ProductDB.date,
        func.sum(ProductDB.quantity).label('total_quantity'),
        func.sum(ProductDB.price * ProductDB.quantity).label('total_amount')
    ).filter(
        extract('year', ProductDB.date) == today.year,
        extract('month', ProductDB.date) == today.month
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

@router.get("/get-for-day", response_model=List[ProductResponse])
def productdayget(db: Session = Depends(get_db)):
    product_day = (db.query(
        ProductDB.date,
        ProductDB.quantity,
        ProductDB.price,
        ProductDB.name
    ).group_by(
        ProductDB.date
    ).order_by(
        ProductDB.date.desc()).all())
    result = product_day

    return result

