E-Commerce Backend & Basic Frontend
1. Working Code – Backend API + Basic Frontend

This project is a simple e-commerce platform where users can manage products, categories, and orders. It includes a Node.js + Express backend with MongoDB, and a Next.js frontend using Tailwind CSS.

Features:

Backend:

Create, update, and list products.

Add products to categories.

Manage stock and low-stock alerts.

Create orders, fulfill or cancel them.

View user-specific orders.

Transaction-safe operations using Mongoose sessions.

Error handling for stock and invalid requests.

Frontend:

Product page: Create products and update stock.

Cart functionality: Add products and checkout to create orders.

Order management: Fulfill or cancel orders.

Category management: Add and view categories.

Basic styling with Tailwind CSS.

Dynamic routing via Next.js pages.

Note: No user authentication is implemented. Any user can buy or sell products.

2. Setup Instructions

Backend:-

Clone the repository:

git clone <repo-url>
cd <repo-folder>/backend


Install dependencies:

npm install

Run the server:

nodemon server.js / node server.js

The backend will run on http://localhost:5000.

Frontend (Next.js)

Navigate to frontend folder:

cd ../frontend


Install dependencies:

npm install

Run the frontend:

npm run dev


The frontend will run on http://localhost:3000.

3. API Documentation
Categories
Endpoint	Method	Body	Description
/api/categories	GET	-	List all categories
/api/categories	POST	{ name: string }	Create a new category
Products
Endpoint	Method	Body	Description
/api/products	GET	-	List all products
/api/products	POST	{ name, sku, price_paise, stock_quantity? }	Create a new product
/api/products/:id	PUT	{ price_paise?, stock_quantity? }	Update product details
/api/products/:id/stock	PUT	{ stock_quantity }	Update stock only
/api/products/low-stock	GET	-	List products with low stock
Orders
Endpoint	Method	Body	Description
/api/orders	POST	{ username, items: [{ product_id, quantity }] }	Create new order
/api/orders/user/:username	GET	-	Get orders for a user
/api/orders/:id	GET	-	Get single order
/api/orders/:id/status	PUT	{ status: pending/fulfilled/cancelled }	Update order status
/api/orders/:id/fulfill	POST	-	Mark order as fulfilled
