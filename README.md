# 🧪 SciLabHive – Scientific Experiment Management Platform

SciLabHive is a full-stack scientific experiment management platform designed to help researchers and students **record, manage, and analyze experiments** in a structured and secure way.

---

## 🔹 Features

### Backend (Complete ✅)
- User registration & login
- JWT-based authentication (OAuth2 Password Flow)
- Secure password hashing with bcrypt
- Role-based access control
- PostgreSQL database with SQLAlchemy ORM
- Protected API endpoints
- Swagger (OpenAPI) interactive documentation

### Frontend (In Progress 🚧)
- Dashboard page ✅
- Login & Register pages ✅
- Built with React.js

---

## 🛠 Tech Stack

**Backend:**
- Python, FastAPI
- PostgreSQL, SQLAlchemy
- JWT, OAuth2, bcrypt

**Frontend:**
- React.js

**Tools:**
- Git, GitHub
- Swagger UI, VS Code

---

## ▶️ Run Locally

### Backend

```bash
git clone https://github.com/TishaSachi/SciLabHive.git
cd SciLabHive/scilabhive-backend

python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

pip install -r requirements.txt
uvicorn main:app --reload
```

API Docs (Swagger UI): 👉 [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### Frontend

```bash
cd scilabhive-frontend
npm install
npm start
```

---

## 📌 Status

| Component | Status |
|-----------|--------|
| Backend API | ✅ Complete |
| Authentication | ✅ Complete |
| Dashboard UI | ✅ Complete |
| Login/Register UI | ✅ Complete |
| Experiment CRUD UI | 🚧 In Progress |
| Data visualization | 📅 Planned |

---

## 👤 Author

**Tishani Gamalath**  
Undergraduate Software Engineering Student
