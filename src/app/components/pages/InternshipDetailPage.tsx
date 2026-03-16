import { MapPin, Clock, DollarSign, Bookmark, Menu, ArrowLeft, CheckCircle, Users, Calendar, FileText, Loader2, AlertCircle, Briefcase } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { internshipAPI, applicationAPI, userAPI, savedInternshipAPI, resumeAPI } from "../../../utils/api";
import { SidebarMenu } from "../SidebarMenu";
import { ApplyModal } from "../ui/ApplyModal";

interface Internship {
  id: number;
  company: string;
  position: string;
  description: string;
  location: string;
  duration: string;
  stipend: string;
  type: string;
  requirements: string;
  responsibilities: string;
  required_skills: string[];
  applicant_count: number;
  posted_date: string;
  deadline: string;
  status: string;
}

interface ApplicationStatus {
  hasApplied: boolean;
  application: {
    id: number;
    status: string;
    applied_at: string;
  } | null;
}

import { UploadInternshipForm } from "../UploadInternshipForm";

// ... existing code ...

export function InternshipDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [internship, setInternship] = useState<Internship | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasResume, setHasResume] = useState(false);

  // Get user from localStorage
  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem("currentUser");
      if (userStr) {
        return JSON.parse(userStr);
      }
      return null;
    } catch {
      return null;
    }
  };

  const currentUser = getCurrentUser();

  useEffect(() => {
    if (id) {
      fetchData(parseInt(id));
    }
  }, [id]);

  const fetchData = async (internshipId: number) => {
    try {
      setLoading(true);

      // 1. Fetch Internship
      const internshipRes = await internshipAPI.getInternship(internshipId);
      if (internshipRes.success) {
        setInternship(internshipRes.internship);
      } else {
        setError(internshipRes.error || "Failed to load internship details");
      }

      if (currentUser) {
        const userId = currentUser.user?.id || currentUser.id;

        // 2. Check Application Status
        const appRes = await applicationAPI.getByUser();
        if (appRes.success && Array.isArray(appRes.data)) {
          const foundApp = appRes.data.find((app: any) => app.internship_id === internshipId);
          setApplicationStatus({
            hasApplied: !!foundApp,
            application: foundApp || null
          });
        }

        // 3. Check Bookmark Status
        try {
          // Optimized: Assuming we have an API or just fetch all saved
          const savedRes = await savedInternshipAPI.getByUser();
          if (savedRes.success && Array.isArray(savedRes.saved_internships)) {
            const isSaved = savedRes.saved_internships.some((item: any) => item.id === internshipId);
            setIsBookmarked(isSaved);
          }
        } catch (e) { console.error(e); }

        // 4. Check if user has a resume
        try {
          const resumeRes = await resumeAPI.getByUser();
          if (resumeRes.success && (resumeRes.resume || (resumeRes.resumes && resumeRes.resumes.length > 0))) {
            setHasResume(true);
          }
        } catch (e) {
          setHasResume(false);
        }
      }

    } catch (err) {
      setError("Failed to fetch details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!currentUser) {
      navigate("/signin");
      return;
    }

    if (!hasResume) {
      if (confirm("You need a resume to apply. Would you like to build one now?")) {
        navigate("/resume-builder");
      }
      return;
    }

    setShowApplyModal(true);
  };

  const handleApplySuccess = () => {
    if (id && currentUser) {
      // Re-fetch status
      fetchData(parseInt(id));
      alert("Application submitted successfully!");
    }
  };

  const handleBookmark = async () => {
    if (!currentUser) {
      navigate("/signin");
      return;
    }

    const userId = currentUser.user?.id || currentUser.id;
    const internshipId = parseInt(id || "0");

    try {
      if (isBookmarked) {
        await savedInternshipAPI.unsave(internshipId);
        setIsBookmarked(false);
      } else {
        await savedInternshipAPI.save(internshipId);
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error("Bookmark error", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading internship details...</p>
        </div>
      </div>
    );
  }

  if (error || !internship) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <div className="text-red-400 text-xl mb-4">{error || "Internship not found"}</div>
          <Link to="/internships" className="text-cyan-400 hover:underline">
            ← Back to Internships
          </Link>
        </div>
      </div>
    );
  }

  // Use fetched internship data
  const internshipData = internship;

  return (
    <div className="min-h-screen bg-zinc-950">
      <SidebarMenu
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onPostInternship={() => {
          setIsSidebarOpen(false);
          setIsUploadOpen(true);
        }}
      />

      {/* Upload Internship Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in"
            onClick={() => setIsUploadOpen(false)}
          ></div>
          <div className="relative w-full max-w-2xl bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/10 max-h-[90vh] flex flex-col">
            <UploadInternshipForm onClose={() => setIsUploadOpen(false)} />
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {currentUser && (
        <ApplyModal
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          onSuccess={handleApplySuccess}
          internshipId={internshipData.id}
          userId={currentUser.user?.id || currentUser.id}
        />
      )}

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

            <Link
              to="/internships"
              className="text-gray-300 hover:text-cyan-400 transition-colors p-2"
            >
              <ArrowLeft size={24} />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link
            to="/internships"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            Back to Internships
          </Link>

          {/* Internship Header */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800/50 rounded-2xl p-8 border border-zinc-700 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold text-white">{internshipData.position}</h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${internshipData.status === 'Active'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }`}>
                    {internshipData.status}
                  </span>
                </div>
                <p className="text-2xl text-cyan-400 mb-4">{internshipData.company}</p>
              </div>
              <button
                onClick={handleBookmark}
                className={`p-3 rounded-lg transition-colors ${isBookmarked
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'bg-zinc-800 text-gray-500 hover:text-cyan-400'
                  }`}
                title={isBookmarked ? "Remove from Saved" : "Save Internship"}
              >
                <Bookmark size={24} fill={isBookmarked ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Key Details */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3 text-gray-300">
                <MapPin size={20} className="text-cyan-400" />
                <span>{internshipData.location}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Clock size={20} className="text-cyan-400" />
                <span>{internshipData.duration}</span>
                <span className="mx-2">•</span>
                <span className="text-green-400">{internshipData.type}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <DollarSign size={20} className="text-cyan-400" />
                <span className="text-white font-semibold">{internshipData.stipend}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Users size={20} className="text-cyan-400" />
                <span>{internshipData.applicant_count} applicants</span>
              </div>
            </div>

            {/* Required Skills */}
            {internshipData.required_skills && internshipData.required_skills.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {internshipData.required_skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Application Status & Apply Button */}
            {applicationStatus?.hasApplied ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle size={24} className="text-green-400" />
                  <div>
                    <p className="text-white font-semibold">Application Submitted</p>
                    <p className="text-gray-400 text-sm">
                      Status: <span className="text-green-400">{applicationStatus.application?.status}</span>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleApply}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 text-lg font-semibold shadow-lg shadow-cyan-500/25 transform hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <Briefcase size={20} />
                  Apply Now
                </button>
                {!hasResume && currentUser && (
                  <p className="text-yellow-500 text-sm text-center">
                    <AlertCircle className="inline w-4 h-4 mr-1" />
                    You need a resume to apply.
                    <Link to="/resume-builder" className="underline ml-1 hover:text-yellow-400">Build one now</Link>
                  </p>
                )}
              </div>
            )}

            {!currentUser && (
              <p className="text-center text-gray-400 text-sm mt-3">
                <button
                  onClick={() => navigate("/signin")}
                  className="text-cyan-400 hover:underline"
                >
                  Sign in
                </button>
                {" "}to apply for this internship
              </p>
            )}
          </div>

          {/* Description */}
          <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800 mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">Description</h2>
            <p className="text-gray-300 leading-relaxed whitespace-pre-line">
              {internshipData.description}
            </p>
          </div>

          {/* Requirements */}
          {internshipData.requirements && (
            <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800 mb-6">
              <h2 className="text-2xl font-bold text-white mb-4">Requirements</h2>
              <ul className="space-y-3">
                {internshipData.requirements.split('\n').map((req, index) => (
                  req.trim() && (
                    <li key={index} className="flex items-start gap-3 text-gray-300">
                      <CheckCircle size={20} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                      <span>{req.trim()}</span>
                    </li>
                  )
                ))}
              </ul>
            </div>
          )}

          {/* Responsibilities */}
          {internshipData.responsibilities && (
            <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800 mb-6">
              <h2 className="text-2xl font-bold text-white mb-4">Responsibilities</h2>
              <ul className="space-y-3">
                {internshipData.responsibilities.split('\n').map((resp, index) => (
                  resp.trim() && (
                    <li key={index} className="flex items-start gap-3 text-gray-300">
                      <CheckCircle size={20} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                      <span>{resp.trim()}</span>
                    </li>
                  )
                ))}
              </ul>
            </div>
          )}

          {/* Additional Info */}
          <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800">
            <h2 className="text-2xl font-bold text-white mb-4">Additional Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {internshipData.posted_date && (
                <div className="flex items-center gap-3 text-gray-300">
                  <Calendar size={20} className="text-cyan-400" />
                  <span>Posted: {new Date(internshipData.posted_date).toLocaleDateString()}</span>
                </div>
              )}
              {internshipData.deadline && (
                <div className="flex items-center gap-3 text-gray-300">
                  <Calendar size={20} className="text-cyan-400" />
                  <span>Deadline: {new Date(internshipData.deadline).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Similar Internships */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-4">Similar Internships</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link
                to="/internships"
                className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-cyan-500/50 transition-all group"
              >
                <p className="text-white font-semibold group-hover:text-cyan-400 transition-colors">
                  View All Internships
                </p>
                <p className="text-gray-400 text-sm">Browse more opportunities</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
