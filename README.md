# QR Code Attendance System

A modern web application for managing events and tracking attendance using QR codes.

## Features

- **Event Management**: Create, edit, and manage events
- **QR Code Generation**: Automatic QR code generation for events
- **Attendance Tracking**: Real-time attendance tracking via QR code scanning
- **User Management**: Admin and user authentication system
- **Analytics & Reports**: Comprehensive reporting and analytics
- **Email Notifications**: Automated email notifications for events
- **Responsive Design**: Modern, mobile-friendly interface

## Tech Stack

### Backend
- Node.js with Express.js
- MySQL database
- JWT authentication
- Nodemailer for emails
- QR code generation with qrcode library

### Frontend
- React.js
- React Router for navigation
- Tailwind CSS for styling
- Chart.js for analytics
- Axios for API calls

## Deployment

### Prerequisites
- Node.js (>= 16.0.0)
- MySQL database
- Email service (Gmail recommended)

### Heroku Deployment

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd qr-attendance-system
   ```

2. **Install Heroku CLI** and login
   ```bash
   heroku login
   ```

3. **Create a new Heroku app**
   ```bash
   heroku create your-app-name
   ```

4. **Add MySQL database add-on**
   ```bash
   heroku addons:create jawsdb:kitefin
   # or
   heroku addons:create cleardb:ignite
   ```

5. **Set environment variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your_strong_jwt_secret_here
   heroku config:set SMTP_HOST=smtp.gmail.com
   heroku config:set SMTP_PORT=587
   heroku config:set SMTP_USER=your_email@gmail.com
   heroku config:set SMTP_PASS=your_app_password
   ```

6. **Get database credentials**
   ```bash
   heroku config:get JAWSDB_URL
   # or
   heroku config:get CLEARDB_DATABASE_URL
   ```

7. **Set database environment variables** (extract from the URL above)
   ```bash
   heroku config:set DB_HOST=your_db_host
   heroku config:set DB_USER=your_db_user
   heroku config:set DB_PASSWORD=your_db_password
   heroku config:set DB_NAME=your_db_name
   ```

8. **Deploy the application**
   ```bash
   git add .
   git commit -m "Initial deployment"
   git push heroku main
   ```

9. **Set up the database**
   - Run the SQL scripts in the `database/` folder on your Heroku database
   - You can use tools like MySQL Workbench or connect directly via Heroku CLI

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Set up environment variables**
   - Copy `.env.example` to `backend/.env`
   - Update the values with your local configuration

3. **Set up the database**
   - Create a MySQL database
   - Run the SQL scripts in `database/schema.sql` and `database/seed.sql`

4. **Start the development servers**
   ```bash
   npm run dev
   ```

## Project Structure

```
qr-attendance-system/
├── backend/                 # Node.js backend
│   ├── config/             # Database and email configuration
│   ├── controllers/        # Route handlers
│   ├── middleware/         # Authentication and upload middleware
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   └── server.js          # Main server file
├── frontend/              # React frontend
│   ├── public/           # Static files
│   ├── src/
│   │   ├── components/   # Reusable React components
│   │   ├── pages/        # Page components
│   │   ├── utils/        # Utility functions
│   │   └── App.jsx       # Main App component
│   └── build/            # Production build (generated)
├── database/             # Database scripts
├── package.json         # Root package.json for Heroku
├── Procfile            # Heroku process file
└── README.md           # This file
```

## API Endpoints

### Authentication
- `POST /api/admin/register` - Register admin
- `POST /api/admin/login` - Admin login
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event
- `GET /api/events/:id` - Get specific event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Attendance
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance/event/:eventId` - Get event attendance

### Reports
- `GET /api/report/event/:eventId` - Generate event report
- `GET /api/analytics/dashboard` - Get dashboard analytics

## Environment Variables

See `.env.example` for all required environment variables.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository.