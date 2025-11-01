# JobQuest - Modern Job Posting Website

A comprehensive job posting platform built with React, TypeScript, and MongoDB.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)

### Installation

1. **Install frontend dependencies:**
   ```bash
   npm install
   ```

2. **Install backend dependencies:**
   ```bash
   cd server
   npm install
   cd ..
   ```

3. **Start MongoDB:**
   - **Local MongoDB:** Make sure MongoDB is running on `localhost:27017`
   - **MongoDB Atlas:** Update the connection string in `server/.env`

4. **Configure environment variables:**
   - Copy `server/.env.example` to `server/.env` (if needed)
   - Update MongoDB connection string if using Atlas

5. **Seed the database (optional):**
   ```bash
   cd server
   npm run seed
   cd ..
   ```

6. **Start the development servers:**
   ```bash
   # Terminal 1: Start frontend
   npm run dev

   # Terminal 2: Start backend
   cd server
   npm run dev
   ```

## 📁 Project Structure

```
jobquest/
├── src/                    # Frontend React application
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   └── services/          # API services
├── server/                # Backend Express application
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API endpoints
│   ├── middleware/        # Express middleware
│   └── scripts/           # Database utilities
└── README.md
```

## 🔧 Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend
- `cd server && npm run dev` - Start development server with nodemon
- `cd server && npm start` - Start production server
- `cd server && npm run seed` - Seed database with sample data

## 🗄️ Database Setup

### Option 1: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service: `mongod`
3. Database will be created automatically at `mongodb://localhost:27017/jobquest`

### Option 2: MongoDB Atlas (Cloud)
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `server/.env`

## 🔐 Test Credentials

After seeding the database:
- **User:** `john@example.com` / `password123`
- **Admin:** `admin@jobquest.com` / `password123`

## 🌟 Features

- ✅ User authentication (signup/signin)
- ✅ Social media login integration ready
- ✅ Job search and filtering
- ✅ Company profiles and job listings
- ✅ User profiles with resume upload
- ✅ Job applications and saved jobs
- ✅ Real-time chat widget
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Career advice section

## 🚀 Deployment

### Frontend (Netlify/Vercel)
1. Build the project: `npm run build`
2. Deploy the `dist` folder

### Backend (Heroku/Railway)
1. Set environment variables
2. Deploy the `server` folder
3. Ensure MongoDB connection is configured

## 📝 Environment Variables

Create `server/.env` with:
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/jobquest
JWT_SECRET=your-super-secret-jwt-key
CLIENT_URL=http://localhost:5173
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.