# Project Startup Guide

## ✅ Frontend (Already Running)
- **URL**: http://localhost:5173/
- **Status**: ✓ Ready to use

## ⏳ Backend Setup - Maven Required

### Quick Summary
The Java backend needs **Maven** to run. Maven is a build tool for Java projects.

### Step-by-Step: Install Maven on Windows

#### 1. Download Maven

- Go to: https://maven.apache.org/download.cgi
- Download: **apache-maven-3.9.8-bin.zip** (under "Files" section)
- Save it somewhere (e.g., Downloads)

#### 2. Extract Maven

- Right-click the zip file → Extract All
- Extract to: `C:\Program Files\Maven`
  - Create the folder if it doesn't exist
  - You should see folders like: `bin`, `lib`, `conf`, etc. inside

#### 3. Set Environment Variables

**Windows 10/11:**
1. Press **Win + X** and select **System**
2. Scroll down and click **"Advanced system settings"**
3. Click **"Environment Variables..."** button (bottom right)
4. Under **"User variables"**, click **"New..."**
   - **Variable name**: `MAVEN_HOME`
   - **Variable value**: `C:\Program Files\Maven`
   - Click **OK**
5. Find **"Path"** in **"User variables"**, click **"Edit..."**
   - Click **"New"** and type: `%MAVEN_HOME%\bin`
   - Click **OK** on all dialogs

#### 4. Restart PowerShell

- **Close all open PowerShell/CMD windows completely**
- **Open a NEW PowerShell window**
- Type and run:
  ```powershell
  mvn -version
  ```
- Should show: `Apache Maven 3.9.8`

#### 5. Start the Backend

In the new PowerShell window:
```bash
cd backend
mvn spring-boot:run
```

Backend will start on: **http://localhost:8000**

### Database Setup

Make sure MySQL has the database:
```bash
mysql -u root -p < backend/database/schema.sql
```

---

## 🚀 Running the Full Project

**Terminal 1 - Backend (once Maven is installed):**
```bash
cd backend
mvn spring-boot:run
```
Runs on: http://localhost:8000

**Terminal 2 - Frontend:**
```bash
npm run dev
```
Runs on: http://localhost:5173

**Visit Frontend**: http://localhost:5173/

---

## ✅ What's Ready Now
- ✓ Frontend server running (http://localhost:5173/)
- ✓ Database schema exists (backend/database/schema.sql)
- ✓ Java code compiled and ready
- ⏳ Backend needs Maven to run

---

**Ready to start?** Download Maven and follow Steps 1-5 above! 🚀
