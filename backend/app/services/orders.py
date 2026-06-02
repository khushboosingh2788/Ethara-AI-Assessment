from collections import defaultdict

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.models import Customer, Order, OrderItem, Product
from app.schemas.order import OrderCreate


def create_order(db: Session, payload: OrderCreate) -> Order:
    customer = db.get(Customer, payload.customer_id)
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found.")

    requested: dict[int, int] = defaultdict(int)
    for item in payload.items:
        requested[item.product_id] += item.quantity

    products = (
        db.query(Product)
        .filter(Product.id.in_(requested.keys()))
        .with_for_update()
        .all()
    )
    product_map = {product.id: product for product in products}

    missing = set(requested) - set(product_map)
    if missing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product not found: {sorted(missing)[0]}.")

    for product_id, quantity in requested.items():
        product = product_map[product_id]
        if product.quantity < quantity:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Insufficient stock for {product.name}. Available: {product.quantity}, requested: {quantity}.",
            )

    order = Order(customer_id=payload.customer_id, status=payload.status, total_amount=0)
    db.add(order)
    db.flush()

    total = 0.0
    for product_id, quantity in requested.items():
        product = product_map[product_id]
        unit_price = float(product.price)
        product.quantity -= quantity
        total += unit_price * quantity
        db.add(OrderItem(order_id=order.id, product_id=product.id, quantity=quantity, unit_price=unit_price))

    order.total_amount = total
    db.commit()
    return (
        db.query(Order)
        .options(joinedload(Order.customer), joinedload(Order.items).joinedload(OrderItem.product))
        .filter(Order.id == order.id)
        .one()
    )
