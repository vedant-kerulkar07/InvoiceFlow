# 🧾 InvoiceFlow — Invoice & Client Management System

A full-stack **MERN Stack Invoice and Client Management System** designed to help businesses manage clients, create and track invoices, monitor payment status, and manage billing information through a clean and responsive web application.

Built as part of the **MERN Stack Developer Technical Assignment** for **NextAstra Technologies Pvt. Ltd.**

---

## 📌 Project Overview

**InvoiceFlow** is a web-based invoicing application that provides authenticated users with a centralized platform to manage clients and invoices.

The application allows users to:

* Register and securely log in
* Manage client information
* Create itemized invoices
* Automatically calculate invoice totals
* Apply tax and discounts
* Track invoice payment status
* Search and filter invoices
* View invoice history
* Monitor billing information through a dashboard
* Export invoice data as CSV

The project follows a modular full-stack architecture using **React.js, Node.js, Express.js, MongoDB, and Mongoose**.

---

## 🎯 Objective

The main objective of InvoiceFlow is to provide a simple and practical invoicing solution where a business user can:

1. Manage client information
2. Create professional itemized invoices
3. Automatically calculate invoice amounts
4. Track invoice payment status
5. Search and filter invoice records
6. Monitor overall billing information
7. Export invoice data for further analysis

---

## ✨ Key Features

### 🔐 Authentication

* User registration
* User login
* Secure password hashing
* JWT-based authentication
* Protected application routes
* Authenticated access to client and invoice data

---

### 👥 Client Management

Users can manage their clients through complete CRUD operations.

**Features include:**

* Add new clients
* View client list
* View client details
* Edit client information
* Delete clients
* Search clients
* Search by:

  * Name
  * Company
  * Email

Client information can include:

* Client name
* Company name
* Email
* Phone number
* Billing address
* GST / Tax number

---

### 🧾 Invoice Management

InvoiceFlow provides complete invoice management functionality.

Users can:

* Create invoices
* Select a client
* Add multiple invoice items
* Edit invoices
* Delete invoices
* View invoice details
* View invoice history
* Search invoices

Each invoice item contains:

* Description
* Quantity
* Rate
* Calculated line amount
---

### 💰 Automatic Invoice Calculations

InvoiceFlow automatically calculates:

* Subtotal
* Tax
* Discount
* Grand Total

The invoice total is calculated on the backend to avoid relying on manipulated totals sent from the frontend.

---

### 🔎 Search & Filtering

InvoiceFlow provides search and filtering functionality to make invoice management easier.

Invoices can be searched or filtered using information such as:

* Client
* Invoice number
* Status
* Date

Clients can also be searched using:

* Client name
* Company name
* Email

---

### 📊 Dashboard

The dashboard provides an overview of important invoice information.

It displays metrics such as:

* Total invoices
* Total billed amount
* Total paid amount
* Outstanding amount

It also provides a view of recent invoices and their statuses.

---

### 📥 CSV Export — Bonus Feature

As an additional bonus feature, InvoiceFlow supports **exporting invoice data as CSV**.

Users can export invoice information into a CSV file for:

* Reporting
* Offline analysis
* Record keeping
* Spreadsheet processing

This feature was implemented as one of the bonus requirements of the assignment.

---

## 🛠️ Technology Stack

### Frontend

* React.js
* JavaScript
* HTML5
* CSS3
*  Tailwind CSS
* shadcn UI library 

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### Authentication

* JSON Web Token (JWT)
* Password hashing

### Development Tools

* Git
* GitHub
* VS Code
* Postman / API testing tool

---

## 🏗️ Project Architecture

InvoiceFlow follows a client-server architecture.

```text
                    ┌─────────────────────┐
                    │      React.js       │
                    │     Frontend        │
                    └──────────┬──────────┘
                               │
                               │ HTTP / REST API
                               ▼
                    ┌─────────────────────┐
                    │   Express.js API    │
                    │      Backend        │
                    └──────────┬──────────┘
                               │
                               │ Mongoose
                               ▼
                    ┌─────────────────────┐
                    │      MongoDB        │
                    │      Database       │
                    └─────────────────────┘
```

Authentication flow:

```text
User
 │
 ▼
React Login/Register
 │
 ▼
Express API
 │
 ▼
Password Verification
 │
 ▼
JWT Token
 │
 ▼
Protected API Requests
 │
 ▼
MongoDB
```

---

## 📁 Project Structure

```text
InvoiceFlow/
│
├── backend/
│   ├── ...
│   └── package.json
│
├── frontend/
│   ├── ...
│   └── package.json
│
├── .gitignore
│
└── README.md
```

### Backend

The backend contains the server-side implementation, including:

* REST APIs
* Authentication
* Database models
* Business logic
* Request validation
* Error handling

### Frontend

The frontend contains:

* React components
* Pages
* Forms
* Dashboard
* Client management interface
* Invoice management interface
* Authentication interface
* API integration
* UI state handling

---

# 🚀 Getting Started

Follow the steps below to run InvoiceFlow locally.

## 📋 Prerequisites

Make sure you have the following installed:

* **Node.js** — version 18 or later recommended
* **npm**
* **MongoDB** or a MongoDB Atlas database
* **Git**

Check your installed versions:

```bash
node --version
npm --version
git --version
```

---

## 📥 1. Clone the Repository

```bash
git clone https://github.com/vedant-kerulkar07/InvoiceFlow.git
```

Move into the project directory:

```bash
cd InvoiceFlow
```

---

# ⚙️ Backend Setup

Open a terminal inside the project root and navigate to the backend:

```bash
cd backend
```

Install backend dependencies:

```bash
npm install
```

---

## 🔐 Backend Environment Variables

Create a `.env` file inside the `backend` directory.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

## ▶️ Start the Backend

Run:

```bash
npm run dev
```
# 🔌 API Overview

InvoiceFlow follows a RESTful API architecture.

The backend provides API endpoints for:

### Authentication

```text
POST   /api/auth/register
POST   /api/auth/login
```

### Clients

```text
GET    /api/clients
POST   /api/clients
GET    /api/clients/:id
PUT    /api/clients/:id
DELETE /api/clients/:id
```

### Invoices

```text
GET    /api/invoices
POST   /api/invoices
GET    /api/invoices/:id
PUT    /api/invoices/:id
DELETE /api/invoices/:id
```

# 🔒 Security Considerations

The application follows basic security practices including:

* Password hashing
* JWT-based authentication
* Protected routes
* Environment variables for secrets
* No `.env` files committed to the repository
* Server-side validation
* Authentication checks before accessing protected resources
---
# 📱 Responsive Design

The application is designed to work across different screen sizes, including:

* Desktop
* Laptop
* Tablet
* Mobile

The interface provides responsive layouts for the major application screens.

---

# 🔄 Application Flow

The typical application workflow is:

```text
Register
   ↓
Login
   ↓
Authentication
   ↓
Dashboard
   ↓
Create / Manage Clients
   ↓
Create Invoice
   ↓
Add Invoice Items
   ↓
Calculate Invoice Total
   ↓
Set Issue & Due Dates
   ↓
Track Payment Status
   ↓
Search / Filter Invoices
   ↓
Export Invoice Data as CSV
```

---

# 📊 Bonus Feature Implemented

The following bonus feature from the technical assignment has been implemented:

### ✅ CSV Invoice Export

The assignment provided several optional bonus features, including PDF generation, payments, email functionality, CSV export, charts and automated tests. InvoiceFlow implements:

> **Export invoice data as CSV**

This allows users to download invoice records in a spreadsheet-compatible format.

---

# 🎨 UI/UX

The application focuses on providing:

* Clean interface
* Simple navigation
* Clear forms
* Readable invoice information
* Meaningful feedback
* Loading states
* Empty states
* Error handling
* Responsive layouts

The goal is to keep common invoicing tasks straightforward and easy to navigate.

---

# 🚀 Future Improvements

Possible future versions could include:

```text
PDF Invoice Generation
        ↓
Payment Tracking
        ↓
Email Invoice Delivery
        ↓
Monthly Analytics
        ↓
Automated Reports
        ↓
Role-Based Access
        ↓
Cloud Deployment
```

---

# 👨‍💻 Author

**Vedant Kerulkar**

GitHub:
https://github.com/vedant-kerulkar07

Project Repository:
https://github.com/vedant-kerulkar07/InvoiceFlow

---
