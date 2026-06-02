# Ethara Inventory API

Base URL: `http://localhost:8000`

Interactive OpenAPI docs are available at `/docs` when the backend is running.

## Products

| Method | Path | Description |
| --- | --- | --- |
| GET | `/products?search=&category=&low_stock=false` | List, search, and filter products |
| GET | `/products/{id}` | Get product details |
| POST | `/products` | Create a product |
| PUT | `/products/{id}` | Update a product |
| DELETE | `/products/{id}` | Delete a product |

Product validation:

- `sku` must be unique.
- `price` must be greater than zero.
- `quantity` cannot be negative.

## Customers

| Method | Path | Description |
| --- | --- | --- |
| GET | `/customers?search=` | List/search customers |
| GET | `/customers/{id}` | Get customer details |
| POST | `/customers` | Create a customer |
| PUT | `/customers/{id}` | Update a customer |
| DELETE | `/customers/{id}` | Delete a customer |

Customer validation:

- `email` must be unique and valid.

## Orders

| Method | Path | Description |
| --- | --- | --- |
| GET | `/orders` | List orders with customer and item details |
| GET | `/orders/{id}` | Get order details |
| POST | `/orders` | Create an order |
| PUT | `/orders/{id}` | Update order status |
| DELETE | `/orders/{id}` | Delete an order |

Create order body:

```json
{
  "customer_id": 1,
  "status": "Pending",
  "items": [
    { "product_id": 1, "quantity": 2 }
  ]
}
```

Order rules:

- Creation fails if a customer or product does not exist.
- Creation fails with `409` if stock is insufficient.
- Product inventory is reduced atomically when the order is created.
- `total_amount` is calculated from product prices on the server.

## Dashboard

| Method | Path | Description |
| --- | --- | --- |
| GET | `/dashboard/stats` | Summary cards, recent orders, low stock, and chart data |

## Auth

| Method | Path | Description |
| --- | --- | --- |
| POST | `/auth/register` | Create a user and return a JWT |
| POST | `/auth/login` | Return a JWT |
