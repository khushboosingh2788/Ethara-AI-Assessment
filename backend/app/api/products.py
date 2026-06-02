from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import OrderItem, Product
from app.schemas.product import ProductCreate, ProductRead, ProductUpdate

router = APIRouter(prefix="/products", tags=["Products"])


def ensure_unique_sku(db: Session, sku: str, product_id: int | None = None) -> None:
    query = db.query(Product).filter(func.lower(Product.sku) == sku.strip().lower())
    if product_id is not None:
        query = query.filter(Product.id != product_id)
    if query.first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A product with this SKU already exists.")


@router.get("", response_model=list[ProductRead])
def list_products(
    search: str | None = None,
    category: str | None = None,
    low_stock: bool = False,
    db: Session = Depends(get_db),
):
    query = db.query(Product)
    if search:
        like = f"%{search}%"
        query = query.filter(or_(Product.name.ilike(like), Product.sku.ilike(like), Product.description.ilike(like)))
    if category:
        query = query.filter(Product.category == category)
    if low_stock:
        query = query.filter(Product.quantity <= 10)
    return query.order_by(Product.created_at.desc()).all()


@router.get("/{product_id}", response_model=ProductRead)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")
    return product


@router.post("", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    data = payload.model_dump()
    data["sku"] = data["sku"].strip()
    ensure_unique_sku(db, data["sku"])
    product = Product(**data)
    db.add(product)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="SKU must be unique.")
    db.refresh(product)
    return product


@router.put("/{product_id}", response_model=ProductRead)
def update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")
    data = payload.model_dump(exclude_unset=True)
    if "sku" in data and data["sku"] is not None:
        data["sku"] = data["sku"].strip()
        ensure_unique_sku(db, data["sku"], product_id)
    for key, value in data.items():
        setattr(product, key, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="SKU must be unique.")
    db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")
    order_count = db.query(OrderItem).filter(OrderItem.product_id == product_id).count()
    if order_count:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This product cannot be deleted because it is linked to existing orders. Archive it or remove the related orders first.",
        )
    db.delete(product)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This product cannot be deleted because it is linked to existing records.",
        )
