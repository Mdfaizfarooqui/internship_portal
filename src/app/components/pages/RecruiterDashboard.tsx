import { useState, useEffect } from "react";
import { SidebarMenu } from "../SidebarMenu";
import { Menu, Plus, Edit, Trash2, Users, FileText, CheckCircle, XCircle } from "lucide-react";
import { internshipAPI, applicationAPI } from "../../../utils/api";
import { useNavigate } from "react-router-dom";

export function RecruiterDashboard() {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [internships, setInternships] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Post Modal States
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editInternshipId, setEditInternshipId] = useState<number | null>(null);

    // Applicants Modal States
    const [isApplicantsModalOpen, setIsApplicantsModalOpen] = useState(false);
    const [selectedInternship, setSelectedInternship] = useState<any>(null);
    const [applicants, setApplicants] = useState<any[]>([]);
    const [loadingApplicants, setLoadingApplicants] = useState(false);

    const [postFormData, setPostFormData] = useState({
        company: "",
        position: "",
        description: "",
        location: "",
        duration: "",
        stipend: "",
        type: "On-site",
        requirements: "",
        responsibilities: "",
        requiredSkills: [] as string[]
    });

    useEffect(() => {
        fetchInternships();
    }, []);

    const fetchInternships = async () => {
        const storedUser = localStorage.getItem("currentUser");
        if (!storedUser) {
            navigate("/signin");
            return;
        }
        const user = JSON.parse(storedUser).user || JSON.parse(storedUser);

        try {
            const res = await internshipAPI.getByRecruiter();
            if (res.success) {
                setInternships(res.internships);
            }
        } catch (error) {
            console.error("Failed to fetch recruiter internships", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        setIsPostModalOpen(false);
        setIsEditing(false);
        setEditInternshipId(null);
        setPostFormData({
            company: "", position: "", description: "", location: "", duration: "", stipend: "", type: "On-site", requirements: "", responsibilities: "", requiredSkills: []
        });
    };

    const handleEditClick = (internship: any) => {
        setIsEditing(true);
        setEditInternshipId(internship.id);
        setPostFormData({
            company: internship.company || "",
            position: internship.position || "",
            description: internship.description || "",
            location: internship.location || "",
            duration: internship.duration || "",
            stipend: internship.stipend || "",
            type: internship.type || "On-site",
            requirements: internship.requirements || "",
            responsibilities: internship.responsibilities || "",
            requiredSkills: internship.required_skills ? internship.required_skills.join(", ") : ""
        });
        setIsPostModalOpen(true);
    };

    const handleDeleteInternship = async (internshipId: number) => {
        if (!confirm("Are you sure you want to delete this internship?")) return;
        const storedUser = localStorage.getItem("currentUser");
        const user = storedUser ? JSON.parse(storedUser).user || JSON.parse(storedUser) : null;
        if (!user) return;
        try {
            const res = await internshipAPI.deleteInternship(internshipId);
            if (res.success) fetchInternships();
            else alert("Failed to delete: " + res.message);
        } catch (error) {
            console.error(error);
        }
    };

    const handleViewApplicants = async (internship: any) => {
        setSelectedInternship(internship);
        setIsApplicantsModalOpen(true);
        setLoadingApplicants(true);
        try {
            const res = await applicationAPI.getByInternship(internship.id);
            if (res.success) {
                setApplicants(res.applications || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingApplicants(false);
        }
    };

    const handleUpdateApplicantStatus = async (applicationId: number, status: string) => {
        try {
            const res = await applicationAPI.updateStatus(applicationId, status);
            if (res.success) {
                setApplicants(applicants.map(app => app.id === applicationId ? { ...app, status } : app));
            } else {
                alert("Failed to update status.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handlePostInternship = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const storedUser = localStorage.getItem("currentUser");
        const user = storedUser ? JSON.parse(storedUser).user || JSON.parse(storedUser) : null;
        if (!user) return;

        // Convert comma separated string to array if needed (simple way, can be improved)
        const skillsArray = typeof postFormData.requiredSkills === 'string'
            ? (postFormData.requiredSkills as string).split(',').map(s => s.trim()).filter(Boolean)
            : postFormData.requiredSkills;

        const payload = { ...postFormData, requiredSkills: skillsArray };

        try {
            let res;
            if (isEditing && editInternshipId) {
                res = await internshipAPI.updateInternship({ ...payload, id: editInternshipId });
            } else {
                res = await internshipAPI.createInternship(payload);
            }

            if (res.success) {
                handleCloseModal();
                fetchInternships();
            } else {
                alert("Failed to save: " + res.message);
            }
        } catch (error) {
            console.error("Post internship error", error);
            alert("An error occurred while saving.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-cyan-500/30">
            <SidebarMenu
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onPostInternship={() => setIsPostModalOpen(true)}
            />

            <div className="flex-1 lg:pl-80 transition-all duration-300">
                <header className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 p-4 lg:p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="text-xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Recruiter Dashboard
                        </h1>
                    </div>
                    <button onClick={() => setIsPostModalOpen(true)} className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition-colors font-medium">
                        <Plus size={18} />
                        <span className="hidden sm:inline">Post Internship</span>
                    </button>
                </header>

                <main className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold">Your Postings</h2>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-12 h-12 border-4 border-zinc-800 border-t-cyan-500 rounded-full animate-spin"></div>
                            <p className="mt-4 text-gray-400">Loading your posts...</p>
                        </div>
                    ) : internships.length > 0 ? (
                        <div className="grid gap-6">
                            {internships.map((internship) => (
                                <div key={internship.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
                                    <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
                                        <div>
                                            <h3 className="text-xl font-bold">{internship.position}</h3>
                                            <p className="text-cyan-400 font-medium">{internship.company}</p>
                                            <div className="flex gap-4 mt-2 text-sm text-gray-400">
                                                <span>{internship.location}</span>
                                                <span>•</span>
                                                <span>{internship.type}</span>
                                                <span>•</span>
                                                <span>{internship.applicantCount || 0} Applicants</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleViewApplicants(internship)} className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-gray-300 rounded-lg transition-colors text-sm">
                                                <Users size={16} /> View Applicants
                                            </button>
                                            <button onClick={() => handleEditClick(internship)} className="p-2 text-gray-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => handleDeleteInternship(internship.id)} className="p-2 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                            <h3 className="text-xl font-medium text-white mb-2">No active postings</h3>
                            <p className="text-gray-400 mb-6">You haven't posted any internships yet.</p>
                            <button onClick={() => setIsPostModalOpen(true)} className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                                Create First Posting
                            </button>
                        </div>
                    )}
                </main>
            </div>

            {/* Post Internship Modal */}
            {isPostModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-zinc-900 w-full max-w-2xl rounded-2xl border border-zinc-800 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setIsPostModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                            <XCircle size={24} />
                        </button>
                        <h2 className="text-2xl font-bold text-white mb-6">
                            {isEditing ? "Edit Internship" : "Post New Internship"}
                        </h2>

                        <form onSubmit={handlePostInternship} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Company Name</label>
                                    <input type="text" required value={postFormData.company} onChange={(e) => setPostFormData({ ...postFormData, company: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Position / Title</label>
                                    <input type="text" required value={postFormData.position} onChange={(e) => setPostFormData({ ...postFormData, position: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Location</label>
                                    <input type="text" required value={postFormData.location} onChange={(e) => setPostFormData({ ...postFormData, location: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Type</label>
                                    <select value={postFormData.type} onChange={(e) => setPostFormData({ ...postFormData, type: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none">
                                        <option value="On-site">On-site</option>
                                        <option value="Hybrid">Hybrid</option>
                                        <option value="Remote">Remote</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Stipend (e.g. ₹10000/month)</label>
                                    <input type="text" value={postFormData.stipend} onChange={(e) => setPostFormData({ ...postFormData, stipend: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Duration (e.g. 3 Months)</label>
                                    <input type="text" value={postFormData.duration} onChange={(e) => setPostFormData({ ...postFormData, duration: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Required Skills (comma separated)</label>
                                <input type="text" required value={postFormData.requiredSkills} onChange={(e) => setPostFormData({ ...postFormData, requiredSkills: e.target.value as any })} placeholder="e.g. React, Node.js, Python" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                                <textarea rows={3} value={postFormData.description} onChange={(e) => setPostFormData({ ...postFormData, description: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none"></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Responsibilities</label>
                                <textarea rows={3} value={postFormData.responsibilities} onChange={(e) => setPostFormData({ ...postFormData, responsibilities: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none"></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Requirements</label>
                                <textarea rows={3} value={postFormData.requirements} onChange={(e) => setPostFormData({ ...postFormData, requirements: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none"></textarea>
                            </div>

                            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-zinc-800">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-6 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-zinc-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-lg transition-colors font-medium disabled:opacity-50"
                                >
                                    {isSaving ? "Saving..." : (isEditing ? "Save Changes" : "Post Internship")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Applicants Modal */}
            {isApplicantsModalOpen && selectedInternship && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-zinc-900 w-full max-w-4xl rounded-2xl border border-zinc-800 shadow-2xl p-6 relative max-h-[90vh] flex flex-col">
                        <button
                            onClick={() => setIsApplicantsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                            <XCircle size={24} />
                        </button>
                        <h2 className="text-2xl font-bold text-white mb-2">Applicants</h2>
                        <p className="text-gray-400 mb-6 font-medium">{selectedInternship.position} at {selectedInternship.company}</p>

                        <div className="flex-1 overflow-y-auto pr-2">
                            {loadingApplicants ? (
                                <div className="py-20 flex justify-center"><div className="w-8 h-8 border-4 border-zinc-800 border-t-cyan-500 rounded-full animate-spin"></div></div>
                            ) : applicants.length > 0 ? (
                                <div className="space-y-4">
                                    {applicants.map(app => (
                                        <div key={app.id} className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                                            <div>
                                                <h4 className="font-bold text-lg text-white">{app.full_name || "Applicant"}</h4>
                                                <p className="text-sm text-gray-400">{app.email} • {app.phone}</p>
                                                <p className="text-sm text-gray-400 mt-1">Applied on: {new Date(app.applied_at).toLocaleDateString()}</p>
                                                {app.notes && <p className="text-sm text-gray-300 mt-2 bg-zinc-900 p-2 rounded border border-zinc-800">Cover Letter: {app.notes}</p>}
                                                <p className="mt-2 text-sm">
                                                    Status: <span className={`px-2 py-1 rounded text-xs font-bold ${app.status === 'Shortlisted' ? 'bg-green-500/20 text-green-400' :
                                                        app.status === 'Rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                                                        }`}>{app.status || 'Pending'}</span>
                                                </p>
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                                                {app.resume_url && (
                                                    <button onClick={() => window.open((app.resume_url.startsWith('http') || app.resume_url.startsWith('/')) ? app.resume_url : '/' + app.resume_url, '_blank')} className="flex items-center justify-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm">
                                                        <FileText size={16} /> Resume
                                                    </button>
                                                )}
                                                <button onClick={() => handleUpdateApplicantStatus(app.id, 'Shortlisted')} className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors text-sm">
                                                    <CheckCircle size={16} /> Shortlist
                                                </button>
                                                <button onClick={() => handleUpdateApplicantStatus(app.id, 'Rejected')} className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-sm">
                                                    <XCircle size={16} /> Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-400 py-10">No applicants yet for this position.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
