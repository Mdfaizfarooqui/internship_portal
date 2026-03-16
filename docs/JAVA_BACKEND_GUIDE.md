# Java Backend Migration Guide

Your PHP backend has been successfully migrated to a **Java Spring Boot** backend!

## What Changed

### Old PHP Backend
- Multiple `.php` files in `backend/api/`
- Custom PDO database connections
- Simple PHP routing

### New Java Backend
- Spring Boot 3.2 with MVC architecture
- JPA/Hibernate ORM for database operations
- Clean REST API endpoints
- Built-in dependency injection and lifecycle management

## Prerequisites

1. **Java 17 or higher** - Download from [oracle.com](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html)
2. **Maven** - Download from [maven.apache.org](https://maven.apache.org/download.cgi)
3. **MySQL Server** - Running on `localhost:3306`
4. **Node.js** - For the frontend

## Database Setup

1. Make sure MySQL is running
2. Create the database and import the schema:
   ```bash
   mysql -u root -p < backend/database/schema.sql
   ```
3. Update database credentials in `backend/src/main/resources/application.properties` if needed

## Running the Backend

### Option 1: From IDE (IntelliJ IDEA / VS Code)
1. Open the `backend` folder as a project
2. Right-click on `InternshipPortalBackendApplication.java`
3. Select "Run"

### Option 2: From Terminal
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

The backend will start on `http://localhost:8000`

## API Endpoints

All endpoints are now available at `/api/` prefix:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### User
- `GET /api/user/getData?userId=<id>` - Get user profile data
- `POST /api/user/skill` - Add skill to user

### Internships
- `GET /api/internships/getInternship?id=<id>` - Get internship details
- `GET /api/internships/getAll` - Get all internships
- `GET /api/internships/getActive` - Get active internships

### Resume
- `POST /api/resume/save` - Save resume
- `POST /api/resume/analyze` - Analyze resume
- `GET /api/resume/list?userId=<id>` - Get user resumes

### Skill Gap Analysis
- `POST /api/skillgap/analyze` - Analyze skill gap

## Frontend Configuration

The frontend is already configured to use the Java backend:
- API base URL: `http://localhost:8000`
- All `.php` references have been removed from the API calls

## Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/internshipportal/
│   │   │   ├── controller/        # REST API controllers
│   │   │   ├── service/           # Business logic
│   │   │   ├── repository/        # Database access layer (JPA)
│   │   │   ├── entity/            # JPA entities
│   │   │   ├── dto/               # Data Transfer Objects
│   │   │   ├── config/            # Configuration classes
│   │   │   └── InternshipPortalBackendApplication.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/
├── pom.xml                         # Maven dependencies
└── database/
    └── schema.sql                  # Database schema
```

## Key Technologies

- **Spring Boot 3.2** - Framework
- **Spring Data JPA** - Database ORM
- **MySQL** - Database
- **Spring Security** - Authentication
- **Lombok** - Boilerplate reduction
- **Jackson** - JSON processing

## Troubleshooting

### Port Already in Use
If port 8000 is already in use, change it in `application.properties`:
```properties
server.port=8001
```

### Database Connection Error
Check that:
1. MySQL is running
2. Database `internship_portal` exists
3. Credentials in `application.properties` are correct

### CORS Issues
CORS is configured to allow all origins. Modify in `InternshipPortalBackendApplication.java` if needed.

## What's Different From PHP

| Feature | PHP | Java |
|---------|-----|------|
| Password Hashing | PHP's `password_hash()` | BCrypt via Spring Security |
| Database ORM | PDO | JPA/Hibernate |
| Routing | Manual `.php` files | Spring annotations |
| Validation | Manual checks | Potential Bean Validation |
| Error Handling | Try-catch | Exception handlers |

## Building for Production

```bash
cd backend
mvn clean package
java -jar target/backend-1.0.0.jar
```

## Database Migrations

To modify the schema:
1. Update `backend/database/schema.sql`
2. Update corresponding entity classes
3. Change `spring.jpa.hibernate.ddl-auto` to `update` temporarily if needed

## Development Tips

1. **Hot Reload** - Use Spring DevTools for automatic restart
2. **Logging** - Check logs in console for debugging
3. **Database** - Use MySQL Workbench or command line to inspect data
4. **Testing** - Use Postman/Insomnia to test endpoints

---

**Your Java backend is ready to use!** 🚀
