import { Menu, Award, TrendingUp, CheckCircle, AlertCircle, FileText, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { resumeAPI } from "../../../utils/api";
import { SidebarMenu } from "../SidebarMenu";

interface ResumeScore {
  overall_score: number;
  content_score: number;
  format_score: number;
  keyword_score: number;
  skills_score: number;
  experience_score: number;
  feedback: string[];
  strengths: string[];
  improvements: string[];
}

export function ResumeScorePage() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedResume, setSelectedResume] = useState<string>("");
  const [resumes, setResumes] = useState<any[]>([]);
  const [score, setScore] = useState<ResumeScore | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      navigate("/signin");
      return;
    }
    loadResumes();
  }, [navigate]);

  const loadResumes = async () => {
    try {
      // First try to fetch from API using the new JWT-based endpoint
      const res = await resumeAPI.getByUser();

      if (res.success && Array.isArray(res.resumes)) {
        setResumes(res.resumes);
      } else {
        // Fallback to local storage if API fails
        const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
        if (user.user?.resumes) {
          setResumes(user.user.resumes);
        } else {
          setResumes([]);
        }
      }
    } catch (error) {
      console.error("Error loading resumes:", error);

      // Fallback
      const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
      if (user.user?.resumes) {
        setResumes(user.user.resumes);
      }
    }
  };

  const analyzeResume = async () => {
    if (!selectedResume) {
      alert("Please select a resume");
      return;
    }

    setLoading(true);
    try {
      const data = await resumeAPI.getScore(parseInt(selectedResume));

      if (data.success) {
        setScore(data.score);
      } else {
        // Mock analysis if API fails
        setScore({
          overall_score: 75,
          content_score: 80,
          format_score: 70,
          keyword_score: 75,
          skills_score: 80,
          experience_score: 70,
          feedback: [
            "Your resume has good structure and formatting",
            "Consider adding more quantifiable achievements",
            "Include more relevant keywords from job descriptions",
          ],
          strengths: [
            "Clear and professional format",
            "Well-organized sections",
            "Good use of action verbs",
          ],
          improvements: [
            "Add more specific metrics and numbers",
            "Include more industry-relevant keywords",
            "Expand on technical skills section",
          ],
        });
      }
    } catch (error) {
      console.error("Error analyzing resume:", error);
      alert("Error analyzing resume");
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
          <h1 className="text-4xl font-bold text-white mb-2">Resume Score</h1>
          <p className="text-gray-400 mb-8">
            Get an AI-powered analysis of your resume and discover areas for improvement
          </p>

          {/* Analysis Form */}
          <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Select Resume</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Choose a Resume
                </label>
                <select
                  value={selectedResume}
                  onChange={(e) => setSelectedResume(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Select a resume...</option>
                  {resumes.map((resume) => (
                    <option key={resume.id} value={resume.id}>
                      {resume.title} - {new Date(resume.created_at).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={analyzeResume}
                disabled={loading || !selectedResume}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Analyzing..." : "Analyze Resume"}
              </button>
            </div>
          </div>

          {/* Overall Score */}
          {score && (
            <>
              <div className={`bg-zinc-900 rounded-xl p-8 border border-zinc-800 mb-8 ${getScoreBgColor(score.overall_score)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Award className="text-cyan-400" size={32} />
                      <h2 className="text-2xl font-bold text-white">Overall Score</h2>
                    </div>
                    <p className="text-gray-400">
                      Your resume's overall quality rating
                    </p>
                  </div>
                  <div className="text-6xl font-bold">
                    <span className={getScoreColor(score.overall_score)}>{score.overall_score}</span>
                    <span className="text-gray-400 text-4xl">/100</span>
                  </div>
                </div>
              </div>

              {/* Detailed Scores */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Content Quality</h3>
                    <span className={`text-2xl font-bold ${getScoreColor(score.content_score)}`}>
                      {score.content_score}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-950 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${score.content_score >= 80
                        ? "bg-green-500"
                        : score.content_score >= 60
                          ? "bg-yellow-500"
                          : "bg-red-500"
                        }`}
                      style={{ width: `${score.content_score}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Format & Design</h3>
                    <span className={`text-2xl font-bold ${getScoreColor(score.format_score)}`}>
                      {score.format_score}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-950 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${score.format_score >= 80
                        ? "bg-green-500"
                        : score.format_score >= 60
                          ? "bg-yellow-500"
                          : "bg-red-500"
                        }`}
                      style={{ width: `${score.format_score}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Keywords</h3>
                    <span className={`text-2xl font-bold ${getScoreColor(score.keyword_score)}`}>
                      {score.keyword_score}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-950 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${score.keyword_score >= 80
                        ? "bg-green-500"
                        : score.keyword_score >= 60
                          ? "bg-yellow-500"
                          : "bg-red-500"
                        }`}
                      style={{ width: `${score.keyword_score}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Skills Section</h3>
                    <span className={`text-2xl font-bold ${getScoreColor(score.skills_score)}`}>
                      {score.skills_score}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-950 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${score.skills_score >= 80
                        ? "bg-green-500"
                        : score.skills_score >= 60
                          ? "bg-yellow-500"
                          : "bg-red-500"
                        }`}
                      style={{ width: `${score.skills_score}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 md:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Experience & Achievements</h3>
                    <span className={`text-2xl font-bold ${getScoreColor(score.experience_score)}`}>
                      {score.experience_score}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-950 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${score.experience_score >= 80
                        ? "bg-green-500"
                        : score.experience_score >= 60
                          ? "bg-yellow-500"
                          : "bg-red-500"
                        }`}
                      style={{ width: `${score.experience_score}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Strengths */}
              {score.strengths && score.strengths.length > 0 && (
                <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800 mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <CheckCircle className="text-green-400" size={24} />
                    <h2 className="text-2xl font-bold text-white">Strengths</h2>
                  </div>
                  <ul className="space-y-3">
                    {score.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-300">
                        <div className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0"></div>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvements */}
              {score.improvements && score.improvements.length > 0 && (
                <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800 mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="text-cyan-400" size={24} />
                    <h2 className="text-2xl font-bold text-white">Areas for Improvement</h2>
                  </div>
                  <ul className="space-y-3">
                    {score.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-300">
                        <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 flex-shrink-0"></div>
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Feedback */}
              {score.feedback && score.feedback.length > 0 && (
                <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800">
                  <div className="flex items-center gap-3 mb-6">
                    <FileText className="text-purple-400" size={24} />
                    <h2 className="text-2xl font-bold text-white">Detailed Feedback</h2>
                  </div>
                  <ul className="space-y-3">
                    {score.feedback.map((item, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-300">
                        <AlertCircle className="text-purple-400 mt-0.5 flex-shrink-0" size={18} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
