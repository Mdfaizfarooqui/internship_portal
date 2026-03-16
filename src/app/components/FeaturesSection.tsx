import { FileText, TrendingUp, CheckCircle, Bell } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: FileText,
      title: "Resume Maker",
      description: "Create professional resumes with our easy-to-use templates designed for students and fresh graduates.",
      color: "from-cyan-500 to-blue-600",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/20",
    },
    {
      icon: TrendingUp,
      title: "Skill Gap Analysis",
      description: "Identify missing skills and get personalized recommendations to match your dream internship requirements.",
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
    {
      icon: CheckCircle,
      title: "Resume Score",
      description: "Get instant feedback on your resume with AI-powered scoring to improve your chances of landing interviews.",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
    },
    {
      icon: Bell,
      title: "Email Notifications",
      description: "Never miss an opportunity! Get instant alerts for new internship postings matching your preferences.",
      color: "from-orange-500 to-red-600",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
    },
  ];

  return (
    <section className="relative py-20 bg-gradient-to-b from-zinc-950 to-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium">
              ✨ New Features
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Newly Added Features
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Powerful tools designed to help you stand out and secure your dream internship
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`group relative p-6 rounded-xl border ${feature.borderColor} ${feature.bgColor} backdrop-blur-sm hover:scale-105 transition-all duration-300 cursor-pointer`}
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300`}></div>
                
                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <Icon className="text-white" size={28} />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-blue-500 transition-all duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Learn More Link */}
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className={`text-sm font-medium bg-gradient-to-r ${feature.color} bg-clip-text text-transparent flex items-center gap-1`}>
                      Learn more →
                    </span>
                  </div>
                </div>

                {/* Corner decoration */}
                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${feature.color} opacity-10 blur-2xl rounded-full group-hover:opacity-20 transition-opacity duration-300`}></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
