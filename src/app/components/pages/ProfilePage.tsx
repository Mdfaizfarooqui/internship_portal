import { Menu, Mail, Phone, MapPin, Calendar, Briefcase, Edit, Github, Linkedin, Award, BookOpen, GraduationCap, Building, X, Save, ExternalLink, Trash2, Bookmark, FileText, UploadCloud } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { userAPI, skillAPI, educationAPI, experienceAPI, applicationAPI, savedInternshipAPI, projectAPI, resumeAPI } from "../../../utils/api";
import { SidebarMenu } from "../SidebarMenu";

interface UserData {
  id: string;
  full_name: string;
  email: string;
  role: string;
  bio: string;
  location: string;
  phone?: string;
  github?: string;
  linkedin?: string;
  created_at: string;
  profile_picture?: string;
}

interface Skill {
  id: number;
  skill_name: string;
  proficiency_level: string;
}

interface Education {
  id: number;
  degree: string;
  institution: string;
  field_of_study: string;
  start_date: string;
  graduation_date: string;
  gpa?: string;
  description?: string;
}

interface Experience {
  id: number;
  company: string;
  position: string;
  description: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
}

interface SavedInternship {
  saved_id: number;
  saved_at: string;
  id: number;
  company: string;
  position: string;
  location: string;
  duration: string;
  stipend: string;
  type: string;
  requiredSkills: string[];
  status: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  technologies: string;
  link: string;
}

interface Application {
  id: number;
  internship_id: number;
  company: string;
  position: string;
  location: string;
  type: string;
  stipend: string;
  status: string;
  applied_at: string;
}

export function ProfilePage() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [userData, setUserData] = useState<UserData | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [savedInternships, setSavedInternships] = useState<SavedInternship[]>([]);
  const [appliedInternships, setAppliedInternships] = useState<Application[]>([]);
  const [stats, setStats] = useState({
    applied: 0,
    saved: 0,
    skills: 0
  });

  const [loading, setLoading] = useState(true);

  // Resume State
  const [resumeData, setResumeData] = useState<any>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  // Modal States
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSavedInternshipsOpen, setIsSavedInternshipsOpen] = useState(false);
  const [isAppliedInternshipsOpen, setIsAppliedInternshipsOpen] = useState(false);

  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);

  // Edit Form State
  const [editFormData, setEditFormData] = useState<Partial<UserData>>({});
  const [isSaving, setIsSaving] = useState(false);

  const [skillFormData, setSkillFormData] = useState({ skill_name: '', proficiency_level: 'Beginner' });
  const [educationFormData, setEducationFormData] = useState<Partial<Education>>({});
  const [experienceFormData, setExperienceFormData] = useState<Partial<Experience>>({ is_current: false });
  const [projectFormData, setProjectFormData] = useState<Partial<Project>>({});

  // Profile Completion logic
  const completionPercentage = useMemo(() => {
    if (!userData) return 0;
    let score = 0;
    if (userData.bio && userData.location && userData.phone) score += 20;
    else if (userData.bio || userData.location || userData.phone) score += 10;
    if (skills.length > 0) score += 20;
    if (education.length > 0) score += 20;
    if (experience.length > 0) score += 20;
    if (projects.length > 0) score += 20;
    return score;
  }, [userData, skills, education, experience, projects]);

  useEffect(() => {
    fetchProfileData();
  }, [navigate]);

  const fetchProfileData = async () => {
    const storedUser = localStorage.getItem("currentUser");
    if (!storedUser) {
      navigate("/signin");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      const userId = parsedUser.user?.id || parsedUser.id;

      if (!userId) {
        throw new Error("User ID not found");
      }

      const [
        userRes,
        skillsRes,
        eduRes,
        expRes,
        appsRes,
        savedRes,
        projRes,
        resumeRes
      ] = await Promise.all([
        userAPI.getProfile().catch(e => ({ success: false, error: e })),
        skillAPI.getByUser().catch(e => ({ success: false, error: e })),
        educationAPI.getByUser().catch(e => ({ success: false, error: e })),
        experienceAPI.getByUser().catch(e => ({ success: false, error: e })),
        applicationAPI.getByUser().catch(e => ({ success: false, error: e })),
        savedInternshipAPI.getByUser().catch(e => ({ success: false, error: e })),
        projectAPI.getByUser().catch(e => ({ success: false, error: e })),
        resumeAPI.getByUser().catch(e => ({ success: false, error: e }))
      ]);

      if (userRes.success && userRes.data) {
        setUserData(userRes.data);
        setEditFormData(userRes.data);
      } else {
        setUserData(parsedUser.user || parsedUser);
        setEditFormData(parsedUser.user || parsedUser);
      }

      if (skillsRes.success && Array.isArray(skillsRes.data)) {
        setSkills(skillsRes.data);
      }

      if (eduRes.success && Array.isArray(eduRes.data)) {
        setEducation(eduRes.data);
      }

      if (expRes.success && Array.isArray(expRes.data)) {
        setExperience(expRes.data);
      }

      if (savedRes.success && Array.isArray(savedRes.saved_internships)) {
        setSavedInternships(savedRes.saved_internships);
      }

      if (appsRes.success && Array.isArray(appsRes.applications)) {
        setAppliedInternships(appsRes.applications);
      }

      setStats({
        applied: appsRes.success && Array.isArray(appsRes.applications) ? appsRes.applications.length : 0,
        saved: savedRes.success && Array.isArray(savedRes.saved_internships) ? savedRes.saved_internships.length : 0,
        skills: skillsRes.success && Array.isArray(skillsRes.data) ? skillsRes.data.length : 0
      });

      // @ts-ignore
      if (projRes && projRes.success && Array.isArray(projRes.projects)) {
        // @ts-ignore
        setProjects(projRes.projects);
      }

      // @ts-ignore
      if (resumeRes && resumeRes.success) {
        if (resumeRes.resumes && resumeRes.resumes.length > 0) {
          // @ts-ignore
          setResumeData(resumeRes.resumes[0]);
        } else if (resumeRes.resume) {
          setResumeData(resumeRes.resume);
        }
      }

    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !userData) return;
    const file = e.target.files[0];

    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return;
    }

    setIsUploadingResume(true);
    const formData = new FormData();
    formData.append("user_id", userData.id);
    formData.append("resume", file);
    formData.append("title", file.name);

    try {
      const res = await resumeAPI.uploadResumeFile(formData);
      if (res.success) {
        alert("Resume uploaded successfully!");
        fetchProfileData();
      } else {
        alert("Failed to upload resume: " + res.message);
      }
    } catch (error) {
      console.error("Resume upload error", error);
      alert("An error occurred during upload.");
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;
    setIsSaving(true);
    try {
      const res = await skillAPI.create(skillFormData.skill_name, skillFormData.proficiency_level);
      if (res.success) { fetchProfileData(); setIsSkillsModalOpen(false); setSkillFormData({ skill_name: '', proficiency_level: 'Beginner' }); }
      else alert(res.message);
    } catch (err) { console.error(err); } finally { setIsSaving(false); }
  };

  const handleAddEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;
    setIsSaving(true);
    try {
      const res = await educationAPI.create({ user_id: parseInt(userData.id), ...educationFormData });
      if (res.success) { fetchProfileData(); setIsEducationModalOpen(false); setEducationFormData({}); }
      else alert(res.message);
    } catch (err) { console.error(err); } finally { setIsSaving(false); }
  };

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;
    setIsSaving(true);
    try {
      const res = await experienceAPI.create({ user_id: parseInt(userData.id), ...experienceFormData });
      if (res.success) { fetchProfileData(); setIsExperienceModalOpen(false); setExperienceFormData({ is_current: false }); }
      else alert(res.message);
    } catch (err) { console.error(err); } finally { setIsSaving(false); }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;
    setIsSaving(true);
    try {
      const res = await projectAPI.create({ user_id: parseInt(userData.id), ...projectFormData });
      if (res.success) { fetchProfileData(); setIsProjectsModalOpen(false); setProjectFormData({}); }
      else alert(res.message);
    } catch (err) { console.error(err); } finally { setIsSaving(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  const handleEditProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;

    setIsSaving(true);
    try {
      const res = await userAPI.updateProfile({
        id: userData.id,
        ...editFormData
      });

      if (res.success) {
        // Refresh data
        await fetchProfileData();
        setIsEditProfileOpen(false);
      } else {
        alert("Failed to update profile: " + (res.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Update failed", error);
      alert("An error occurred while updating profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnsaveInternship = async (internshipId: number) => {
    if (!userData) return;
    if (!confirm("Are you sure you want to remove this internship from your saved list?")) return;

    try {
      const res = await savedInternshipAPI.unsave(internshipId);
      if (res.success) {
        // Optimistically update UI
        setSavedInternships(prev => prev.filter(item => item.id !== internshipId));
        setStats(prev => ({ ...prev, saved: prev.saved - 1 }));
      } else {
        alert("Failed to unsave: " + res.message);
      }
    } catch (error) {
      console.error("Unsave failed", error);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading Profile...</div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 relative">
      <SidebarMenu isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-gray-300 hover:text-cyan-400 transition-colors p-2"
            >
              <Menu size={24} />
            </button>

            <div className="text-2xl font-bold">
              <span className="text-white">Intern</span>
              <span className="text-cyan-400">Hub</span>
            </div>

            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-cyan-400 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Profile Header Card */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800/50 rounded-2xl p-8 border border-zinc-700 mb-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-5xl font-bold text-white shadow-lg border-4 border-zinc-900">
                  {userData.profile_picture ? (
                    <img src={userData.profile_picture} alt={userData.full_name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    userData.full_name?.charAt(0).toUpperCase()
                  )}
                </div>
                {/* Mock Upload Button - Logic can be added similar to edit profile */}
                <button className="absolute bottom-0 right-0 w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-white hover:bg-cyan-600 transition-all shadow-lg hover:scale-110">
                  <Edit size={16} />
                </button>
              </div>

              {/* User Info */}
              <div className="flex-1 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-1">{userData.full_name}</h1>
                    <p className="text-cyan-400 text-lg font-medium">{userData.role || "Student"}</p>
                  </div>
                  <button
                    onClick={() => setIsEditProfileOpen(true)}
                    className="mt-4 sm:mt-0 px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg border border-zinc-600 transition-all duration-200 flex items-center gap-2"
                  >
                    <Edit size={16} />
                    <span>Edit Profile</span>
                  </button>
                </div>

                <p className="text-gray-300 mb-6 max-w-2xl leading-relaxed">{userData.bio || "No bio added yet."}</p>

                {/* Profile Completion */}
                {(!userData.role || userData.role.toLowerCase() === 'student') && (
                  <div className="mb-6 bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50 max-w-2xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-300">Profile Completion</span>
                      <span className="text-sm font-bold text-cyan-400">{completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Contact Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-3 text-gray-400 bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50">
                    <Mail size={16} className="text-cyan-400" />
                    <span className="truncate">{userData.email}</span>
                  </div>
                  {userData.phone && (
                    <div className="flex items-center gap-3 text-gray-400 bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50">
                      <Phone size={16} className="text-cyan-400" />
                      <span>{userData.phone}</span>
                    </div>
                  )}
                  {userData.location && (
                    <div className="flex items-center gap-3 text-gray-400 bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50">
                      <MapPin size={16} className="text-cyan-400" />
                      <span>{userData.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-gray-400 bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50">
                    <Calendar size={16} className="text-cyan-400" />
                    <span>Joined {new Date(userData.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Resume Upload Box */}
                {(!userData.role || userData.role.toLowerCase() === 'student') && (
                  <div className="mt-6 bg-zinc-950/50 rounded-xl p-4 border border-zinc-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-cyan-500/10 rounded-lg text-cyan-400">
                        <FileText size={24} />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">Your Resume</h4>
                        {resumeData ? (
                          <p className="text-sm text-gray-400 flex items-center gap-1">
                            <span className="truncate max-w-[200px] inline-block">{resumeData.title || "Resume.pdf"}</span>
                            <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-400 rounded border border-green-500/20 ml-2">Active</span>
                          </p>
                        ) : (
                          <p className="text-sm text-gray-400">No resume uploaded yet.</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                      {resumeData && resumeData.file_path && (
                        <a
                          href={resumeData.file_path.startsWith('http') ? resumeData.file_path : `http://localhost:8000/${resumeData.file_path}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 sm:flex-none px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm text-center transition-colors shadow-sm"
                        >
                          View PDF
                        </a>
                      )}
                      <label className="flex-1 sm:flex-none cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleResumeUpload}
                          disabled={isUploadingResume}
                          className="hidden"
                        />
                        <div className={`px-4 py-2 rounded-lg text-sm text-center transition-all flex items-center justify-center gap-2 ${isUploadingResume
                          ? "bg-cyan-500/50 text-white cursor-not-allowed"
                          : "bg-cyan-500 hover:bg-cyan-600 text-white shadow-md shadow-cyan-500/20"
                          }`}>
                          <UploadCloud size={16} />
                          <span>{isUploadingResume ? "Uploading..." : (resumeData ? "Update Resume" : "Upload PDF")}</span>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* Social Links */}
                {(userData.github || userData.linkedin) && (
                  <div className="flex gap-3 mt-6">
                    {userData.github && (
                      <a
                        href={`https://${userData.github.replace(/^https?:\/\//, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-gray-300 hover:text-white hover:border-cyan-500/50 transition-all hover:-translate-y-0.5"
                      >
                        <Github size={18} />
                        <span className="text-sm font-medium">GitHub</span>
                      </a>
                    )}
                    {userData.linkedin && (
                      <a
                        href={`https://${userData.linkedin.replace(/^https?:\/\//, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-gray-300 hover:text-white hover:border-blue-500/50 transition-all hover:-translate-y-0.5"
                      >
                        <Linkedin size={18} />
                        <span className="text-sm font-medium">LinkedIn</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div
              className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800 backdrop-blur-sm hover:border-cyan-500/50 transition-colors cursor-pointer group"
              onClick={() => setIsAppliedInternshipsOpen(true)}
            >
              <div className="flex items-center justify-between mb-2">
                <Briefcase className="text-cyan-400" size={24} />
                <span className="text-3xl font-bold text-white group-hover:text-cyan-400 transition-colors">{stats.applied}</span>
              </div>
              <p className="text-gray-400 font-medium group-hover:text-white transition-colors">Applied Internships</p>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1 group-hover:text-cyan-400/80">
                View Applications <ExternalLink size={10} />
              </p>
            </div>

            <div
              className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800 backdrop-blur-sm hover:border-cyan-500/50 transition-colors cursor-pointer group"
              onClick={() => setIsSavedInternshipsOpen(true)}
            >
              <div className="flex items-center justify-between mb-2">
                <Award className="text-purple-400" size={24} />
                <span className="text-3xl font-bold text-white group-hover:text-purple-400 transition-colors">{stats.saved}</span>
              </div>
              <p className="text-gray-400 font-medium group-hover:text-white transition-colors">Saved Internships</p>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1 group-hover:text-purple-400/80">
                View Saved <ExternalLink size={10} />
              </p>
            </div>

            <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800 backdrop-blur-sm hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <BookOpen className="text-green-400" size={24} />
                <span className="text-3xl font-bold text-white">{stats.skills}</span>
              </div>
              <p className="text-gray-400 font-medium">Skills Verified</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid lg:grid-cols-3 gap-8">

            {/* Left Column: Skills & Education */}
            <div className="space-y-8 lg:col-span-1">

              {/* Skills Section */}
              <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 h-fit">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Award size={20} className="text-cyan-400" />
                    Skills
                  </h2>
                  <button onClick={() => setIsSkillsModalOpen(true)} className="p-1.5 hover:bg-zinc-800 rounded-lg text-cyan-400 transition-colors">
                    <Edit size={16} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.length > 0 ? (
                    skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="px-3 py-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20 text-sm font-medium hover:bg-cyan-500/20 transition-colors cursor-default"
                        title={skill.proficiency_level}
                      >
                        {skill.skill_name}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm italic">No skills added yet.</p>
                  )}
                </div>
              </div>

              {/* Education Section */}
              <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 h-fit">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <GraduationCap size={20} className="text-cyan-400" />
                    Education
                  </h2>
                  <button onClick={() => setIsEducationModalOpen(true)} className="p-1.5 hover:bg-zinc-800 rounded-lg text-cyan-400 transition-colors">
                    <Edit size={16} />
                  </button>
                </div>
                <div className="space-y-6">
                  {education.length > 0 ? (
                    education.map((edu) => (
                      <div key={edu.id} className="relative pl-4 border-l-2 border-zinc-800">
                        <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-cyan-500"></div>
                        <h3 className="text-white font-semibold">{edu.institution}</h3>
                        <p className="text-cyan-400 text-sm">{edu.degree}</p>
                        {edu.field_of_study && <p className="text-gray-400 text-xs">{edu.field_of_study}</p>}
                        <p className="text-gray-500 text-xs mt-1">
                          {new Date(edu.start_date).getFullYear()} - {edu.graduation_date ? new Date(edu.graduation_date).getFullYear() : 'Present'}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm italic">No education history added.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Experience */}
            <div className="lg:col-span-2">
              <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 min-h-[400px]">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Building size={20} className="text-cyan-400" />
                    Work Experience
                  </h2>
                  <button onClick={() => setIsExperienceModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-lg transition-colors">
                    <Edit size={16} />
                    <span>Add Experience</span>
                  </button>
                </div>

                <div className="space-y-8">
                  {experience.length > 0 ? (
                    experience.map((exp) => (
                      <div key={exp.id} className="group relative bg-zinc-950/50 p-6 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-white">{exp.position}</h3>
                            <p className="text-cyan-400">{exp.company}</p>
                          </div>
                          <span className="text-xs font-mono text-gray-500 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                            {new Date(exp.start_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} -
                            {exp.is_current ? ' Present' : ` ${new Date(exp.end_date!).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}`}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed mt-4">
                          {exp.description}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-xl">
                      <Building className="mx-auto text-gray-600 mb-3" size={48} />
                      <p className="text-gray-400 mb-4">No work experience listed yet.</p>
                      <button className="text-cyan-400 hover:text-cyan-300 font-medium">
                        + Add your first experience
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>

          {/* Projects Section */}
          <div className="mt-8">
            <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <BookOpen size={20} className="text-cyan-400" />
                  Projects
                </h2>
                <button onClick={() => setIsProjectsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-lg transition-colors">
                  <Edit size={16} />
                  <span>Add Project</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.length > 0 ? (
                  projects.map((proj) => (
                    <div key={proj.id} className="bg-zinc-950/50 p-6 rounded-xl border border-zinc-800 hover:border-cyan-500/30 transition-all group">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">{proj.name}</h3>
                        {proj.link && (
                          <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-cyan-400 transition-colors">
                            <ExternalLink size={16} />
                          </a>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{proj.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {proj.technologies && proj.technologies.split(',').map((tech, i) => (
                          <span key={i} className="px-2 py-1 bg-zinc-900 text-xs text-gray-300 rounded border border-zinc-700">
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 border-2 border-dashed border-zinc-800 rounded-xl">
                    <BookOpen className="mx-auto text-gray-600 mb-3" size={48} />
                    <p className="text-gray-400">No projects added yet.</p>
                    <Link to="/resume-builder" className="text-cyan-400 hover:underline mt-2 inline-block">
                      Go to Resume Builder to add projects
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 w-full max-w-2xl rounded-2xl border border-zinc-800 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEditProfileOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">Edit Profile</h2>

            <form onSubmit={handleEditProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={editFormData.full_name || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Role / Title</label>
                  <input
                    type="text"
                    value={editFormData.role || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="e.g. Student, Software Engineer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Bio</label>
                <textarea
                  value={editFormData.bio || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                  rows={4}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Location</label>
                  <input
                    type="text"
                    value={editFormData.location || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Phone</label>
                  <input
                    type="text"
                    value={editFormData.phone || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">GitHub URL</label>
                  <input
                    type="text"
                    value={editFormData.github || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, github: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="github.com/username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">LinkedIn URL</label>
                  <input
                    type="text"
                    value={editFormData.linkedin || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, linkedin: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="linkedin.com/in/username"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-6 py-2 rounded-lg border border-zinc-700 text-gray-300 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium hover:from-cyan-600 hover:to-blue-700 transition-all disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Saved Internships Modal */}
      {isSavedInternshipsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 w-full max-w-4xl rounded-2xl border border-zinc-800 shadow-2xl p-6 relative max-h-[90vh] flex flex-col">
            <button
              onClick={() => setIsSavedInternshipsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Award className="text-purple-400" />
              Saved Internships
            </h2>

            <div className="overflow-y-auto pr-2 custom-scrollbar flex-1">
              {savedInternships.length > 0 ? (
                <div className="grid gap-4">
                  {savedInternships.map(internship => (
                    <div key={internship.id} className="bg-zinc-950 p-5 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="text-lg font-bold text-white">{internship.position}</h3>
                          <span className="text-xs text-gray-500">Saved: {new Date(internship.saved_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-cyan-400 text-sm mb-2">{internship.company}</p>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-400 mt-3">
                          <span className="flex items-center gap-1"><MapPin size={14} /> {internship.location}</span>
                          <span className="flex items-center gap-1"><Briefcase size={14} /> {internship.type}</span>
                          <span className="text-green-400 font-medium">{internship.stipend}</span>
                        </div>
                      </div>
                      <div className="flex flex-row md:flex-col gap-2 justify-end">
                        <Link to={`/internships/${internship.id}`}>
                          <button className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-lg transition-colors">
                            View Details
                          </button>
                        </Link>
                        <button
                          onClick={() => handleUnsaveInternship(internship.id)}
                          className="w-full px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <Trash2 size={16} /> Unsave
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <Bookmark size={48} className="mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400">No saved internships yet.</p>
                  <Link to="/internships" onClick={() => setIsSavedInternshipsOpen(false)}>
                    <button className="mt-4 text-cyan-400 hover:underline">Browse Internships</button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Applied Internships Modal */}
      {isAppliedInternshipsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 w-full max-w-4xl rounded-2xl border border-zinc-800 shadow-2xl p-6 relative max-h-[90vh] flex flex-col">
            <button
              onClick={() => setIsAppliedInternshipsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Briefcase className="text-cyan-400" />
              Applied Internships
            </h2>

            <div className="overflow-y-auto pr-2 custom-scrollbar flex-1">
              {appliedInternships.length > 0 ? (
                <div className="grid gap-4">
                  {appliedInternships.map(app => (
                    <div key={app.id} className="bg-zinc-950 p-5 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-bold text-white">{app.position}</h3>
                            <p className="text-cyan-400 text-sm mb-1">{app.company}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${app.status === 'Accepted' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                            app.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                              'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                            }`}>
                            {app.status}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-400 mt-3">
                          <span className="flex items-center gap-1"><MapPin size={14} /> {app.location}</span>
                          <span className="flex items-center gap-1"><Calendar size={14} /> Applied: {new Date(app.applied_at).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><Briefcase size={14} /> {app.type}</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Link to={`/internships/${app.internship_id}`} className="w-full md:w-auto">
                          <button className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-2">
                            View Internship <ExternalLink size={14} />
                          </button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <Briefcase size={48} className="mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400">You haven't applied to any internships yet.</p>
                  <Link to="/internships" onClick={() => setIsAppliedInternshipsOpen(false)}>
                    <button className="mt-4 text-cyan-400 hover:underline">Browse Internships</button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Skill Modal */}
      {isSkillsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 w-full max-w-md rounded-2xl border border-zinc-800 shadow-2xl p-6 relative">
            <button onClick={() => setIsSkillsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"><X size={24} /></button>
            <h2 className="text-2xl font-bold text-white mb-6">Add Skill</h2>
            <form onSubmit={handleAddSkill} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Skill Name</label>
                <input type="text" required value={skillFormData.skill_name} onChange={(e) => setSkillFormData({ ...skillFormData, skill_name: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Proficiency</label>
                <select value={skillFormData.proficiency_level} onChange={(e) => setSkillFormData({ ...skillFormData, proficiency_level: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none">
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button type="submit" disabled={isSaving} className="px-6 py-2 rounded-lg bg-cyan-500 text-white font-medium hover:bg-cyan-600 transition-all">{isSaving ? "Saving..." : "Save Skill"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Education Modal */}
      {isEducationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 w-full max-w-md rounded-2xl border border-zinc-800 shadow-2xl p-6 relative">
            <button onClick={() => setIsEducationModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"><X size={24} /></button>
            <h2 className="text-2xl font-bold text-white mb-6">Add Education</h2>
            <form onSubmit={handleAddEducation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Institution</label>
                <input type="text" required value={educationFormData.institution || ''} onChange={(e) => setEducationFormData({ ...educationFormData, institution: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Degree</label>
                <input type="text" required value={educationFormData.degree || ''} onChange={(e) => setEducationFormData({ ...educationFormData, degree: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Field of Study</label>
                <input type="text" value={educationFormData.field_of_study || ''} onChange={(e) => setEducationFormData({ ...educationFormData, field_of_study: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Start Date</label>
                  <input type="date" required value={educationFormData.start_date || ''} onChange={(e) => setEducationFormData({ ...educationFormData, start_date: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Graduation Date</label>
                  <input type="date" value={educationFormData.graduation_date || ''} onChange={(e) => setEducationFormData({ ...educationFormData, graduation_date: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button type="submit" disabled={isSaving} className="px-6 py-2 rounded-lg bg-cyan-500 text-white font-medium hover:bg-cyan-600 transition-all">{isSaving ? "Saving..." : "Save Education"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Experience Modal */}
      {isExperienceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 w-full max-w-md rounded-2xl border border-zinc-800 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsExperienceModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"><X size={24} /></button>
            <h2 className="text-2xl font-bold text-white mb-6">Add Experience</h2>
            <form onSubmit={handleAddExperience} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Company</label>
                <input type="text" required value={experienceFormData.company || ''} onChange={(e) => setExperienceFormData({ ...experienceFormData, company: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Position</label>
                <input type="text" required value={experienceFormData.position || ''} onChange={(e) => setExperienceFormData({ ...experienceFormData, position: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Start Date</label>
                  <input type="date" required value={experienceFormData.start_date || ''} onChange={(e) => setExperienceFormData({ ...experienceFormData, start_date: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none" />
                </div>
                {!experienceFormData.is_current && (
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-400 mb-2">End Date</label>
                    <input type="date" value={experienceFormData.end_date || ''} onChange={(e) => setExperienceFormData({ ...experienceFormData, end_date: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={experienceFormData.is_current || false} onChange={(e) => setExperienceFormData({ ...experienceFormData, is_current: e.target.checked })} className="rounded bg-zinc-950 border-zinc-800" />
                <label className="text-sm text-gray-400">I currently work here</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                <textarea rows={3} required value={experienceFormData.description || ''} onChange={(e) => setExperienceFormData({ ...experienceFormData, description: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none" />
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button type="submit" disabled={isSaving} className="px-6 py-2 rounded-lg bg-cyan-500 text-white font-medium hover:bg-cyan-600 transition-all">{isSaving ? "Saving..." : "Save Experience"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {isProjectsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 w-full max-w-md rounded-2xl border border-zinc-800 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsProjectsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"><X size={24} /></button>
            <h2 className="text-2xl font-bold text-white mb-6">Add Project</h2>
            <form onSubmit={handleAddProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Project Name</label>
                <input type="text" required value={projectFormData.name || ''} onChange={(e) => setProjectFormData({ ...projectFormData, name: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Project Link (Optional)</label>
                <input type="url" value={projectFormData.link || ''} onChange={(e) => setProjectFormData({ ...projectFormData, link: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Technologies (comma separated)</label>
                <input type="text" required value={projectFormData.technologies || ''} onChange={(e) => setProjectFormData({ ...projectFormData, technologies: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                <textarea rows={3} required value={projectFormData.description || ''} onChange={(e) => setProjectFormData({ ...projectFormData, description: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none" />
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button type="submit" disabled={isSaving} className="px-6 py-2 rounded-lg bg-cyan-500 text-white font-medium hover:bg-cyan-600 transition-all">{isSaving ? "Saving..." : "Save Project"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
