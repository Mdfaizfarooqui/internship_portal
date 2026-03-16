import { Menu, TrendingUp, AlertCircle, CheckCircle, XCircle, Target, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { skillGapAPI, internshipAPI, skillAPI, userAPI } from "../../../utils/api";
import { SidebarMenu } from "../SidebarMenu";

interface SkillGap {
  user_skills: string[];
  required_skills: string[];
  missing_skills: string[];
  gap_score: number;
  recommendations: string[];
}

export function SkillGapAnalysisPage() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState<string>("");
  const [internships, setInternships] = useState<any[]>([]);
  const [skillGap, setSkillGap] = useState<SkillGap | null>(null);
  const [loading, setLoading] = useState(false);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const initData = async () => {
      const userJson = localStorage.getItem("currentUser");
      if (!userJson) {
        navigate("/signin");
        return;
      }

      try {
        const userData = JSON.parse(userJson);
        const userId = userData.user?.id || userData.id;
        setCurrentUserId(userId);

        // Fetch User Skills (Fresh)
        const skillsRes = await skillAPI.getByUser();
        if (skillsRes.success && Array.isArray(skillsRes.skills)) {
          setUserSkills(skillsRes.skills.map((s: any) => s.skill_name));
        } else {
          // If the skills API doesn't return an array, try to get profile data
          const profileRes = await userAPI.getProfile();
          if (profileRes.success && profileRes.user?.skills) {
            setUserSkills(profileRes.user.skills);
          } else if (userData.user?.skills) {
            // Fallback to local storage
            setUserSkills(userData.user.skills);
          }
        }

        // Load Internships
        loadInternships();

      } catch (e) {
        console.error("Error initializing skill gap page", e);
      }
    };
    initData();
  }, [navigate]);

  const loadInternships = async () => {
    try {
      const data = await internshipAPI.getActiveInternships();
      if (data.success && Array.isArray(data.internships)) {
        setInternships(data.internships);
      } else {
        // Fallback Mock if API Empty/Fails
        setInternships([
          { id: 1, company: "TechCorp", position: "Software Engineering Intern", required_skills: ["React", "Node.js", "AWS", "JavaScript"] },
          { id: 2, company: "DataFlow Inc", position: "Data Science Intern", required_skills: ["Python", "ML", "SQL"] },
        ]);
      }
    } catch (e) {
      console.error("Failed to load internships", e);
    }
  };

  const analyzeSkillGap = async () => {
    if (!selectedInternship) {
      alert("Please select an internship");
      return;
    }

    setLoading(true);
    try {
      const internshipId = parseInt(selectedInternship);
      const internship = internships.find(i => i.id === internshipId);

      if (!internship) {
        throw new Error("Internship not found");
      }

      // Try API Analysis first
      try {
        const data = await skillGapAPI.analyze(internship.position);

        if (data.success) {
          setSkillGap(data.analysis);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn("API Skill Gap Analysis failed, falling back to client-side calculation", e);
      }

      // Client-side Fallback Calculation
      if (internship) {
        // Parse required skills if string or use directly if array
        let required: string[] = [];
        if (Array.isArray(internship.required_skills)) {
          required = internship.required_skills;
        } else if (typeof internship.required_skills === 'string') {
          try {
            required = JSON.parse(internship.required_skills);
          } catch {
            required = internship.required_skills.split(',').map((s: string) => s.trim());
          }
        }

        // Case insensitive comparison
        const normalize = (s: string) => s.toLowerCase().trim();
        const normalizedUserSkills = userSkills.map(normalize);

        const missing = required.filter(skill => !normalizedUserSkills.includes(normalize(skill)));
        const matched = required.filter(skill => normalizedUserSkills.includes(normalize(skill)));

        const gapScore = required.length > 0
          ? Math.round((matched.length / required.length) * 100)
          : 100; // No requirements = 100% match?

        const recommendations = missing.map(skill =>
          `Learn ${skill} through online courses, tutorials, or hands-on projects`
        );

        setSkillGap({
          user_skills: userSkills,
          required_skills: required,
          missing_skills: missing,
          gap_score: gapScore,
          recommendations,
        });
      }
    } catch (error) {
      console.error("Error analyzing skill gap:", error);
      alert("Error analyzing skill gap");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-500/20 border-green-500/50";
    if (score >= 60) return "bg-yellow-500/20 border-yellow-500/50";
    return "bg-red-500/20 border-red-500/50";
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

            <div className="w-10"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white mb-2">Skill Gap Analysis</h1>
          <p className="text-gray-400 mb-8">
            Compare your skills with internship requirements and identify areas for improvement
          </p>

          {/* Analysis Form */}
          <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Select Internship</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Choose an Internship
                </label>
                <select
                  value={selectedInternship}
                  onChange={(e) => setSelectedInternship(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Select an internship...</option>
                  {internships.map((internship) => (
                    <option key={internship.id} value={internship.id}>
                      {internship.position} at {internship.company}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={analyzeSkillGap}
                disabled={loading || !selectedInternship}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Analyzing..." : "Analyze Skill Gap"}
              </button>
            </div>
          </div>

          {/* Current Skills */}
          <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="text-cyan-400" size={24} />
              <h2 className="text-2xl font-bold text-white">Your Current Skills</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {userSkills.length > 0 ? (
                userSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-gray-400">No skills added yet. Update your profile to add skills.</p>
              )}
            </div>
          </div>

          {/* Analysis Results */}
          {skillGap ? (
            <>
              {/* Gap Score */}
              <div className={`bg-zinc-900 rounded-xl p-8 border border-zinc-800 mb-8 ${getScoreBgColor(skillGap.gap_score)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Skill Match Score</h2>
                    <p className="text-gray-400">
                      You match {skillGap.gap_score}% of the required skills
                    </p>
                  </div>
                  <div className="text-6xl font-bold">
                    <span className={getScoreColor(skillGap.gap_score)}>{skillGap.gap_score}%</span>
                  </div>
                </div>
              </div>

              {/* Required Skills */}
              <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800 mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <Target className="text-purple-400" size={24} />
                  <h2 className="text-2xl font-bold text-white">Required Skills</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {skillGap.required_skills.map((skill, index) => {
                    const normalize = (s: string) => s.toLowerCase().trim();
                    const hasSkill = skillGap.user_skills.some(us => normalize(us) === normalize(skill));
                    return (
                      <span
                        key={index}
                        className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${hasSkill
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                          }`}
                      >
                        {hasSkill ? <CheckCircle size={16} /> : <XCircle size={16} />}
                        {skill}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Missing Skills */}
              {skillGap.missing_skills.length > 0 && (
                <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800 mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <AlertCircle className="text-red-400" size={24} />
                    <h2 className="text-2xl font-bold text-white">Missing Skills</h2>
                  </div>
                  <div className="flex flex-wrap gap-3 mb-6">
                    {skillGap.missing_skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {skillGap.recommendations && skillGap.recommendations.length > 0 && (
                <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800">
                  <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="text-cyan-400" size={24} />
                    <h2 className="text-2xl font-bold text-white">Recommendations</h2>
                  </div>
                  <ul className="space-y-3">
                    {skillGap.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-300">
                        <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 flex-shrink-0"></div>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="bg-zinc-900/50 rounded-xl p-12 border border-dashed border-zinc-800 text-center">
              <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="text-gray-500" size={32} />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">Ready to Analyze</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Select an internship from the dropdown above and click "Analyze Skill Gap" to see how your current skills match up.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
