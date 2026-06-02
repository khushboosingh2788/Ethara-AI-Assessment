from pydantic import BaseModel

from app.schemas.order import OrderRead
from app.schemas.product import ProductRead


class DashboardStats(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    revenue: float
    low_stock_products: list[ProductRead]
    recent_orders: list[OrderRead]
    revenue_series: list[dict[str, float | str]]
    category_breakdown: list[dict[str, int | str]]
    order_status_breakdown: list[dict[str, int | str]]
