import { ImageWithFallback } from "./common/ImageWithFallback";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-blue-950/20"></div>

      {/* Animated circles */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-block">
              <span className="bg-cyan-500/10 text-cyan-400 px-4 py-2 rounded-full text-sm border border-cyan-500/20">
                🎓 Your Future Starts Here
              </span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-white">From </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Classroom
              </span>
              <br />
              <span className="text-white">to </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
                Career
              </span>
              <br />
              <span className="text-gray-300 text-4xl lg:text-5xl">
                Start Your Internship Journey
              </span>
            </h1>

            <p className="text-gray-400 text-lg max-w-xl">
              Bridge the gap between education and employment. Connect with top companies
              and launch your professional career with opportunities tailored for students.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/internships"
                className="group bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25"
              >
                Explore Internships
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
              <Link
                to="/about"
                className="border border-cyan-500/50 text-cyan-400 px-8 py-4 rounded-lg hover:bg-cyan-500/10 transition-all duration-200 text-center"
              >
                Learn More
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div>
                <div className="text-3xl font-bold text-white">500+</div>
                <div className="text-gray-400 text-sm">Companies</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">2000+</div>
                <div className="text-gray-400 text-sm">Internships</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">10k+</div>
                <div className="text-gray-400 text-sm">Students</div>
              </div>
            </div>
          </div>

          {/* Right Content - Image */}
          <div className="relative">
            <div className="relative z-10">
              <div className="rounded-2xl overflow-hidden border border-cyan-500/20 shadow-2xl shadow-cyan-500/10">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1701576766277-c6160505581d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwc3R1ZHlpbmclMjBsYXB0b3B8ZW58MXx8fHwxNzY3NzE2MDc1fDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Student working on laptop"
                  className="w-full h-auto"
                />
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg opacity-20 blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg opacity-20 blur-xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
