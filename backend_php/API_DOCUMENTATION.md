# Internship Portal Backend API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication Endpoints

### Register User
- **POST** `/api/auth/register`
- **Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login
- **POST** `/api/auth/login`
- **Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

---

## User Profile Endpoints

### Get User Profile
- **GET** `/api/users/profile?id={userId}`

### Update User Profile
- **PUT** `/api/users/profile`
- **Body:**
```json
{
  "id": 1,
  "full_name": "John Doe",
  "bio": "Software developer",
  "location": "San Francisco, CA",
  "phone": "+1234567890",
  "github": "github.com/johndoe",
  "linkedin": "linkedin.com/in/johndoe"
}
```

### Upload Profile Picture
- **POST** `/api/users/profile-picture`
- **Body:**
```json
{
  "id": 1,
  "profile_picture": "/uploads/profile_pictures/user1.jpg"
}
```

---

## Skills Endpoints

### Add Skill
- **POST** `/api/skills/create`
- **Body:**
```json
{
  "user_id": 1,
  "skill_name": "React",
  "proficiency_level": "Intermediate"
}
```

### Get User Skills
- **GET** `/api/skills/user?userId={userId}`

### Update Skill
- **PUT** `/api/skills/update`
- **Body:**
```json
{
  "id": 1,
  "skill_name": "React",
  "proficiency_level": "Advanced"
}
```

### Delete Skill
- **DELETE** `/api/skills/delete?id={skillId}`

---

## Education Endpoints

### Add Education
- **POST** `/api/education/create`
- **Body:**
```json
{
  "user_id": 1,
  "degree": "Bachelor of Science",
  "institution": "Stanford University",
  "field_of_study": "Computer Science",
  "start_date": "2020-09-01",
  "graduation_date": "2024-05-01",
  "gpa": 3.8,
  "description": "Focus on AI and Machine Learning"
}
```

### Get User Education
- **GET** `/api/education/user?userId={userId}`

### Update Education
- **PUT** `/api/education/update`
- **Body:** (same as create with `id` field)

### Delete Education
- **DELETE** `/api/education/delete?id={educationId}`

---

## Work Experience Endpoints

### Add Work Experience
- **POST** `/api/experience/create`
- **Body:**
```json
{
  "user_id": 1,
  "company": "Tech Corp",
  "position": "Software Engineer",
  "description": "Developed web applications",
  "start_date": "2023-01-01",
  "end_date": "2023-12-31",
  "is_current": false
}
```

### Get User Experience
- **GET** `/api/experience/user?userId={userId}`

### Update Experience
- **PUT** `/api/experience/update`
- **Body:** (same as create with `id` field)

### Delete Experience
- **DELETE** `/api/experience/delete?id={experienceId}`

---

## Internship Endpoints

### Create Internship
- **POST** `/api/internships/create`
- **Body:**
```json
{
  "company": "TechCorp",
  "position": "Software Engineering Intern",
  "description": "Build web applications",
  "location": "San Francisco, CA",
  "duration": "3 months",
  "stipend": "$2,500/month",
  "type": "Full-time",
  "requirements": "React, Node.js experience",
  "responsibilities": "Develop features, Write tests",
  "deadline": "2024-12-31",
  "requiredSkills": ["React", "Node.js", "JavaScript"]
}
```

### Get Active Internships
- **GET** `/api/internships/getActive`

### Get Single Internship
- **GET** `/api/internships/getInternship?id={internshipId}`

### Get All Internships
- **GET** `/api/internships/getAll`

---

## Application Endpoints

### Submit Application
- **POST** `/api/applications/create`
- **Body:**
```json
{
  "user_id": 1,
  "internship_id": 1,
  "resume_id": 1,
  "notes": "I am very interested in this position"
}
```

### Get User Applications
- **GET** `/api/applications/user?userId={userId}`

### Get Internship Applications
- **GET** `/api/applications/internship?internshipId={internshipId}`

### Update Application Status
- **PUT** `/api/applications/status`
- **Body:**
```json
{
  "id": 1,
  "status": "Accepted"
}
```

---

## Saved Internships Endpoints

### Save Internship
- **POST** `/api/saved/save`
- **Body:**
```json
{
  "user_id": 1,
  "internship_id": 1
}
```

### Unsave Internship
- **DELETE** `/api/saved/unsave`
- **Body:**
```json
{
  "user_id": 1,
  "internship_id": 1
}
```

### Get Saved Internships
- **GET** `/api/saved/user?userId={userId}`

### Check if Saved
- **GET** `/api/saved/check?userId={userId}&internshipId={internshipId}`

---

## Resume Endpoints

### Upload Resume
- **POST** `/api/resumes/upload`
- **Body:**
```json
{
  "user_id": 1,
  "title": "Software Engineer Resume",
  "content": "Resume text content",
  "file_path": "/uploads/resumes/resume1.pdf"
}
```

### Get User Resumes
- **GET** `/api/resumes/user?userId={userId}`

### Get Resume by ID
- **GET** `/api/resumes/get?id={resumeId}`

### Delete Resume
- **DELETE** `/api/resumes/delete?id={resumeId}`

---

## Skill Gap Analysis Endpoints

### Analyze Skill Gap
- **POST** `/api/skillgap/analyze`
- **Body:**
```json
{
  "user_id": 1,
  "internship_id": 1
}
```

### Get Analysis
- **GET** `/api/skillgap/get?userId={userId}&internshipId={internshipId}`

---

## Response Format

All endpoints return JSON responses in the following format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## HTTP Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `503` - Service Unavailable

---

## Database Setup

1. Import the database schema:
```bash
mysql -u root -p internship_portal < database.sql
```

2. Start the PHP server:
```bash
cd backend_php
php -S localhost:8000
```

3. Test the API:
```bash
curl http://localhost:8000/api/internships/getActive
```
