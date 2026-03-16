import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./components/pages/HomePage";
import { AboutUs } from "./components/pages/AboutUs";
import { ContactUs } from "./components/pages/ContactUs";
import { InternshipsPage } from "./components/pages/InternshipsPage";
import { InternshipDetailPage } from "./components/pages/InternshipDetailPage";
import { ResumeBuilderPage } from "./components/pages/ResumeBuilderPage";
import { SkillGapAnalysisPage } from "./components/pages/SkillGapAnalysisPage";
import { ResumeScorePage } from "./components/pages/ResumeScorePage";
import { SignUp } from "./components/pages/SignUp";
import { SignIn } from "./components/pages/SignIn";
import { ProfilePage } from "./components/pages/ProfilePage";
import { ForgotPasswordPage } from "./components/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./components/pages/ResetPasswordPage";
import { RecruiterDashboard } from "./components/pages/RecruiterDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/internships" element={<InternshipsPage />} />
        <Route path="/internships/:id" element={<InternshipDetailPage />} />
        <Route path="/resume-builder" element={<ResumeBuilderPage />} />
        <Route path="/skill-gap-analysis" element={<SkillGapAnalysisPage />} />
        <Route path="/resume-score" element={<ResumeScorePage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/recruiter-dashboard" element={<RecruiterDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}