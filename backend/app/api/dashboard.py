from collections import defaultdict

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.models import Customer, Order, OrderItem, Product
from app.schemas.dashboard import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
def dashboard_stats(db: Session = Depends(get_db)):
    total_products = db.query(Product).count()
    total_customers = db.query(Customer).count()
    total_orders = db.query(Order).count()
    revenue = float(db.query(func.coalesce(func.sum(Order.total_amount), 0)).scalar() or 0)
    low_stock = db.query(Product).filter(Product.quantity <= 10).order_by(Product.quantity.asc()).limit(8).all()
    recent_orders = (
        db.query(Order)
        .options(joinedload(Order.customer), joinedload(Order.items).joinedload(OrderItem.product))
        .order_by(Order.created_at.desc())
        .limit(6)
        .all()
    )

    revenue_rows = (
        db.query(func.date_trunc("day", Order.created_at).label("day"), func.sum(Order.total_amount))
        .group_by("day")
        .order_by("day")
        .limit(14)
        .all()
    )
    revenue_series = [{"date": str(day.date()), "revenue": float(total)} for day, total in revenue_rows]

    category_rows = db.query(Product.category, func.count(Product.id)).group_by(Product.category).all()
    category_breakdown = [{"name": name, "value": count} for name, count in category_rows]

    status_rows = db.query(Order.status, func.count(Order.id)).group_by(Order.status).all()
    order_status_breakdown = [{"name": status.value, "value": count} for status, count in status_rows]

    if not revenue_series:
        revenue_series = [{"date": f"Day {index}", "revenue": value} for index, value in enumerate([4200, 5100, 4700, 6900, 7400, 8600, 9100], 1)]
    if not category_breakdown:
        category_breakdown = [{"name": "Hardware", "value": 38}, {"name": "Software", "value": 24}, {"name": "Accessories", "value": 18}]
    if not order_status_breakdown:
        order_status_breakdown = [{"name": "Pending", "value": 8}, {"name": "Processing", "value": 12}, {"name": "Completed", "value": 32}, {"name": "Cancelled", "value": 3}]

    return DashboardStats(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        revenue=revenue,
        low_stock_products=low_stock,
        recent_orders=recent_orders,
        revenue_series=revenue_series,
        category_breakdown=category_breakdown,
        order_status_breakdown=order_status_breakdown,
    )
