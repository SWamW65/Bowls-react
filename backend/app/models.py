from pydantic import BaseModel, conint
from datetime import date


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


# class ProductCreate(BaseModel):
#     product_name: str
#
# class PriceCreate(BaseModel):
#     product_id: int
#     price_value: Decimal
#     valid_from: date
#     valid_to: date | None = None
#
# class ProductionEntryCreate(BaseModel):
#     product_id: int
#     quantity: conint(gt=0)
#     entry_date: date = date.today()
#
# class Product(ProductCreate):
#     product_id: int
#     class Config:
#         from_attributes = True
#
# class Price(PriceCreate):
#     price_id: int
#     class Config:
#         from_attributes = True
#
# class ProductionEntry(ProductionEntryCreate):
#     entry_id: int
#     class Config:
#         from_attributes = True
#
#
