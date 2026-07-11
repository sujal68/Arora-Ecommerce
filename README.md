# 🛍️ Arova Commerce

<p align="center">
  <strong>A Production-Grade Full Stack MERN E-Commerce Platform with a Modern Admin Dashboard</strong>
</p>

<p align="center">
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" /></a>
  <a href="https://expressjs.com/"><img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" /></a>
  <a href="https://www.mongodb.com/"><img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" /></a>
</p>

<p align="center">
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
  <a href="https://jwt.io/"><img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens" alt="JWT" /></a>
  <a href="https://cloudinary.com/"><img src="https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" alt="Cloudinary" /></a>
  <a href="https://en.wikipedia.org/wiki/REST"><img src="https://img.shields.io/badge/REST_API-0052CC?style=for-the-badge&logo=api&logoColor=white" alt="REST API" /></a>
  <img src="https://img.shields.io/badge/Responsive-Mobile_Friendly-success?style=for-the-badge&logo=responsivedesign&logoColor=white" alt="Responsive" />
  <a href="#license"><img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="License" /></a>
</p>

---

## 📖 Table of Contents

- [About Arova Commerce](#-about-arova-commerce)
- [Key Features](#-key-features)
- [Tech Stack](#%EF%B8%8F-tech-stack)
- [Folder Structure](#-folder-structure)
- [Installation Guide](#-installation-guide)
- [Environment Variables](#-environment-variables)
- [Visual Previews (Screenshots)](#-visual-previews-screenshots)
- [API Overview](#-api-overview)
- [Security Implementations](#-security-implementations)
- [Performance & Optimizations](#-performance--optimizations)
- [Future Roadmap](#-future-roadmap)
- [Author](#-author)
- [License](#-license)

---

## 📝 About Arova Commerce

**Arova Commerce** is a production-quality, feature-rich Full Stack E-Commerce platform designed around the MERN (MongoDB, Express, React, Node.js) architecture. It offers a secure, scalable solution for online retailers looking to establish a highly professional digital storefront paired with a robust administrative dashboard. 

Built with **TypeScript** and **React 19** on the frontend and backed by an enterprise-grade **Node/Express** backend, Arova Commerce provides:
*   🛒 **Customer Website:** An immersive shopping frontend allowing users to browse products, filter by hierarchical categories, maintain shopping carts, manage wishlists, and proceed through checkout.
*   📊 **Admin Dashboard:** A centralized control hub giving business operators live analytics, session insights, sales summaries, and detailed product/inventory controls.
*   🔐 **Secure Authentication:** Integrated JWT-based authorization and session-tracking paired with SMTP account verification processes.
*   📦 **Product Management:** Complete administrative catalog control with support for dynamic metadata, stock toggling, and multi-image Cloudinary handling.
*   🏷️ **Category Management:** A three-tier catalog organization comprising main Categories, Sub-categories, and Extra-categories.
*   📋 **Order Management:** Lifecycle tracking for sales orders, shipping updates, and transaction details.
*   📈 **Analytics Dashboard:** Visual monitors reporting gross margins, active visitor counts, total transactions, and category metrics.
*   ⚙️ **Settings Module:** Customization tools for site parameters, social media handles, address listings, and email server integration.
*   ☁️ **Cloudinary Upload:** Fast multipart media uploading using custom Multer and stream-based loaders.
*   📱 **Responsive Design:** Mobile-first user experience designed seamlessly across smart screens using Tailwind CSS v4.

---

## ✨ Key Features

### 🖥️ Frontend (React & TypeScript)
*   **Modern Responsive Views:** Highly polished UI designed using Tailwind CSS v4 and responsive flex-grids.
*   **TypeScript Stability:** Strict compile-time checks and standard type interfaces for API payloads.
*   **Secure Route Guards:** Client-side protection using React Router v7 routes to restrict unauthorized paths.
*   **Visitor Session Tracking:** Custom local identifier generated on startup to log unique customer traffic.
*   **Toast System:** Informative, non-blocking notification logs built using `react-toastify`.
*   **Interactive CRUD overlays:** Modern modals for catalog additions, status toggles, and parameter changes.

### ⚙️ Backend (Node.js & Express)
*   **Robust REST API:** Modular controller-service pattern built to execute clean database queries.
*   **Active Session Monitor:** Express middleware logging unique active user timestamps inside MongoDB.
*   **Multi-Tier Catalog:** Relational schema supporting main, sub, and extra-categories.
*   **Storage Middleware:** Direct media buffer streaming to Cloudinary via Multer and Streamifier.
*   **Email Utility:** SMTP messaging layout configured with Nodemailer for OTP codes and confirmations.
*   **Structured Status Codes:** Unified JSON api logs formatted using `http-status-codes`.
*   **Security Protections:** CORS filters, JWT authentication, and bcrypt password hashing.

---

## 🛠️ Tech Stack

| Layer | Technology | Details / Usage |
|---|---|---|
| **Frontend Framework** | **React 19** | Component-driven UI rendering with state hooks and context providers. |
| **Language** | **TypeScript** | Static typing across components, service API hooks, and utility files. |
| **Build & Styling** | **Vite & Tailwind CSS v4** | Rapid compilation bundling paired with a utility-first styling engine. |
| **Backend Runtime** | **Node.js & Express.js** | Event-driven runtime supporting modular routing and custom middleware. |
| **Database** | **MongoDB & Mongoose** | NoSQL database hosting schema schemas, session logs, and product documents. |
| **Authentication** | **JWT & Bcrypt** | Secure JSON Web Tokens for API requests and Bcrypt for password hashing. |
| **Media Staging** | **Cloudinary** | Cloud-based media CDN optimized for dynamic cropping and image hosting. |
| **Email Dispatch** | **Nodemailer** | Custom email service for OTP verification and password resetting. |
| **HTTP client** | **Axios** | Interceptor-configured REST client communicating with the backend. |

---

## 📂 Folder Structure

```
Arova-Commerce/
├── Backend/
│   ├── src/
│   │   ├── config/          # MongoDB database connection configuration
│   │   ├── controller/      # API Controllers (Auth, Product, Order, Settings, Category)
│   │   ├── middleware/      # Authentication guards & Multer storage configuration
│   │   ├── model/           # Mongoose schemas (User, Product, Category, Admin, Session)
│   │   ├── routes/          # Express route groupings mapped under `/api`
│   │   ├── services/        # Service-layer files containing business query logic
│   │   ├── utils/           # Shared helper functions (OTP generator, response wrappers)
│   │   └── server.js        # Backend express server initialization file
│   ├── .env                 # Local variables config (ignored by git)
│   └── package.json         # Backend node scripts and dependencies
│
└── Frontend/
    └── E-Commerce/
        ├── public/          # Static files and browser logos
        ├── src/
        │   ├── assets/      # Media files, icons, and logo assets
        │   ├── context/     # React state management context providers
        │   ├── pages/       # Admin, Auth, Product, Category, and Settings page views
        │   ├── routes/      # Frontend client route layout configurations
        │   ├── services/    # Client-side Axios routes and request mapping helpers
        │   ├── App.tsx      # Main application core router page
        │   ├── main.tsx     # App DOM mounting engine
        │   └── index.css    # Tailwind CSS global styles directives
        ├── package.json     # Client package dependency listing
        └── tsconfig.json    # TypeScript compiler rules configuration
```

---

## ⚙️ Environment Variables

To configure and run the application, create a `.env` file in the **Backend** directory. Use the template below as a reference:

```ini
# Backend Server Configuration
PORT=6800
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/arova-commerce?retryWrites=true&w=majority
JWT_SECRET_KEY=your_cryptographically_secure_jwt_secret_key_here

# SMTP E-mail Server Integration (Nodemailer)
EMAIL_USER=your_smtp_email_address@gmail.com
EMAIL_PASSWORD=your_app_specific_email_password

# Cloudinary Storage Configurations
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Frontend Configuration (Client-side usage)
VITE_API_URL=http://localhost:6800/api
```

> [!WARNING]
> Never commit your active `.env` file to version control systems like GitHub. Make sure it is added to your `.gitignore` file.

---

## 🚀 Installation Guide

Ensure you have [Node.js](https://nodejs.org/) (v18+) and [MongoDB](https://www.mongodb.com/) installed on your machine before starting.

### 1. Clone the Project
```bash
git clone https://github.com/sujalkidecha68/Arova-Commerce.git
cd Arova-Commerce
```

### 2. Configure Backend
Open a terminal and navigate to the `Backend` directory:
```bash
cd Backend
npm install
```
*   Create a `.env` file in this directory based on the [Environment Variables](#%EF%B8%8F-environment-variables) template.
*   Start the backend server in development mode:
```bash
npm run dev
```
*   The server should start running, outputting: `Server Is Started At Port 6800`.

### 3. Configure Frontend
Open a new terminal session and navigate to the `Frontend/E-Commerce` directory:
```bash
cd Frontend/E-Commerce
npm install
```
*   Ensure that the backend API endpoint points to the correct port (e.g., `http://localhost:6800/api` in services configuration).
*   Launch the client application:
```bash
npm run dev
```
*   Vite will spin up the local server, usually hosting the application at `http://localhost:5173`. Open this URL in your web browser.

---

## 📸 Visual Previews (Screenshots)

Below are the mock-up placeholders demonstrating the user flows and interfaces of the application.

---

### 📊 Admin Dashboard
> Real-time sales telemetry, active session logs, gross margin charts, and administrative system indicators.
![Admin Dashboard](https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80)

---

### 📦 Product Management
> Create, edit, and toggle products. Configure metadata, price ranges, stocks, and multi-image Cloudinary media uploads.
![Product Management](https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80)

---

### 🏷️ Category Management
> Multi-tier taxonomy management dashboard representing Categories, Sub-categories, and Extra-categories.
![Category Management](https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?auto=format&fit=crop&w=1200&q=80)

---

### 📋 Order Management
> Operational tracking view of incoming client invoices, purchase order states, user logs, and fulfillment toggles.
![Order Management](https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80)

---

### 👥 User Management
> Administrative tracking screen of registered accounts, permission elevations, profile details, and active logs.
![User Management](https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80)

---

### ⚙️ Store Settings
> Dynamic configurations setting site contact addresses, shipping policies, banner updates, and system mail parameters.
![Store Settings](https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80)

---

### 🔑 Authentication & Login
> Secure credential forms for user login, signup registration, SMTP OTP triggers, and password updates.
![Authentication & Login](https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80)

---

### 🛒 Customer Website
> Fully responsive user-facing digital storefront displaying category filters, detail cards, shopping carts, and checkouts.
![Customer Website](https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80)

---

## 📡 API Overview

Arova Commerce utilizes a structured REST API routing architecture. All endpoints are prefixed with `/api`.

<details>
<summary>🔐 Authentication & User API (Click to expand)</summary>

### Admin Routes (`/api/auth/admin`)
*   `POST /registerAdmin` - Register new admin user credentials.
*   `POST /loginAdmin` - Log in admin user and receive JWT.
*   `POST /Forgotpassword` - Trigger recovery email with verification OTP.
*   `POST /VerifyOtp` - Confirm verification OTP validity.
*   `POST /NewChangePassword` - Commit new password configuration.

### User Routes (`/api/auth/user`)
*   `POST /registerUser` - Register a customer account.
*   `POST /loginUser` - Customer authentication (returns JWT).
*   `POST /forgotPassword` - Trigger user password reset request.
*   `POST /verifyOTP` - Verify OTP code for user password resets.
*   `POST /resetPassword` - Set user account password changes.
*   `GET /profile` - Retrieve authenticated user profile *(Requires JWT)*.
*   `POST /change_password` - Update current active user password *(Requires JWT)*.
*   `GET /` - Fetch lists of registered users *(Admin restricted)*.
*   `DELETE /` - Remove user account *(Admin restricted)*.
*   `PATCH /` - Update user account properties.
*   `PUT /` - Toggle customer account status (active/inactive).

### Cart & Wishlist Routes (`/api/auth/user`)
*   `GET /cart` - Retrieve shopping cart items *(Requires JWT)*.
*   `POST /cart` - Save/sync shopping cart changes *(Requires JWT)*.
*   `GET /wishlist` - View items inside wishlist catalog *(Requires JWT)*.
*   `POST /wishlist` - Add product ID to wishlist *(Requires JWT)*.
*   `DELETE /wishlist` - Remove product ID from wishlist *(Requires JWT)*.
</details>

<details>
<summary>📦 Product API (Click to expand)</summary>

*   `GET /api/product` - Retrieve paginated lists of all products.
*   `GET /api/product/single` - Retrieve complete parameters for a single product.
*   `POST /api/product` - Create a new product. Supports multipart uploads up to 5 images *(Requires JWT)*.
*   `PUT /api/product` - Update parameters and upload replacements for existing products *(Requires JWT)*.
*   `DELETE /api/product` - Delete a product document and free storage space *(Requires JWT)*.
*   `PATCH /api/product/status` - Toggle a product's visibility state *(Requires JWT)*.
</details>

<details>
<summary>🏷️ Category API (Click to expand)</summary>

### Categories (`/api/category`)
*   `GET /` - Fetch all main categories.
*   `POST /` - Create a new category with a single header image upload *(Requires JWT)*.
*   `PUT /` - Update category details *(Requires JWT)*.
*   `DELETE /` - Delete a category *(Requires JWT)*.
*   `PATCH /status` - Toggle category visibility status *(Requires JWT)*.

### Sub-Categories (`/api/sub-category`)
*   `GET /` - Retrieve sub-categories.
*   `POST /` - Create a sub-category linked to a main category parent *(Requires JWT)*.
*   `PUT /` - Update sub-category parameters *(Requires JWT)*.
*   `DELETE /` - Remove sub-category link *(Requires JWT)*.

### Extra-Categories (`/api/extra-category`)
*   `GET /` - Fetch extra-categories list.
*   `POST /` - Create third-tier extra categories linked to sub-categories *(Requires JWT)*.
</details>

<details>
<summary>📋 Order API (Click to expand)</summary>

*   `GET /api/order` - Retrieve list of all orders *(Requires JWT - Admin)*.
*   `GET /api/order/single` - Fetch single order details *(Requires JWT)*.
*   `POST /api/order` - Create/place a new customer order *(Requires JWT)*.
*   `PUT /api/order` - Update purchase order fulfillment status *(Requires JWT - Admin)*.
*   `PATCH /api/order/cancel` - Cancel a pending purchase order *(Requires JWT)*.
</details>

<details>
<summary>⚙️ Settings & Analytics API (Click to expand)</summary>

### Settings (`/api/setting`)
*   `GET /` - Fetch current global store settings configuration.
*   `POST /` - Save/overwrite global store settings details *(Requires JWT)*.

### Dashboard (`/api/dashboard`)
*   `GET /` - Fetch dashboard statistics (sales counts, visitor counters, category splits) *(Requires JWT)*.
</details>

---

## 🛡️ Security Implementations

Arova Commerce implements standard security practices to protect client data and prevent system compromises:

1.  **JSON Web Token (JWT) Authorization:** Uses cryptographically signed state-independent tokens passed in request Authorization headers (`Bearer <Token>`) to authenticate API access.
2.  **Bcrypt Password Hashing:** User passwords are encrypted using Bcrypt with custom salt factors, ensuring credentials are secure against lookup table attacks.
3.  **Role-Based Access Control (RBAC):** Route paths differentiate permissions between standard customer roles and system administrator capabilities.
4.  **Route Protection Middleware:** Express routing processes automatically intercept non-public API calls to verify active session signatures before proceeding.
5.  **Strict File Filters:** Upload formats are monitored in Multer to permit only verified media files (JPEG, PNG, WEBP).
6.  **Secure Environment Storage:** All backend credentials, Cloudinary secret keys, database paths, and SMTP configurations are stored in an isolated environment config file.

---

## ⚡ Performance & Optimizations

*   **Responsive Assets (Cloudinary CDN):** Uploaded images are cataloged in Cloudinary, ensuring automatic compression and format conversions for fast media load speeds.
*   **Reusable UI Elements:** Modular component design in React minimizes redundant rendering processes and speeds up development.
*   **Dynamic Session Identification:** Utilizes session-level triggers to monitor unique user actions without burdening system resource caches.
*   **Vite Compilation:** Fast local hot-reloads and optimized tree-shaked production builds.
*   **Lazy Loading:** React Router paths dynamically lazy-load pages, optimizing the initial bundle size.

---

## 🗺️ Future Roadmap

Planned feature enhancements for upcoming releases of Arova Commerce include:

- [ ] **Razorpay Payment Integration:** Support secure credit cards, UPI, net banking, and wallets checkout flows.
- [ ] **Coupons & Discount Engine:** Add custom coupons, percentage discounts, and order-value conditions.
- [ ] **Reviews & Rating System:** Customer reviews with photos on product pages.
- [ ] **Automated PDF Invoicing:** Automatic invoice PDF generation emailed immediately on order placement.
- [ ] **Rich Push & Email Alerts:** Advanced dispatch confirmations and tracking integration details via mail/SMS.
- [ ] **Enhanced Admin Telemetry:** Interactive graphs monitoring monthly profits, conversion rates, and churn metrics.
- [ ] **Progressive Web App (PWA):** Enable offline shopping catalogs and mobile install prompts.
- [ ] **Multi-Vendor Support:** Open dashboard avenues for independent vendors to manage storefront sections.

---

## 👨‍💻 Author

### **Sujal Kidecha**
*Full Stack Developer*

<p align="left">
  <a href="https://github.com/sujalkidecha68"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" /></a>
  <a href="https://linkedin.com/in/sujal-kidecha"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" /></a>
  <a href="https://sujalkidecha.dev"><img src="https://img.shields.io/badge/Portfolio-FF5722?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Portfolio" /></a>
</p>

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for more details.
