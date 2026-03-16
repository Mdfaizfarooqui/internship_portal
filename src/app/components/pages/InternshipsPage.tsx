import { MapPin, Clock, DollarSign, Bookmark, Menu, Search, Filter, Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UploadInternshipForm } from "../UploadInternshipForm";
import { SidebarMenu } from "../SidebarMenu";
import { internshipAPI, savedInternshipAPI } from "../../../utils/api";

interface Internship {
  id: number;
  company: string;
  position: string;
  location: string;
  duration: string;
  stipend: string;
  type: string;
  required_skills: string[];
  applicant_count: number;
  posted_date: string;
  status: string;
  logo?: string;
  tags?: string[];
  applicants?: number;
  postedDate?: string;
}

export function InternshipsPage() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    location: "",
    type: "",
    duration: ""
  });
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookmarkError, setBookmarkError] = useState<string | null>(null);

  // State for saved internships
  const [savedInternshipIds, setSavedInternshipIds] = useState<Set<number>>(new Set());
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchInternships();
  }, []);

  // Fetch saved internships when user is loaded
  useEffect(() => {
    if (user) {
      fetchSavedInternships();
    }
  }, [user]);

  const fetchSavedInternships = async () => {
    try {
      const userId = user.user?.id || user.id;
      if (!userId) return;

      const res = await savedInternshipAPI.getByUser();
      if (res.success && Array.isArray(res.saved_internships)) {
        const ids = new Set<number>(res.saved_internships.map((item: any) => Number(item.id)));
        setSavedInternshipIds(ids);
      }
    } catch (err) {
      console.error("Error fetching saved internships:", err);
    }
  };

  const handleToggleSave = async (internshipId: number, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if button is inside a Link (though here it's absolute)
    e.stopPropagation();

    if (!user) {
      alert("Please sign in to save internships.");
      navigate("/signin");
      return;
    }

    const userId = user.user?.id || user.id;
    const isSaved = savedInternshipIds.has(internshipId);

    try {
      // Optimistic update
      setSavedInternshipIds(prev => {
        const newSet = new Set(prev);
        if (isSaved) {
          newSet.delete(internshipId);
        } else {
          newSet.add(internshipId);
        }
        return newSet;
      });

      if (isSaved) {
        await savedInternshipAPI.unsave(internshipId);
      } else {
        await savedInternshipAPI.save(internshipId);
      }
    } catch (error) {
      console.error("Error toggling save:", error);
      setBookmarkError("Failed to save internship. Please try again.");
      setTimeout(() => setBookmarkError(null), 3000);
      // Revert on error
      fetchSavedInternships();
    }
  };

  const fetchInternships = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await internshipAPI.getActiveInternships();

      if (data.success && data.internships) {
        // Add logo based on company for visual appeal and map API fields
        const internshipsWithLogo = data.internships.map((internship: any, index: number) => ({
          ...internship,
          required_skills: internship.requiredSkills || internship.required_skills || [], // Handle both cases
          logo: getCompanyLogo(internship.company),
        }));
        setInternships(internshipsWithLogo);
      } else {
        // Fallback to static data if API fails
        setInternships(getStaticInternships());
      }
    } catch (err) {
      console.error("Error fetching internships:", err);
      setError("Failed to load internships");
      // Fallback to static data
      setInternships(getStaticInternships());
    } finally {
      setLoading(false);
    }
  };

  const getCompanyLogo = (company: string) => {
    const logos: { [key: string]: string } = {
      'TechCorp': '🚀',
      'DataFlow Inc': '📊',
      'DesignHub': '🎨',
      'MarketGenius': '📈',
      'CloudNet': '☁️',
      'MobileTech': '📱',
      'FinanceHub': '💰',
      'GameDev Studios': '🎮',
      'HealthTech': '🏥',
    };
    return logos[company] || '💼';
  };

  const getStaticInternships = (): Internship[] => [
    {
      id: 1,
      company: "TechCorp",
      logo: "🚀",
      position: "Software Engineering Intern",
      location: "San Francisco, CA",
      duration: "3 months",
      stipend: "₹20,000/month",
      type: "Full-time",
      required_skills: ["React", "Node.js", "AWS"],
      applicant_count: 124,
      posted_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: "Active",
    },
    {
      id: 2,
      company: "DataFlow Inc",
      logo: "📊",
      position: "Data Science Intern",
      location: "New York, NY",
      duration: "6 months",
      stipend: "₹25,000/month",
      type: "Full-time",
      required_skills: ["Python", "ML", "SQL"],
      applicant_count: 89,
      posted_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: "Active",
    },
    {
      id: 3,
      company: "DesignHub",
      logo: "🎨",
      position: "UI/UX Design Intern",
      location: "Remote",
      duration: "4 months",
      stipend: "₹15,000/month",
      type: "Part-time",
      required_skills: ["Figma", "Adobe XD", "Prototyping"],
      applicant_count: 156,
      posted_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: "Active",
    },
    {
      id: 4,
      company: "MarketGenius",
      logo: "📈",
      position: "Digital Marketing Intern",
      location: "Austin, TX",
      duration: "3 months",
      stipend: "₹12,000/month",
      type: "Full-time",
      required_skills: ["SEO", "Social Media", "Analytics"],
      applicant_count: 67,
      posted_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: "Active",
    },
    {
      id: 5,
      company: "CloudNet",
      logo: "☁️",
      position: "Cloud Infrastructure Intern",
      location: "Seattle, WA",
      duration: "6 months",
      stipend: "₹22,000/month",
      type: "Full-time",
      required_skills: ["AWS", "Docker", "Kubernetes"],
      applicant_count: 92,
      posted_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: "Active",
    },
    {
      id: 6,
      company: "MobileTech",
      logo: "📱",
      position: "Mobile Development Intern",
      location: "Boston, MA",
      duration: "4 months",
      stipend: "₹18,000/month",
      type: "Full-time",
      required_skills: ["React Native", "iOS", "Android"],
      applicant_count: 103,
      posted_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      status: "Active",
    },
    {
      id: 7,
      company: "FinanceHub",
      logo: "💰",
      position: "Financial Analysis Intern",
      location: "Chicago, IL",
      duration: "6 months",
      stipend: "₹17,000/month",
      type: "Full-time",
      required_skills: ["Excel", "Finance", "Analytics"],
      applicant_count: 78,
      posted_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: "Active",
    },
    {
      id: 8,
      company: "GameDev Studios",
      logo: "🎮",
      position: "Game Development Intern",
      location: "Los Angeles, CA",
      duration: "5 months",
      stipend: "₹20,000/month",
      type: "Full-time",
      required_skills: ["Unity", "C#", "3D Modeling"],
      applicant_count: 145,
      posted_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: "Active",
    },
    {
      id: 9,
      company: "HealthTech",
      logo: "🏥",
      position: "Healthcare IT Intern",
      location: "Remote",
      duration: "4 months",
      stipend: "$2,100/month",
      type: "Part-time",
      required_skills: ["HIPAA", "HL7", "Healthcare"],
      applicant_count: 56,
      posted_date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      status: "Active",
    },
  ];

  const formatPostedDate = (dateString: string) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Recently";

    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return "1 week ago";
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const filteredInternships = internships.filter((internship) => {
    const searchLower = searchQuery.toLowerCase();
    const matchSearch =
      (internship.position?.toLowerCase() || "").includes(searchLower) ||
      (internship.company?.toLowerCase() || "").includes(searchLower) ||
      (internship.required_skills?.some(skill => skill.toLowerCase().includes(searchLower)) ?? false) ||
      (internship.location?.toLowerCase() || "").includes(searchLower);

    const matchLocation = !filters.location || (internship.location?.toLowerCase() || "").includes(filters.location.toLowerCase());
    const matchType = !filters.type || (internship.type?.toLowerCase() || "") === filters.type.toLowerCase();
    const matchDuration = !filters.duration || (internship.duration?.toLowerCase() || "").includes(filters.duration.split(' ')[0].toLowerCase());

    return matchSearch && matchLocation && matchType && matchDuration;
  });

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

      {/* Header with Menu Button */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="relative z-50 p-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-lg border border-white/20"
              aria-label="Open Menu"
              style={{ minWidth: '40px', minHeight: '40px' }}
            >
              {/* Raw SVG to ensure visibility */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </button>



            <div className="text-2xl font-bold">
              <span className="text-white">Intern</span>
              <span className="text-cyan-400">Hub</span>
            </div>

            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <section className="py-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Browse <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Internships</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl">
              Explore thousands of internship opportunities from top companies around the world.
            </p>
          </section>

          {/* Search and Filter */}
          <section className="mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search internships, companies, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-6 py-3 border rounded-lg transition-all ${showFilters
                  ? "bg-cyan-500/10 border-cyan-500 text-cyan-400"
                  : "bg-zinc-900 border-zinc-700 text-gray-300 hover:bg-zinc-800"}`}
              >
                <Filter size={20} />
                <span>Filters</span>
              </button>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl animate-in fade-in slide-in-from-top-2">

                {/* Location Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Location</label>
                  <select
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                  >
                    <option value="" className="bg-zinc-900">All Locations</option>
                    <option value="Remote" className="bg-zinc-900">Remote</option>
                    <option value="San Francisco, CA" className="bg-zinc-900">San Francisco</option>
                    <option value="New York, NY" className="bg-zinc-900">New York</option>
                    <option value="Seattle, WA" className="bg-zinc-900">Seattle</option>
                    <option value="Bengaluru" className="bg-zinc-900">Bengaluru</option>
                  </select>
                </div>

                {/* Type Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Employment Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                  >
                    <option value="" className="bg-zinc-900">All Types</option>
                    <option value="Full-time" className="bg-zinc-900">Full-time</option>
                    <option value="Part-time" className="bg-zinc-900">Part-time</option>
                    <option value="Contract" className="bg-zinc-900">Contract</option>
                    <option value="Internship" className="bg-zinc-900">Internship</option>
                  </select>
                </div>

                {/* Duration Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Duration</label>
                  <select
                    value={filters.duration}
                    onChange={(e) => setFilters(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                  >
                    <option value="" className="bg-zinc-900">Any Duration</option>
                    <option value="1 month" className="bg-zinc-900">1 Month</option>
                    <option value="3 months" className="bg-zinc-900">3 Months</option>
                    <option value="6 months" className="bg-zinc-900">6 Months</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="md:col-span-3 flex justify-end">
                  <button
                    onClick={() => setFilters({ location: "", type: "", duration: "" })}
                    className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>

              </div>
            )}
          </section>

          {/* Results Count */}
          <div className="mb-6">
            {loading ? (
              <div className="flex items-center gap-2 text-gray-400">
                <Loader2 size={20} className="animate-spin" />
                <span>Loading internships...</span>
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            ) : (
              <p className="text-gray-400">
                Showing <span className="text-white font-semibold">{filteredInternships.length}</span> internship opportunities
              </p>
            )}
          </div>

          {/* Internships Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 size={48} className="animate-spin text-cyan-400 mx-auto mb-4" />
                <p className="text-gray-400">Loading internships...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={fetchInternships}
                  className="text-cyan-400 hover:underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : filteredInternships.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <p className="text-gray-400 mb-4">No internships found matching your search.</p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-cyan-400 hover:underline"
                >
                  Clear Search
                </button>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInternships.map((internship) => (
                <div
                  key={internship.id}
                  className="group relative bg-gradient-to-br from-zinc-900 to-zinc-800/50 rounded-xl p-6 border border-zinc-700 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1"
                >
                  {/* Bookmark Icon */}
                  <button
                    onClick={(e) => handleToggleSave(internship.id, e)}
                    className={`absolute top-4 right-4 transition-colors ${savedInternshipIds.has(internship.id) ? "text-cyan-400" : "text-gray-500 hover:text-cyan-400"}`}
                  >
                    <Bookmark size={20} fill={savedInternshipIds.has(internship.id) ? "currentColor" : "none"} />
                  </button>

                  {/* Company Logo */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center text-3xl border border-cyan-500/20">
                      {internship.logo || '💼'}
                    </div>
                    <div className="flex-1">
                      <Link to={`/internships/${internship.id}`}>
                        <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-2 cursor-pointer">
                          {internship.position}
                        </h3>
                      </Link>
                      <p className="text-gray-400 text-sm">{internship.company}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <MapPin size={16} className="text-cyan-400" />
                      <span>{internship.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Clock size={16} className="text-cyan-400" />
                      <span>{internship.duration}</span>
                      <span className="mx-2">•</span>
                      <span className="text-green-400">{internship.type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <DollarSign size={16} className="text-cyan-400" />
                      <span className="text-white font-semibold">{internship.stipend}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {internship.required_skills && internship.required_skills.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full text-xs border border-cyan-500/20"
                      >
                        {tag}
                      </span>
                    ))}
                    {internship.required_skills && internship.required_skills.length > 3 && (
                      <span className="px-3 py-1 bg-zinc-800 text-gray-400 rounded-full text-xs border border-zinc-700">
                        +{internship.required_skills.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-700">
                    <div className="text-gray-400 text-xs">
                      <div>{internship.applicant_count} applicants</div>
                      <div className="text-gray-500">Posted {formatPostedDate(internship.posted_date)}</div>
                    </div>
                    <Link to={`/internships/${internship.id}`}>
                      <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105">
                        View Details
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More */}
          {!loading && !error && filteredInternships.length > 0 && (
            <div className="text-center mt-12">
              <button className="border border-cyan-500/50 text-cyan-400 px-8 py-3 rounded-lg hover:bg-cyan-500/10 transition-all duration-200">
                Load More Internships
              </button>
            </div>
          )}
        </div>
      </div>
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

      {/* Bookmark Error Toast */}
      {bookmarkError && (
        <div className="fixed bottom-4 right-4 z-50 bg-zinc-900 border border-red-500/50 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <AlertCircle className="text-red-400" size={20} />
          <p className="text-sm font-medium">{bookmarkError}</p>
        </div>
      )}
    </div>
  );
}

