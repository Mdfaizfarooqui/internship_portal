import { useState, useEffect, useRef } from "react";
import { X, FileText, CheckCircle, AlertCircle, Loader2, UploadCloud } from "lucide-react";
import { applicationAPI, resumeAPI } from "../../../utils/api";

interface Resume {
  id: number;
  title: string;
  created_at: string;
  file_path?: string;
}

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  internshipId: number;
  userId: number;
}

export function ApplyModal({ isOpen, onClose, onSuccess, internshipId, userId }: ApplyModalProps) {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<number | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchResumes();
      setSelectedFile(null);
      setSelectedResume(null);
      setError(null);
    }
  }, [isOpen]);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const data = await resumeAPI.getByUser();
      if (data.success) {
        if (data.resumes) {
          setResumes(data.resumes);
        } else if (data.resume) {
          setResumes([data.resume]);
        }
      }
    } catch (err) {
      console.error("Error fetching resumes:", err);
      // Don't show error immediately, just log it. User can try to upload if fetch fails.
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

      if (!validTypes.includes(file.type)) {
        setError("Invalid file type. Please upload PDF or DOC/DOCX.");
        setSelectedFile(null);
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("File size too large. Max 5MB.");
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let resumeIdToSubmit = selectedResume;

    if (!selectedFile && !selectedResume) {
      setError("Please select a resume or upload a new one.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // 1. If uploaded file, first upload the file
      if (selectedFile) {
        const formData = new FormData();
        formData.append('title', selectedFile.name); // Use filename as title
        formData.append('resume_file', selectedFile);

        const uploadRes = await resumeAPI.uploadResumeFile(formData);

        if (uploadRes.success && uploadRes.id) {
          resumeIdToSubmit = uploadRes.id;
        } else {
          throw new Error(uploadRes.message || "Failed to upload resume.");
        }
      }

      // 2. Submit Application
      if (resumeIdToSubmit) {
        const data = await applicationAPI.create(internshipId, resumeIdToSubmit, coverLetter);

        if (data.success) {
          setSuccess(true);
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 2000);
        } else {
          setError(data.error || data.message || "Failed to submit application");
        }
      } else {
        throw new Error("Invalid resume ID.");
      }

    } catch (err: any) {
      setError(err.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl border border-zinc-700 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-700">
          <h2 className="text-xl font-bold text-white">Apply to Internship</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Application Submitted!</h3>
              <p className="text-gray-400">Your application has been successfully submitted.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-300">
                    Select Resume <span className="text-red-400">*</span>
                  </label>
                </div>

                {/* Options Grid */}
                <div className="space-y-4">
                  {/* Existing Resumes */}
                  {loading ? (
                    <div className="flex items-center gap-2 text-gray-400 py-4 justify-center">
                      <Loader2 size={20} className="animate-spin" />
                      <span>Loading resumes...</span>
                    </div>
                  ) : resumes.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-gray-400">Select a Saved Resume</p>
                      {resumes.map((resume) => (
                        <label
                          key={resume.id}
                          className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${!selectedFile && selectedResume === resume.id
                            ? "bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                            : "bg-zinc-800/50 border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800"
                            }`}
                          onClick={() => setSelectedFile(null)} // Clear file if resume selected
                        >
                          <input
                            type="radio"
                            name="resume"
                            value={resume.id}
                            checked={!selectedFile && selectedResume === resume.id}
                            onChange={() => setSelectedResume(resume.id)}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${!selectedFile && selectedResume === resume.id
                            ? "border-cyan-400 bg-cyan-400"
                            : "border-gray-600"
                            }`}>
                            {!selectedFile && selectedResume === resume.id && (
                              <div className="w-2 h-2 rounded-full bg-white transition-transform scale-100" />
                            )}
                          </div>
                          <FileText size={20} className={`${!selectedFile && selectedResume === resume.id ? "text-cyan-400" : "text-gray-500"}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium truncate ${!selectedFile && selectedResume === resume.id ? "text-white" : "text-gray-300"}`}>{resume.title}</p>
                            <p className="text-gray-500 text-xs">
                              {new Date(resume.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="py-4 px-4 bg-zinc-800/50 rounded-lg border border-zinc-700 text-center text-sm">
                      <p className="text-gray-400">No saved resumes found.</p>
                    </div>
                  )}

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-zinc-700"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-2 bg-zinc-900 text-sm text-gray-500">Or add new</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Upload Option */}
                    <div
                      className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed cursor-pointer transition-all h-32 text-center group ${selectedFile
                        ? "bg-cyan-500/10 border-cyan-500/50"
                        : "bg-zinc-800/30 border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/50"
                        }`}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                      />
                      <div className={`p-2 rounded-full transition-colors ${selectedFile ? "bg-cyan-500/20 text-cyan-400" : "bg-zinc-700/50 text-gray-400 group-hover:text-gray-300"}`}>
                        <UploadCloud size={24} />
                      </div>
                      <div className="flex-1 w-full min-w-0">
                        <p className={`font-medium text-sm truncate ${selectedFile ? "text-white" : "text-gray-300"}`}>
                          {selectedFile ? selectedFile.name : "Upload CV"}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : "PDF, DOC (Max 5MB)"}
                        </p>
                      </div>
                      {selectedFile && (
                        <div className="absolute top-2 right-2 text-cyan-400">
                          <CheckCircle size={16} />
                        </div>
                      )}
                    </div>

                    {/* Resume Builder Link */}
                    <a
                      href="/resume-builder"
                      className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-zinc-700 bg-zinc-800/30 hover:bg-zinc-800/50 hover:border-cyan-500/50 transition-all h-32 text-center group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="p-2 rounded-full bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
                        <FileText size={24} />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-white group-hover:text-cyan-400 transition-colors">Resume Builder</p>
                        <p className="text-gray-500 text-xs mt-1">Create a professional CV</p>
                      </div>
                    </a>
                  </div>
                </div>
              </div>

              {/* Cover Letter (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cover Letter (Optional)
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Tell us why you're interested in this internship..."
                  rows={4}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg animate-in fade-in slide-in-from-top-2">
                  <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-700">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || (!selectedFile && !selectedResume)}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>{selectedFile ? 'Uploading & Applying...' : 'Applying...'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      <span>Submit Application</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

