# 🚀 FlashPay – Forex via Bitcoin

A modern fintech web application that enables users to perform cross-border currency conversion using **Bitcoin as an intermediary asset**, with wallet management and payment integration.

---

## 💡 Overview

FlashPay is a full-stack fintech simulation platform where users can:

* Add money to their wallet
* Convert INR → BTC → USD
* Track transactions in real-time

The system demonstrates how **cryptocurrency can act as a bridge for forex transactions**.

---

## 🎯 Problem Statement

Traditional forex systems:

* Are slow due to intermediaries
* Involve high transaction costs
* Lack transparency

FlashPay solves this by:

* Using Bitcoin as a bridge currency
* Providing a transparent transaction ledger
* Simulating real-time exchange mechanisms

---

## ⚙️ Features

### 🔐 Authentication

* User registration & login (Supabase Auth)
* Secure session handling

---

### 🪪 KYC Verification

* Aadhaar-based verification (simulated)
* Unlocks wallet and conversion features

---

### 💰 Wallet System

* Multi-currency wallet:

  * INR
  * BTC
  * USD
* Default INR balance for new users

---

### 💳 Add Money (PayU Integration)

* Integrated with PayU payment gateway
* Secure payment flow using SHA-512 hash
* Wallet updated after successful payment
* Transaction stored with status & txnid

---

### 🔄 Currency Conversion

* Convert INR → BTC → USD
* Static exchange rates (for demo):

  * 1 BTC = ₹50,00,000
  * 1 BTC = $60,000

---

### 📜 Transaction History

* Complete ledger of all activities:

  * Add Money
  * Currency Conversion
* Sorted by latest

---

## 🏗️ Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS

### Backend / Database

* Supabase (Auth + PostgreSQL)

### Payment Gateway

* PayU (Test Mode)

### Libraries

* crypto-js (SHA-512 hash generation)

---

## 🧠 System Architecture

Frontend (React + Vite + Tailwind)
↓
Supabase (Auth + Database)
↓
PayU Payment Gateway

---

## 🔄 Application Flow

1. User registers and logs in
2. Completes KYC verification
3. Wallet is activated
4. User adds money via PayU
5. Wallet balance updates
6. User converts INR → BTC → USD
7. Transactions are recorded and displayed

---

## 🔐 Environment Variables

For PayU integration, the following variables are required:

```env
VITE_PAYU_KEY=your_payu_key
VITE_PAYU_SALT=your_payu_salt
```

⚠️ Note: In this project, hash generation is done on the frontend for demo purposes. In production, it should be handled securely on the backend.

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/flashpay.git
cd flashpay
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Add your PayU credentials.

### 4. Run the Project

```bash
npm run dev
```

---

## 🧪 Testing (PayU)

* Use PayU test environment
* Enter any valid test details
* Verify:

  * Payment success redirect
  * Wallet update
  * Transaction logging

---

## ⚠️ Disclaimer

This is a **simulation project** built for educational purposes.

* Payment verification is simplified
* KYC is mocked
* Not intended for real financial transactions

---

## 🔮 Future Enhancements

* Real-time crypto price integration (Coinbase API)
* Secure backend-based payment verification
* Withdrawal system
* Admin dashboard
* Mobile application

---

## 👨‍💻 Author

**Shasank Kumar**
BCA Student – SRM University Delhi-NCR

---

## ⭐ Support

If you found this project useful:

* ⭐ Star this repository
* 🔗 Share with others
* 🚀 Follow for more projects

---
