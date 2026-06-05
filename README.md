# 🧪 SciLabHive – Scientific Experiment Management Platform

SciLabHive is a full-stack scientific experiment management platform designed to help researchers and students **record, manage, and analyze experiments** in a structured and secure way.

---

## 🔹 Features

### Backend ✅
- User registration & login with **email OTP verification**
- JWT-based authentication (OAuth2 Password Flow)
- **Google & GitHub OAuth** social login
- Secure password hashing with bcrypt
- Role-based access control
- PostgreSQL database with SQLAlchemy ORM
- Protected API endpoints
- Profile management (name, institution, role, avatar)
- Experiment CRUD with status tracking
- Results & parameters logging per experiment
- Account deletion with full cascade cleanup
- Swagger (OpenAPI) interactive documentation

### Frontend ✅
- Login & Register pages with OTP verification flow
- **Google & GitHub social login**
- Dashboard with real-time stats and weekly activity chart
- Experiments page with search, filter, and create modal
- Results page — expandable per-experiment result logging
- **Analytics page** — charts, status breakdown, monthly activity, experiment type distribution
- AI Insights page — conversational experiment analysis
- Profile page with avatar upload
- Settings page with notification preferences and account management

---

## 🛠 Tech Stack

**Backend:**
- Python, FastAPI
- PostgreSQL, SQLAlchemy
- JWT, OAuth2, bcrypt
- fastapi-mail (Gmail SMTP for OTP)
- httpx (Google & GitHub OAuth)

**Frontend:**
- React.js + Vite
- React Router DOM
- Axios
- Custom CSS

**Tools:**
- Git, GitHub
- Swagger UI, VS Code, pgAdmin

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
npm run dev
```

Frontend: 👉 [http://localhost:5173](http://localhost:5173)

---

## ⚙️ Environment Variables

Create a `.env` file in `scilabhive-backend/`:

```
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=scilabhive
DB_HOST=localhost
DB_PORT=5432

SECRET_KEY=your_jwt_secret_key

MAIL_USERNAME=yourgmail@gmail.com
MAIL_PASSWORD=your_gmail_app_password
MAIL_FROM=yourgmail@gmail.com

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:8000/auth/github/callback

FRONTEND_URL=http://localhost:5173
```

> **Note:** For `MAIL_PASSWORD` use a Gmail App Password — not your regular password.  
> Generate one at: Google Account → Security → 2-Step Verification → App passwords

Create a `.env` file in `scilabhive-frontend/`:

```
VITE_API_URL=http://localhost:8000
```

---

## 🗄️ Database Setup

On first run, SQLAlchemy automatically creates all tables. Just start the server and all tables will be ready.

Then run these **once** in pgAdmin to enable cascade deletes at the database level:

```sql
ALTER TABLE experiments
  DROP CONSTRAINT experiments_user_id_fkey,
  ADD CONSTRAINT experiments_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE experiment_results
  DROP CONSTRAINT experiment_results_experiment_id_fkey,
  ADD CONSTRAINT experiment_results_experiment_id_fkey
    FOREIGN KEY (experiment_id) REFERENCES experiments(experiment_id) ON DELETE CASCADE;

ALTER TABLE experiment_parameters
  DROP CONSTRAINT experiment_parameters_experiment_id_fkey,
  ADD CONSTRAINT experiment_parameters_experiment_id_fkey
    FOREIGN KEY (experiment_id) REFERENCES experiments(experiment_id) ON DELETE CASCADE;
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login and get token |
| POST | `/auth/verify-otp` | Verify email with OTP |
| POST | `/auth/resend-otp` | Resend OTP code |
| GET | `/auth/me` | Get current user |
| PUT | `/auth/me` | Update profile |
| PUT | `/auth/change-password` | Change password |
| PUT | `/auth/upload-avatar` | Upload profile photo |
| DELETE | `/auth/me` | Delete account |
| GET | `/auth/google` | Google OAuth login |
| GET | `/auth/google/callback` | Google OAuth callback |
| GET | `/auth/github` | GitHub OAuth login |
| GET | `/auth/github/callback` | GitHub OAuth callback |

### Experiments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/experiments/` | Get all my experiments |
| POST | `/experiments/` | Create experiment |
| PUT | `/experiments/{id}` | Update experiment |
| DELETE | `/experiments/{id}` | Delete experiment |

### Results
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/experiment_results/{experiment_id}/results` | Get results |
| POST | `/experiment_results/{experiment_id}/results` | Add result |
| PUT | `/experiment_results/{result_id}` | Update result |
| DELETE | `/experiment_results/{result_id}` | Delete result |
| GET | `/experiment_results/stats` | Get total results count |

---

## 📌 Status

| Component | Status |
|-----------|--------|
| Backend API | ✅ Complete |
| Authentication + Email OTP | ✅ Complete |
| Google & GitHub OAuth | ✅ Complete |
| Dashboard UI | ✅ Complete |
| Login / Register UI | ✅ Complete |
| Experiment CRUD UI | ✅ Complete |
| Results Logging UI | ✅ Complete |
| Analytics Page | ✅ Complete |
| AI Insights UI | ✅ Complete |
| Profile Page | ✅ Complete |
| Settings Page | ✅ Complete |
| Dark mode | 📅 Planned |
| Real AI integration | 📅 Planned |
| Collaborator system | 📅 Planned |
| Mobile responsive | 📅 Planned |
| Deployment | 📅 Planned |

---

## 📸 Screenshots

> Coming soon

---

## 👤 Author

**Tishani Gamalath**  
Undergraduate Software Engineering Student  
[GitHub](https://github.com/TishaSachi)

