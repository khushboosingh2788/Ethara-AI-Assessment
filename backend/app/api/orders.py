from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.models import Order, OrderItem
from app.schemas.order import OrderCreate, OrderRead, OrderUpdate
from app.services.orders import create_order

router = APIRouter(prefix="/orders", tags=["Orders"])


def order_query(db: Session):
    return db.query(Order).options(joinedload(Order.customer), joinedload(Order.items).joinedload(OrderItem.product))


@router.get("", response_model=list[OrderRead])
def list_orders(status_filter: str | None = None, db: Session = Depends(get_db)):
    query = order_query(db)
    if status_filter:
        query = query.filter(Order.status == status_filter)
    return query.order_by(Order.created_at.desc()).all()


@router.get("/{order_id}", response_model=OrderRead)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = order_query(db).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")
    return order


@router.post("", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
def create_new_order(payload: OrderCreate, db: Session = Depends(get_db)):
    return create_order(db, payload)


@router.put("/{order_id}", response_model=OrderRead)
def update_order(order_id: int, payload: OrderUpdate, db: Session = Depends(get_db)):
    order = order_query(db).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")
    if payload.status is not None:
        order.status = payload.status
    db.commit()
    db.refresh(order)
    return order


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")
    db.delete(order)
    db.commit()
