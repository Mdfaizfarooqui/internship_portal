import { MapPin, Clock, DollarSign, Bookmark } from "lucide-react";

export function TrendingInternships() {
  const internships = [
    {
      id: 1,
      company: "TechCorp",
      logo: "🚀",
      position: "Software Engineering Intern",
      location: "San Francisco, CA",
      duration: "3 months",
      stipend: "$2,500/month",
      type: "Full-time",
      tags: ["React", "Node.js", "AWS"],
      applicants: 124,
    },
    {
      id: 2,
      company: "DataFlow Inc",
      logo: "📊",
      position: "Data Science Intern",
      location: "New York, NY",
      duration: "6 months",
      stipend: "$3,000/month",
      type: "Full-time",
      tags: ["Python", "ML", "SQL"],
      applicants: 89,
    },
    {
      id: 3,
      company: "DesignHub",
      logo: "🎨",
      position: "UI/UX Design Intern",
      location: "Remote",
      duration: "4 months",
      stipend: "$2,000/month",
      type: "Part-time",
      tags: ["Figma", "Adobe XD", "Prototyping"],
      applicants: 156,
    },
    {
      id: 4,
      company: "MarketGenius",
      logo: "📈",
      position: "Digital Marketing Intern",
      location: "Austin, TX",
      duration: "3 months",
      stipend: "$1,800/month",
      type: "Full-time",
      tags: ["SEO", "Social Media", "Analytics"],
      applicants: 67,
    },
    {
      id: 5,
      company: "CloudNet",
      logo: "☁️",
      position: "Cloud Infrastructure Intern",
      location: "Seattle, WA",
      duration: "6 months",
      stipend: "$2,800/month",
      type: "Full-time",
      tags: ["AWS", "Docker", "Kubernetes"],
      applicants: 92,
    },
    {
      id: 6,
      company: "MobileTech",
      logo: "📱",
      position: "Mobile Development Intern",
      location: "Boston, MA",
      duration: "4 months",
      stipend: "$2,400/month",
      type: "Full-time",
      tags: ["React Native", "iOS", "Android"],
      applicants: 103,
    },
  ];

  return (
    <section id="internships" className="relative py-20 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-full text-sm font-medium">
              🔥 Hot Opportunities
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Trending Internship Openings
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Discover the most sought-after internship positions from leading companies
          </p>
        </div>

        {/* Internships Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {internships.map((internship) => (
            <div
              key={internship.id}
              className="group relative bg-gradient-to-br from-zinc-900 to-zinc-800/50 rounded-xl p-6 border border-zinc-700 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1"
            >
              {/* Bookmark Icon */}
              <button className="absolute top-4 right-4 text-gray-500 hover:text-cyan-400 transition-colors">
                <Bookmark size={20} />
              </button>

              {/* Company Logo */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center text-3xl border border-cyan-500/20">
                  {internship.logo}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {internship.position}
                  </h3>
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
                {internship.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full text-xs border border-cyan-500/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-700">
                <span className="text-gray-400 text-sm">
                  {internship.applicants} applicants
                </span>
                <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105">
                  Apply Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View More Button */}
        <div className="text-center mt-12">
          <button className="border border-cyan-500/50 text-cyan-400 px-8 py-3 rounded-lg hover:bg-cyan-500/10 transition-all duration-200">
            View All Internships
          </button>
        </div>
      </div>
    </section>
  );
}
