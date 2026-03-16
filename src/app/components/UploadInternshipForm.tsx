import { useState } from "react";
import { internshipAPI } from "../../utils/api";
import { X, Upload, CheckCircle, AlertCircle, Briefcase, MapPin, Clock, DollarSign, Building, FileText, List } from "lucide-react";

interface UploadInternshipFormProps {
    onClose: () => void;
}

export function UploadInternshipForm({ onClose }: UploadInternshipFormProps) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        company: "",
        location: "",
        type: "Full-time",
        description: "",
        requirements: "",
        duration: "",
        stipend: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Validation
            if (!formData.title || !formData.company) {
                throw new Error("Please fill in all required fields.");
            }

            // Convert requirements to list of skills (simple line/comma split)
            const requiredSkills = formData.requirements
                ? formData.requirements.split(/[\n,]+/).map(s => s.trim()).filter(s => s.length > 0)
                : [];

            const payload = {
                position: formData.title,
                company: formData.company,
                location: formData.location,
                type: formData.type,
                description: formData.description,
                requirements: formData.requirements,
                duration: formData.duration,
                stipend: formData.stipend,
                requiredSkills: requiredSkills
            };

            const result = await internshipAPI.createInternship(payload);

            // Handle both structure types { success: true, ... } or just the object
            // Just assume success if no error thrown by apiCall, or check property if your API returns it
            if (result && result.success) {
                setSuccess(true);
                setTimeout(() => {
                    onClose();
                    setSuccess(false);
                    setFormData({
                        title: "",
                        company: "",
                        location: "",
                        type: "Full-time",
                        description: "",
                        requirements: "",
                        duration: "",
                        stipend: "",
                    })
                }, 2000);
            } else {
                if (result && result.error) throw new Error(result.error);
                // If success is missing but no error, it might be success (check your backend)
                // But our backend returns { success: true, ... }
                throw new Error("Failed to create internship");
            }

        } catch (err: any) {
            console.error("Upload error:", err);
            setError(err.message || "Failed to upload internship. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle size={40} className="text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Submitted!</h3>
                <p className="text-gray-400 mb-8 max-w-xs">
                    Your internship is submitted.
                </p>
                <button
                    onClick={onClose}
                    className="bg-zinc-800 text-white px-8 py-3 rounded-xl hover:bg-zinc-700 transition-colors"
                >
                    Close
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-zinc-900/95 backdrop-blur-xl w-full min-h-0">

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-zinc-900/50">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Upload size={24} className="text-cyan-400" />
                        Post Internship
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Share a new opportunity with talents</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <form id="upload-internship-form" onSubmit={handleSubmit} className="space-y-6">

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle size={20} className="shrink-0 mt-0.5" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Title & Company */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <Briefcase size={16} className="text-cyan-400" />
                                    Job Title <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Frontend Developer Intern"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <Building size={16} className="text-cyan-400" />
                                    Company Name <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleChange}
                                    placeholder="e.g. TechCorp"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Location & Type */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <MapPin size={16} className="text-cyan-400" />
                                    Location <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="e.g. Remote, San Francisco"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <Clock size={16} className="text-cyan-400" />
                                    Employment Type
                                </label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all appearance-none"
                                >
                                    <option value="Full-time" className="bg-zinc-900">Full-time</option>
                                    <option value="Part-time" className="bg-zinc-900">Part-time</option>
                                    <option value="Remote" className="bg-zinc-900">Remote</option>
                                    <option value="Contract" className="bg-zinc-900">Contract</option>
                                </select>
                            </div>
                        </div>

                        {/* Duration & Stipend */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <Clock size={16} className="text-cyan-400" />
                                    Duration
                                </label>
                                <input
                                    type="text"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    placeholder="e.g. 3 months"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <DollarSign size={16} className="text-cyan-400" />
                                    Stipend
                                </label>
                                <input
                                    type="text"
                                    name="stipend"
                                    value={formData.stipend}
                                    onChange={handleChange}
                                    placeholder="e.g. $2000/month, Unpaid"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <FileText size={16} className="text-cyan-400" />
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Describe the role and responsibilities..."
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all resize-none"
                            />
                        </div>

                        {/* Requirements */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <List size={16} className="text-cyan-400" />
                                Requirements
                            </label>
                            <textarea
                                name="requirements"
                                value={formData.requirements}
                                onChange={handleChange}
                                rows={4}
                                placeholder="List the required skills and qualifications..."
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all resize-none"
                            />
                        </div>

                        {/* Action Buttons - Inside scrollable area */}
                        <div className="pt-6 border-t border-white/10 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-medium border border-white/5"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-2.5 rounded-xl font-medium hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        Posting...
                                    </>
                                ) : (
                                    <>
                                        Submit Internship
                                        <Upload size={18} />
                                    </>
                                )}
                            </button>
                        </div>

                    </div>
                </form>
            </div>
        </div>
    );
}
