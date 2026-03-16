import { Menu, Save, Download, Eye, Plus, Trash2, Edit2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { resumeAPI, educationAPI, experienceAPI, skillAPI, userAPI, projectAPI } from "../../../utils/api";
import { SidebarMenu } from "../SidebarMenu";

interface ResumeData {
  id?: number;
  title: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    website: string;
  };
  summary: string;
  education: Array<{
    id?: string;
    degree: string;
    institution: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    gpa: string;
    description: string;
  }>;
  experience: Array<{
    id?: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    description: string;
  }>;
  skills: string[];
  projects: Array<{
    id?: string;
    name: string;
    description: string;
    technologies: string;
    link: string;
  }>;
}

export function ResumeBuilderPage() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [resumeData, setResumeData] = useState<ResumeData>({
    title: "My Resume",
    personalInfo: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      github: "",
      website: "",
    },
    summary: "",
    education: [],
    experience: [],
    skills: [],
    projects: [],
  });
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const initData = async () => {
      const userJson = localStorage.getItem("currentUser");
      if (!userJson) {
        navigate("/signin");
        return;
      }

      try {
        const localUserData = JSON.parse(userJson);
        const userId = localUserData.user?.id || localUserData.id;

        if (!userId) {
          console.error("User ID missing from local storage");
          navigate("/signin");
          return;
        }

        setCurrentUserId(userId);

        // Fetch fresh data from API using JWT auth handled by apiCall
        const [userRes, eduRes, expRes, skillRes, projRes] = await Promise.all([
          userAPI.getProfile().catch(e => ({ success: false })),
          educationAPI.getByUser().catch(e => ({ success: false })),
          experienceAPI.getByUser().catch(e => ({ success: false })),
          skillAPI.getByUser().catch(e => ({ success: false })),
          // @ts-ignore
          projectAPI.getByUser().catch(e => ({ success: false }))
        ]);

        setResumeData(prev => {
          const newData = { ...prev };

          // 1. Personal Info
          if (userRes.success && userRes.data) {
            newData.personalInfo = {
              fullName: userRes.data.full_name || "",
              email: userRes.data.email || "",
              phone: userRes.data.phone || "",
              location: userRes.data.location || "",
              linkedin: userRes.data.linkedin || "",
              github: userRes.data.github || "",
              website: ""
            };
          } else if (localUserData.user) {
            newData.personalInfo = {
              fullName: localUserData.user.full_name || "",
              email: localUserData.user.email || "",
              phone: localUserData.user.phone || "",
              location: localUserData.user.location || "",
              linkedin: localUserData.user.linkedin || "",
              github: localUserData.user.github || "",
              website: ""
            };
          }

          // 2. Education
          if (eduRes.success && Array.isArray(eduRes.education)) {
            newData.education = eduRes.education.map((edu: any) => ({
              id: edu.id.toString(),
              degree: edu.degree,
              institution: edu.institution,
              fieldOfStudy: edu.field_of_study || "",
              startDate: edu.start_date,
              endDate: edu.graduation_date,
              gpa: edu.gpa || "",
              description: edu.description || ""
            }));
          }

          // 3. Experience
          if (expRes.success && Array.isArray(expRes.experience)) {
            newData.experience = expRes.experience.map((exp: any) => ({
              id: exp.id.toString(),
              company: exp.company,
              position: exp.position,
              startDate: exp.start_date,
              endDate: exp.end_date,
              isCurrent: exp.is_current == 1 || exp.is_current === true,
              description: exp.description || ""
            }));
          }

          // 4. Skills
          // Response structure check: Controller returns { success: true, skills: [...] }
          if (skillRes.success && Array.isArray(skillRes.skills)) {
            newData.skills = skillRes.skills.map((s: any) => s.skill_name);
          }

          // 5. Projects
          // @ts-ignore
          if (projRes && projRes.success && Array.isArray(projRes.projects)) {
            // @ts-ignore
            newData.projects = projRes.projects.map((p: any) => ({
              id: p.id.toString(),
              name: p.name,
              description: p.description || "",
              technologies: p.technologies || "",
              link: p.link || ""
            }));
          }

          return newData;
        });

      } catch (e) {
        console.error("Error initializing resume builder", e);
      }
    };

    initData();
  }, [navigate]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // 1. Save Resume Document & Sync Data (One Call) (API uses JWT)
      const saveRes = await resumeAPI.saveBuilder({
        title: resumeData.title,
        id: resumeData.id,
        personalInfo: resumeData.personalInfo,
        education: resumeData.education,
        experience: resumeData.experience,
        skills: resumeData.skills,
        projects: resumeData.projects
      });

      if (!saveRes.success) {
        throw new Error(saveRes.message || "Failed to save resume");
      }

      alert("Resume saved and profile updated successfully! Redirecting to profile...");

      // FORCE RELOAD to ensure Profile Page fetches fresh data
      window.location.href = '/profile';

    } catch (error: any) {
      alert("Error saving: " + (error.message || "Unknown error"));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, {
        id: Date.now().toString(),
        degree: "",
        institution: "",
        fieldOfStudy: "",
        startDate: "",
        endDate: "",
        gpa: "",
        description: "",
      }],
    }));
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        id: Date.now().toString(),
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        isCurrent: false,
        description: "",
      }],
    }));
  };

  const addProject = () => {
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, {
        id: Date.now().toString(),
        name: "",
        description: "",
        technologies: "",
        link: "",
      }],
    }));
  };

  const updateField = (section: string, field: string, value: any, index?: number) => {
    setResumeData(prev => {
      const newData = { ...prev };
      if (index !== undefined) {
        if (section === "education") {
          newData.education = [...newData.education];
          newData.education[index] = { ...newData.education[index], [field]: value };
        } else if (section === "experience") {
          newData.experience = [...newData.experience];
          newData.experience[index] = { ...newData.experience[index], [field]: value };
        } else if (section === "projects") {
          newData.projects = [...newData.projects];
          newData.projects[index] = { ...newData.projects[index], [field]: value };
        }
      } else if (section === "personalInfo") {
        newData.personalInfo = { ...newData.personalInfo, [field]: value };
      } else {
        (newData as any)[section] = value;
      }
      return newData;
    });
  };

  const removeItem = (section: "education" | "experience" | "projects", index: number) => {
    setResumeData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }));
  };

  const addSkill = (skill: string) => {
    if (skill && !resumeData.skills.includes(skill)) {
      setResumeData(prev => ({
        ...prev,
        skills: [...prev.skills, skill],
      }));
    }
  };

  const removeSkill = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="min-h-screen bg-zinc-950">
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

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                title="Save Resume & Update Profile"
              >
                <Save size={18} />
                {loading ? "Saving..." : "Save & Sync"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white mb-8">Resume Builder</h1>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto">
            {["personal", "summary", "education", "experience", "skills", "projects"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === tab
                  ? "bg-cyan-500 text-white"
                  : "bg-zinc-900 text-gray-400 hover:bg-zinc-800"
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Personal Info Tab */}
          {activeTab === "personal" && (
            <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800 space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Personal Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.fullName}
                    onChange={(e) => updateField("personalInfo", "fullName", e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={resumeData.personalInfo.email}
                    onChange={(e) => updateField("personalInfo", "email", e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={resumeData.personalInfo.phone}
                    onChange={(e) => updateField("personalInfo", "phone", e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.location}
                    onChange={(e) => updateField("personalInfo", "location", e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">LinkedIn</label>
                  <input
                    type="url"
                    value={resumeData.personalInfo.linkedin}
                    onChange={(e) => updateField("personalInfo", "linkedin", e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">GitHub</label>
                  <input
                    type="url"
                    value={resumeData.personalInfo.github}
                    onChange={(e) => updateField("personalInfo", "github", e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Summary Tab */}
          {activeTab === "summary" && (
            <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800">
              <h2 className="text-2xl font-bold text-white mb-6">Professional Summary</h2>
              <textarea
                value={resumeData.summary}
                onChange={(e) => updateField("summary", "", e.target.value)}
                rows={8}
                className="w-full px-4 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                placeholder="Write a brief summary of your professional background and career goals..."
              />
            </div>
          )}

          {/* Education Tab */}
          {activeTab === "education" && (
            <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Education</h2>
                <button
                  onClick={addEducation}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                >
                  <Plus size={18} />
                  Add Education
                </button>
              </div>
              <div className="space-y-6">
                {resumeData.education.map((edu, index) => (
                  <div key={edu.id || index} className="bg-zinc-950 rounded-lg p-6 border border-zinc-700">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-white">Education #{index + 1}</h3>
                      <button
                        onClick={() => removeItem("education", index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Degree</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => updateField("education", "degree", e.target.value, index)}
                          className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Institution</label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => updateField("education", "institution", e.target.value, index)}
                          className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Field of Study</label>
                        <input
                          type="text"
                          value={edu.fieldOfStudy}
                          onChange={(e) => updateField("education", "fieldOfStudy", e.target.value, index)}
                          className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">GPA</label>
                        <input
                          type="text"
                          value={edu.gpa}
                          onChange={(e) => updateField("education", "gpa", e.target.value, index)}
                          className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                        <input
                          type="date"
                          value={edu.startDate}
                          onChange={(e) => updateField("education", "startDate", e.target.value, index)}
                          className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                        <input
                          type="date"
                          value={edu.endDate}
                          onChange={(e) => updateField("education", "endDate", e.target.value, index)}
                          className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                      <textarea
                        value={edu.description}
                        onChange={(e) => updateField("education", "description", e.target.value, index)}
                        rows={3}
                        className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Experience Tab */}
          {activeTab === "experience" && (
            <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Work Experience</h2>
                <button
                  onClick={addExperience}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                >
                  <Plus size={18} />
                  Add Experience
                </button>
              </div>
              <div className="space-y-6">
                {resumeData.experience.map((exp, index) => (
                  <div key={exp.id || index} className="bg-zinc-950 rounded-lg p-6 border border-zinc-700">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-white">Experience #{index + 1}</h3>
                      <button
                        onClick={() => removeItem("experience", index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => updateField("experience", "company", e.target.value, index)}
                          className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Position</label>
                        <input
                          type="text"
                          value={exp.position}
                          onChange={(e) => updateField("experience", "position", e.target.value, index)}
                          className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                        <input
                          type="date"
                          value={exp.startDate}
                          onChange={(e) => updateField("experience", "startDate", e.target.value, index)}
                          className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                        <input
                          type="date"
                          value={exp.endDate}
                          onChange={(e) => updateField("experience", "endDate", e.target.value, index)}
                          disabled={exp.isCurrent}
                          className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                        />
                        <label className="flex items-center gap-2 mt-2 text-sm text-gray-300">
                          <input
                            type="checkbox"
                            checked={exp.isCurrent}
                            onChange={(e) => updateField("experience", "isCurrent", e.target.checked, index)}
                            className="rounded"
                          />
                          Current Position
                        </label>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                      <textarea
                        value={exp.description}
                        onChange={(e) => updateField("experience", "description", e.target.value, index)}
                        rows={4}
                        className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === "skills" && (
            <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800">
              <h2 className="text-2xl font-bold text-white mb-6">Skills</h2>
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Add a skill and press Enter"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      addSkill(e.currentTarget.value);
                      e.currentTarget.value = "";
                    }
                  }}
                  className="w-full px-4 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                {resumeData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20"
                  >
                    {skill}
                    <button
                      onClick={() => removeSkill(index)}
                      className="text-cyan-400 hover:text-red-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === "projects" && (
            <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Projects</h2>
                <button
                  onClick={addProject}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                >
                  <Plus size={18} />
                  Add Project
                </button>
              </div>
              <div className="space-y-6">
                {resumeData.projects.map((project, index) => (
                  <div key={project.id || index} className="bg-zinc-950 rounded-lg p-6 border border-zinc-700">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-white">Project #{index + 1}</h3>
                      <button
                        onClick={() => removeItem("projects", index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Project Name</label>
                        <input
                          type="text"
                          value={project.name}
                          onChange={(e) => updateField("projects", "name", e.target.value, index)}
                          className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                        <textarea
                          value={project.description}
                          onChange={(e) => updateField("projects", "description", e.target.value, index)}
                          rows={3}
                          className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Technologies</label>
                          <input
                            type="text"
                            value={project.technologies}
                            onChange={(e) => updateField("projects", "technologies", e.target.value, index)}
                            className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                            placeholder="React, Node.js, MongoDB"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Link</label>
                          <input
                            type="url"
                            value={project.link}
                            onChange={(e) => updateField("projects", "link", e.target.value, index)}
                            className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
