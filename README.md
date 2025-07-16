# RIEAT - Restaurant Management System

RIEAT is a full-stack web application designed to help restaurant owners manage their business efficiently. It provides features for menu management, customer relationship management, order tracking, and a customer loyalty program.

## Features

*   **Menu Management:** Easily add, edit, and remove menu items. Categorize items for better organization.
*   **Customer Relationship Management (CRM):** Keep track of customer information, including their order history and loyalty status.
*   **Order Tracking:** Record and manage customer orders.
*   **Loyalty Program:** Reward loyal customers with a points-based system.
*   **Admin Dashboard:** A comprehensive dashboard for restaurant owners to manage all aspects of their business.
*   **Analytics:** Gain insights into your sales and customer data.

## Tech Stack

### Frontend

*   HTML
*   CSS
*   JavaScript

### Backend

*   **Node.js:** A JavaScript runtime for building scalable network applications.
*   **Express:** A fast, unopinionated, minimalist web framework for Node.js.
*   **MongoDB:** A NoSQL database for storing application data.
*   **Mongoose:** An elegant mongodb object modeling for node.js.
*   **JSON Web Token (JWT):** For securing API endpoints.
*   **Nodemailer:** For sending emails.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js and npm
*   MongoDB

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/rieat.git
    ```
2.  **Navigate to the backend directory and install dependencies:**
    ```bash
    cd rieat/backend
    npm install
    ```
3.  **Create a `.env` file in the `backend` directory and add the following:**
    ```
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    ```
4.  **Start the backend server:**
    ```bash
    npm start
    ```
5.  **Open the `frontend/index.html` file in your browser to view the application.**

## API Endpoints

*   `POST /api/admin/register`: Register a new admin.
*   `POST /api/admin/login`: Login as an admin.
*   `GET /api/menu`: Get all menu items.
*   `POST /api/menu`: Add a new menu item.
*   `GET /api/customers`: Get all customers.
*   `POST /api/customers`: Add a new customer.
*   `GET /api/orders`: Get all orders.
*   `POST /api/orders`: Create a new order.
*   `GET /api/reward-claims`: Get all reward claims.
*   `POST /api/reward-claims`: Create a new reward claim.
*   `GET /api/analytics`: Get sales and customer analytics.
*   `GET /api/settings`: Get application settings.
*   `POST /api/settings`: Update application settings.
*   `GET /api/loyalty`: Get loyalty program settings.
*   `POST /api/loyalty`: Update loyalty program settings.
*   `GET /api/feedback`: Get all feedback.
*   `POST /api/feedback`: Submit new feedback.
