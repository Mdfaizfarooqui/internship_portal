CREATE DATABASE IF NOT EXISTS internship_portal;
USE internship_portal;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Student',
    bio TEXT,
    location VARCHAR(255),
    phone VARCHAR(20),
    github VARCHAR(255),
    linkedin VARCHAR(255),
    profile_picture VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User Skills table
CREATE TABLE IF NOT EXISTS user_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    proficiency_level VARCHAR(50) DEFAULT 'Beginner',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_skill (user_id, skill_name)
);

-- Education table
CREATE TABLE IF NOT EXISTS education (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    degree VARCHAR(255) NOT NULL,
    institution VARCHAR(255) NOT NULL,
    field_of_study VARCHAR(255),
    start_date DATE,
    graduation_date DATE,
    gpa DECIMAL(3,2),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Work Experience table
CREATE TABLE IF NOT EXISTS work_experience (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    company VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Internships table
CREATE TABLE IF NOT EXISTS internships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    company VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    duration VARCHAR(100),
    stipend VARCHAR(100),
    type VARCHAR(50) DEFAULT 'Full-time',
    requirements TEXT,
    responsibilities TEXT,
    posted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deadline DATE,
    status VARCHAR(50) DEFAULT 'Active',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Internship Skills table
CREATE TABLE IF NOT EXISTS internship_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    internship_id INT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    internship_id INT NOT NULL,
    resume_id INT,
    status VARCHAR(50) DEFAULT 'Pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE
);

-- Saved Internships table
CREATE TABLE IF NOT EXISTS saved_internships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    internship_id INT NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE,
    UNIQUE KEY unique_saved (user_id, internship_id)
);

-- Resumes table
CREATE TABLE IF NOT EXISTS resumes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    file_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Resume Scores table
CREATE TABLE IF NOT EXISTS resume_scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    resume_id INT NOT NULL,
    overall_score INT NOT NULL,
    content_score INT,
    format_score INT,
    keyword_score INT,
    skills_score INT,
    experience_score INT,
    feedback TEXT,
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
);

-- Skill Gap Analysis table
CREATE TABLE IF NOT EXISTS skill_gap_analysis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    internship_id INT NOT NULL,
    user_skills JSON,
    required_skills JSON,
    missing_skills JSON,
    gap_score INT,
    recommendations TEXT,
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE
);

-- Insert sample data
INSERT INTO users (full_name, email, password, role, bio, location, phone, github, linkedin) VALUES
('John Doe', 'john@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Student', 'Passionate computer science student looking for internship opportunities in software development.', 'San Francisco, CA', '+1 (555) 123-4567', 'github.com/johndoe', 'linkedin.com/in/johndoe'),
('Jane Smith', 'jane@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Student', 'Data science enthusiast with experience in machine learning and analytics.', 'New York, NY', '+1 (555) 987-6543', 'github.com/janesmith', 'linkedin.com/in/janesmith');

-- Note: Default password for both users is "password"

INSERT INTO user_skills (user_id, skill_name, proficiency_level) VALUES
(1, 'React', 'Intermediate'),
(1, 'JavaScript', 'Advanced'),
(1, 'Python', 'Intermediate'),
(1, 'Node.js', 'Intermediate'),
(1, 'SQL', 'Beginner'),
(2, 'Python', 'Advanced'),
(2, 'Machine Learning', 'Intermediate'),
(2, 'SQL', 'Advanced'),
(2, 'Data Analysis', 'Intermediate');

INSERT INTO education (user_id, degree, institution, field_of_study, graduation_date) VALUES
(1, 'Bachelor of Science', 'Stanford University', 'Computer Science', '2025-05-01'),
(2, 'Master of Science', 'MIT', 'Data Science', '2024-12-01');

INSERT INTO internships (company, position, description, location, duration, stipend, type, requirements, responsibilities) VALUES
('TechCorp', 'Software Engineering Intern', 'Join our dynamic engineering team to build cutting-edge web applications using modern technologies.', 'San Francisco, CA', '3 months', '$2,500/month', 'Full-time', 'Strong knowledge of React, Node.js, and JavaScript. Experience with AWS preferred.', 'Develop and maintain web applications, Collaborate with cross-functional teams, Write clean and maintainable code'),
('DataFlow Inc', 'Data Science Intern', 'Work on real-world data science projects involving machine learning and predictive analytics.', 'New York, NY', '6 months', '$3,000/month', 'Full-time', 'Proficiency in Python, ML libraries, and SQL. Strong analytical skills required.', 'Analyze large datasets, Build ML models, Create data visualizations'),
('DesignHub', 'UI/UX Design Intern', 'Create beautiful and intuitive user interfaces for our digital products.', 'Remote', '4 months', '$2,000/month', 'Part-time', 'Experience with Figma, Adobe XD, and prototyping tools. Strong design portfolio.', 'Design user interfaces, Create wireframes and prototypes, Conduct user research');

INSERT INTO internship_skills (internship_id, skill_name) VALUES
(1, 'React'),
(1, 'Node.js'),
(1, 'AWS'),
(1, 'JavaScript'),
(2, 'Python'),
(2, 'ML'),
(2, 'SQL'),
(3, 'Figma'),
(3, 'Adobe XD'),
(3, 'Prototyping');
