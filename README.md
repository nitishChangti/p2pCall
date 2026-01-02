# Configuration Setting: Custom Template Path

Specifies the file path to a custom README template that will be used during generation.

**Usage:** Set this configuration option when you want to use a custom template instead of the default ones.

**Default Behavior:** This setting is only applied when the `templateType` is set to `"Custom"`.

**Example:**
 "readme.generator.settings.customTemplatePath": "PATH TO CUSTOM TEMPLATE" // Only used if templateType is "Custom"

## Project Overview

**P2P Call** is a real-time video calling application built with modern web technologies. It enables direct peer-to-peer video communication between users using WebRTC, with Socket.IO for signaling and Node.js/Express backend for user management.

## Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **Real-time Communication:** Socket.IO
- **Authentication:** JWT (Access & Refresh Tokens)
- **Password Hashing:** bcrypt
- **Validation:** express-validator

### Frontend
- **Library:** React 18
- **State Management:** Redux Toolkit
- **Routing:** React Router v7
- **Real-time Client:** Socket.IO Client
- **Form Validation:** React Hook Form + Zod
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **HTTP Client:** Axios

## Features

✅ **Pure P2P Connection** - Direct browser-to-browser WebRTC communication  
✅ **Secure & Private** - End-to-end encrypted media streams  
✅ **User Authentication** - JWT-based login/registration system  
✅ **Real-time Signaling** - Socket.IO for call initiation and control  
✅ **Dual Camera Support** - Switch between front and back cameras  
✅ **Responsive Design** - Works on desktop and mobile devices  
✅ **Modern Stack** - React, Redux, Node.js for scalability

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB connection string
- Modern browser with WebRTC support

### Installation

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### Environment Variables

**Backend (.env):**
```env
PORT=5000
MONGODB_URL=mongodb+srv://user:password@cluster.mongodb.net
ACCESS_TOKEN_SECRET=your_access_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRY=10d
CORS_ORIGIN=http://localhost:5173
```

**Frontend (.env):**
```env
VITE_BASE_URL=http://localhost:5000
```

### Running the Application

**Backend:**
```bash
npm run dev
```

**Frontend:**
```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

## API Endpoints

### User Routes
- `POST /users/register` - Register new user
- `POST /users/login` - Login user
- `GET /users/getCurrentUserData` - Get current user (requires JWT)
- `GET /users/logout` - Logout user (requires JWT)

## Socket Events

### Emitted Events
- `new-call` - Initiate a call
- `accept-call` - Accept incoming call
- `reject-call` - Reject incoming call
- `webrtc-offer` - Send WebRTC offer
- `webrtc-answer` - Send WebRTC answer
- `ice-candidate` - Send ICE candidate
- `call-ended` - End the call

### Received Events
- `incoming-call` - Receive call notification
- `call-accepted` - Call was accepted
- `call-rejected` - Call was rejected
- `webrtc-offer` - Receive WebRTC offer
- `webrtc-answer` - Receive WebRTC answer
- `ice-candidate` - Receive ICE candidate
- `call-ended` - Call ended

## Project Structure

```
backend/
├── src/
│   ├── config/      # Configuration management
│   ├── controllers/ # Request handlers
│   ├── models/      # MongoDB schemas
│   ├── routes/      # API endpoints
│   ├── middlewares/ # Custom middleware
│   ├── utils/       # Utility functions
│   ├── db/          # Database connection
│   ├── app.js       # Express app
│   ├── socket.js    # Socket.IO setup
│   └── index.js     # Entry point

frontend/
├── src/
│   ├── components/  # React components
│   ├── pages/       # Page components
│   ├── store/       # Redux slices
│   ├── socket/      # Socket and WebRTC logic
│   ├── router/      # Route configuration
│   └── App.jsx      # Root component
```

## Key Implementation Details

- **JWT Tokens:** Access tokens stored in cookies, refresh tokens in database
- **WebRTC Connection:** Peer connections established via Socket.IO signaling
- **State Management:** Redux for auth, call status, and socket state
- **Media Handling:** getUserMedia for camera/mic access with camera switching
- **Error Handling:** Centralized error responses with ApiError utility
