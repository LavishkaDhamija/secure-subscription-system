# 🔒 Secure Subscription & License Management System
> **A Cryptographically Enforced, End-to-End Secure Role-Based Access Control (RBAC) & Digital Licensing Platform**
---
## 🌟 Overview
The **Secure Subscription & License Management System** is a full-stack, cybersecurity-focused enterprise application designed to deliver cryptographically validated subscription tiers, digital license signing, and end-to-end encrypted premium content streaming.
Unlike conventional subscription systems that rely purely on basic database flags or session cookies, this architecture incorporates **Hybrid Encryption (RSA-2048 + AES-256-CBC)**, **HMAC-SHA256 Digital Signatures**, **Time-based Multi-Factor Authentication (MFA/OTP)**, and **Base64 Entitlement Tokens** to prevent privilege escalation, license tampering, data sniffing, and unauthorized access.
---
## 🛡️ Core Cybersecurity Features
### 1. 🔐 Multi-Factor Authentication (MFA / 2FA)
- **Bcrypt Password Hashing**: Passwords stored using salted Bcrypt hashes (salt factor 10).
- **Two-Step Authentication**: Login triggers a time-limited 6-digit One-Time Password (OTP) expiring in 5 minutes.
- **JWT Authorization**: Stateless authorization using JSON Web Tokens passed in secure custom request headers (`x-auth-token`).
### 2. 🔑 Hybrid Encryption Architecture (E2EE)
- **RSA-2048 Session Key Exchange**: On startup, the backend generates an RSA key pair (`spki`/`pkcs8`). The client fetches the server's public key and encrypts a client-generated 256-bit AES raw key using `RSA-OAEP` with `SHA-256`.
- **AES-256-CBC Payload Encryption**: Sensitive premium content is encrypted on the fly using AES-256-CBC with random Initialization Vectors (IV).
- **Web Crypto API Integration**: The React frontend uses native browser `window.crypto.subtle` APIs for cryptographic key generation, asymmetric key wrapping, and symmetric payload decryption in client memory.
### 3. ✍️ Cryptographic Digital Signatures & License Integrity
- **HMAC-SHA256 / RSA Data Signing**: Subscriptions and licenses are cryptographically signed upon administrator approval using deterministic payload canonicalization.
- **Tamper Detection**: Verification endpoints recompute signature hashes and compare them using constant-time string comparisons (`crypto.timingSafeEqual`) to prevent timing attacks.
- **Anti-Replay & Anti-Tampering**: Guarantees that modified license payloads or forged roles are instantly detected and rejected.
### 4. 🛂 Fine-Grained Role-Based Access Control (RBAC) & Entitlement Tokens
- **Custom Access Control Middleware**: Tiered access enforcement across `FREE`, `PREMIUM`, and `ADMIN` roles using modular Express middleware (`authMiddleware`, `aclMiddleware`).
- **Base64 Entitlement Tokens**: Cryptographic token generation containing user claims, target feature IDs, subscription state, and issuance timestamps for secondary authorization.
- **Stale Token Mitigation**: Re-verifies user credentials against MongoDB on every privileged request to immediately reflect license upgrades or administrative role changes.
---
## 🛠️ Technology Stack
|
 Layer 
|
 Technologies Used 
|
|
:---
|
:---
|
|
**
Frontend
**
|
 React, Vite, CSS / Modern UI, Web Crypto API (
`window.crypto.subtle`
) 
|
|
**
Backend
**
|
 Node.js, Express.js (v5), JavaScript (ES6+) 
|
|
**
Database
**
|
 MongoDB, Mongoose ODM 
|
|
**
Security & Crypto
**
|
 Node 
`crypto`
 Module, 
`jsonwebtoken`
, 
`bcrypt`
, 
`cors`
, 
`dotenv`
|
---
## 📁 Repository Structure
```
secure_subscription_system/
├── backend/
│   ├── middleware/
│   │   ├── aclMiddleware.js      # Admin & Premium role enforcement middleware
│   │   └── authMiddleware.js     # JWT verification & fresh user payload extraction
│   ├── models/
│   │   ├── Feature.js            # Platform feature access levels
│   │   ├── License.js            # Digital license schema with signatures
│   │   ├── SubscriptionPlan.js   # Free / Premium tier definitions
│   │   └── User.js               # User accounts, hashed credentials, OTP, entitlement tokens
│   ├── routes/
│   │   ├── adminRoutes.js        # Administrative user & system management
│   │   ├── authRoutes.js         # User registration, password verification, OTP validation
│   │   ├── contentRoutes.js      # AES-256 encrypted content delivery & entitlement verification
│   │   ├── cryptoRoutes.js       # RSA public key distribution & AES session key exchange
│   │   ├── licenseRoutes.js      # License request, admin digital signing, integrity verification
│   │   └── subscriptionRoutes.js # Plan switching, RSA digital signature generation
│   ├── utils/
│   │   ├── cryptoUtils.js        # RSA-2048 keypair generation & AES-256 helpers
│   │   ├── digitalSignature.js   # SHA-256 hashing & RSA signing/verification
│   │   ├── signatureHelper.js    # HMAC-SHA256 license signature generation & timing-safe checks
│   │   └── tokenEncoding.js     # Base64 entitlement token utilities
│   ├── .env                      # Environment configuration
│   └── server.js                 # Express server initialization, DB connection & data seeding
└── frontend/
    ├── src/
    │   ├── pages/                # React views (Login, Register, Dashboard, Premium, Admin, License)
    │   ├── utils/
    │   │   └── cryptoHelper.js   # Frontend Web Crypto API helpers (RSA encrypt, AES decrypt)
    │   ├── App.jsx               # Navigation & application routing
    │   └── main.jsx              # React app entry point
    └── vite.config.js            # Vite build configuration
```
---
## 📡 Key API Endpoints
### Authentication & MFA (`/api/auth`)
- `POST /api/auth/register`: Register new user with Bcrypt password hashing.
- `POST /api/auth/login`: Validate password and dispatch 5-minute MFA OTP.
- `POST /api/auth/verify-otp`: Validate OTP and issue JWT access token.
- `GET /api/auth/user`: Retrieve current authenticated user profile.
### Cryptographic Key Exchange (`/api/crypto`)
- `GET /api/crypto/public-key`: Fetch server's RSA-2048 public key.
- `POST /api/crypto/session-key`: Receive client-encrypted AES session key, decrypt via RSA private key, and store in session map.
### Subscriptions & Digital Licensing (`/api/subscriptions` & `/api/license`)
- `POST /api/subscriptions/request-premium`: Request a premium upgrade (creates pending license).
- `POST /api/license/approve/:licenseId`: Admin route to digitally sign license with HMAC-SHA256 and generate Base64 entitlement token.
- `GET /api/license/verify/:licenseId`: Verify digital signature of a license using timing-safe comparison.
- `GET /api/subscriptions/verify-signature/:id`: Cryptographically verify user's signed subscription state.
### Encrypted Content Delivery (`/api/content`)
- `GET /api/content/premium`: Validate entitlement token and stream AES-256 encrypted payload to authorized users.
---
## 🚀 Getting Started
### Prerequisites
- **Node.js**: v18.x or higher
- **MongoDB**: Local instance running on `mongodb://localhost:27017` or MongoDB Atlas cluster URI.
### 1. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/secure_subscription_db
JWT_SECRET=your_super_secret_jwt_key_here
```
Start the backend server:
```bash
npm run dev   # Or npm start
```
### 2. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.
---
## 🔍 Security & Verification Walkthrough
1. **Register & Login with MFA**: Register a new user, log in, and enter the generated OTP displayed in the server terminal logs.
2. **Key Exchange**: Upon login, the client automatically retrieves the server's RSA public key, encrypts a generated AES session key, and completes the cryptographic key exchange.
3. **License Approval & Digital Signature**: Submit a premium license request. Log in as an Administrator (`ADMIN` role) to review and digitally sign the license.
4. **Signature Verification**: Test license verification to confirm payload authenticity. Any manual DB modification to the license fields will immediately trigger a signature integrity failure (`Integrity Tampering Detected`).
5. **Decrypted Premium Streaming**: Navigate to the Premium Command Center to view premium threat intelligence, automatically decrypted in real-time by the frontend using Web Crypto API.
---
## 📄 License
This project is open-source and available under the [ISC License](LICENSE).
