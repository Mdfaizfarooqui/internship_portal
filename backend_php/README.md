# Internship Portal - PHP Backend

A comprehensive RESTful API backend for the Internship Portal application, built with PHP and MySQL.

## Features

- 🔐 **Authentication** - User registration and login with password hashing
- 👤 **User Profiles** - Complete profile management with bio, location, social links
- 🎯 **Skills Management** - Track user skills with proficiency levels
- 🎓 **Education Tracking** - Academic history with GPA and dates
- 💼 **Work Experience** - Employment history management
- 📋 **Internship Management** - Create and browse internships with required skills
- 📝 **Applications** - Apply to internships and track application status
- ⭐ **Saved Internships** - Bookmark favorite internships
- 📄 **Resume Management** - Upload and manage resumes
- 📊 **Skill Gap Analysis** - Match user skills with internship requirements

## Tech Stack

- **PHP 7.4+** - Server-side language
- **MySQL 5.7+** - Database
- **PDO** - Database abstraction layer
- **RESTful API** - Clean API architecture

## Project Structure

```
backend_php/
├── config/
│   └── Database.php          # Database connection
├── controllers/
│   ├── AuthController.php
│   ├── UserController.php
│   ├── SkillController.php
│   ├── EducationController.php
│   ├── WorkExperienceController.php
│   ├── InternshipController.php
│   ├── ApplicationController.php
│   ├── SavedInternshipController.php
│   ├── ResumeController.php
│   └── SkillGapController.php
├── models/
│   ├── User.php
│   ├── UserSkill.php
│   ├── Education.php
│   ├── WorkExperience.php
│   ├── Internship.php
│   ├── Application.php
│   ├── SavedInternship.php
│   ├── Resume.php
│   └── SkillGapAnalysis.php
├── index.php                 # Main router
├── database.sql              # Database schema
├── setup.php                 # Database setup script
└── API_DOCUMENTATION.md      # Complete API reference
```

## Quick Start

### Prerequisites

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Composer (optional, for dependencies)

### Installation

1. **Clone the repository**
```bash
cd backend_php
```

2. **Configure database**

Edit `config/Database.php` if needed (default: localhost, root, no password):
```php
private $host = "localhost";
private $db_name = "internship_portal";
private $username = "root";
private $password = "";
```

3. **Setup database**
```bash
php setup.php
```

This will:
- Create the `internship_portal` database
- Create all 11 tables
- Insert sample data

4. **Start the server**
```bash
php -S localhost:8000
```

The API will be available at `http://localhost:8000`

### Test Credentials

**User 1:**
- Email: `john@example.com`
- Password: `password`

**User 2:**
- Email: `jane@example.com`
- Password: `password`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### User Profile
- `GET /api/users/profile?id={userId}` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/profile-picture` - Upload profile picture

### Skills
- `POST /api/skills/create` - Add skill
- `GET /api/skills/user?userId={id}` - Get user skills
- `PUT /api/skills/update` - Update skill
- `DELETE /api/skills/delete?id={id}` - Delete skill

### Education
- `POST /api/education/create` - Add education
- `GET /api/education/user?userId={id}` - Get user education
- `PUT /api/education/update` - Update education
- `DELETE /api/education/delete?id={id}` - Delete education

### Work Experience
- `POST /api/experience/create` - Add experience
- `GET /api/experience/user?userId={id}` - Get user experience
- `PUT /api/experience/update` - Update experience
- `DELETE /api/experience/delete?id={id}` - Delete experience

### Internships
- `POST /api/internships/create` - Create internship
- `GET /api/internships/getActive` - Get active internships
- `GET /api/internships/getInternship?id={id}` - Get single internship
- `GET /api/internships/getAll` - Get all internships

### Applications
- `POST /api/applications/create` - Submit application
- `GET /api/applications/user?userId={id}` - Get user applications
- `GET /api/applications/internship?internshipId={id}` - Get internship applications
- `PUT /api/applications/status` - Update application status

### Saved Internships
- `POST /api/saved/save` - Save internship
- `DELETE /api/saved/unsave` - Unsave internship
- `GET /api/saved/user?userId={id}` - Get saved internships
- `GET /api/saved/check?userId={id}&internshipId={id}` - Check if saved

### Resumes
- `POST /api/resumes/upload` - Upload resume
- `GET /api/resumes/user?userId={id}` - Get user resumes
- `GET /api/resumes/get?id={id}` - Get resume by ID
- `DELETE /api/resumes/delete?id={id}` - Delete resume

### Skill Gap Analysis
- `POST /api/skillgap/analyze` - Analyze skill gap
- `GET /api/skillgap/get?userId={id}&internshipId={id}` - Get analysis

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed request/response examples.

## Database Schema

The database consists of 11 tables:

1. **users** - User accounts and profiles
2. **user_skills** - User skills with proficiency levels
3. **education** - Educational background
4. **work_experience** - Work history
5. **internships** - Internship listings
6. **internship_skills** - Required skills for internships
7. **applications** - Internship applications
8. **saved_internships** - Bookmarked internships
9. **resumes** - User resumes
10. **resume_scores** - Resume analysis scores
11. **skill_gap_analysis** - Skill matching results

## Testing

### Quick Test

```bash
# Test if server is running
curl http://localhost:8000/api/internships/getActive

# Test login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password"}'
```

### Using Postman

1. Import the API endpoints from `API_DOCUMENTATION.md`
2. Set base URL to `http://localhost:8000`
3. Test each endpoint with sample data

## Security Features

- ✅ Password hashing with bcrypt
- ✅ SQL injection prevention (prepared statements)
- ✅ Input sanitization
- ✅ CORS headers configured
- ✅ Duplicate entry prevention

## Development

### Adding New Endpoints

1. Create model in `models/`
2. Create controller in `controllers/`
3. Add route in `index.php`
4. Update `API_DOCUMENTATION.md`

### Database Changes

1. Update `database.sql`
2. Run `php setup.php` to recreate database
3. Update affected models and controllers

## Troubleshooting

### Database Connection Error
```
Connection error: SQLSTATE[HY000] [1045] Access denied
```
**Solution:** Check database credentials in `config/Database.php`

### Table Not Found
```
SQLSTATE[42S02]: Base table or view not found
```
**Solution:** Run `php setup.php` to create tables

### CORS Error
```
Access to fetch has been blocked by CORS policy
```
**Solution:** CORS headers are already configured in `index.php`. Ensure server is running on correct port.

## Production Deployment

1. **Update database credentials** in `config/Database.php`
2. **Disable error display** - Set `display_errors = Off` in php.ini
3. **Use HTTPS** - Configure SSL certificate
4. **Implement JWT** - Replace base64 token with proper JWT
5. **Add rate limiting** - Prevent API abuse
6. **Enable logging** - Log errors and API calls

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- Review error messages in browser console
- Test endpoints with curl or Postman

---

**Built with ❤️ for the Internship Portal**
