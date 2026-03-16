import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, Send, CheckCircle, AlertCircle } from "lucide-react";
import { authAPI } from "../../../utils/api";

export function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const res = await authAPI.forgotPassword(email);
            if (res.success) {
                setSuccess(res.message);
                // If debug OTP is present (local dev), show it
                if (res.debug_otp) {
                    alert(`DEBUG: Your OTP is ${res.debug_otp}`);
                }

                // Navigate to reset password page after a brief delay
                setTimeout(() => {
                    navigate("/reset-password", { state: { email } });
                }, 1500);

            } else {
                setError(res.message || "Failed to send OTP.");
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl p-8 relative z-10">
                <div className="mb-8">
                    <Link to="/signin" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-6 text-sm">
                        <ArrowLeft size={16} className="mr-2" /> Back to Sign In
                    </Link>
                    <h1 className="text-3xl font-bold text-white mb-2">Forgot Password?</h1>
                    <p className="text-gray-400">Enter your email address to receive a one-time password (OTP) to reset your account.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3 text-red-400 text-sm">
                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-3 text-green-400 text-sm">
                        <CheckCircle size={18} className="mt-0.5 shrink-0" />
                        <span>{success} Redirecting...</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-10 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            "Sending OTP..."
                        ) : (
                            <>
                                Send OTP <Send size={18} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
