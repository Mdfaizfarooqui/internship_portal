export function PartnerCompanies() {
  const companies = [
    { name: "Google", color: "from-blue-500 to-green-500" },
    { name: "Microsoft", color: "from-blue-600 to-cyan-500" },
    { name: "Amazon", color: "from-orange-500 to-yellow-500" },
    { name: "Meta", color: "from-blue-500 to-purple-500" },
    { name: "Apple", color: "from-gray-400 to-gray-600" },
    { name: "Netflix", color: "from-red-600 to-pink-600" },
    { name: "Tesla", color: "from-red-500 to-gray-700" },
    { name: "Adobe", color: "from-red-600 to-pink-500" },
    { name: "IBM", color: "from-blue-600 to-indigo-600" },
    { name: "Oracle", color: "from-red-600 to-orange-500" },
    { name: "Salesforce", color: "from-cyan-500 to-blue-500" },
    { name: "Intel", color: "from-blue-600 to-cyan-600" },
  ];

  return (
    <section className="relative py-20 bg-gradient-to-b from-zinc-950 to-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-medium">
              🤝 Trusted Partners
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Our Partner Companies
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Join thousands of students who have launched their careers with industry leaders
          </p>
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {companies.map((company, index) => (
            <div
              key={index}
              className="group relative aspect-square bg-gradient-to-br from-zinc-900 to-zinc-800/50 rounded-xl p-6 border border-zinc-700 hover:border-transparent transition-all duration-300 flex items-center justify-center overflow-hidden"
            >
              {/* Gradient border effect on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${company.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              <div className="absolute inset-[2px] bg-zinc-900 rounded-xl"></div>
              
              {/* Company name */}
              <div className="relative z-10 text-center">
                <div className={`text-2xl font-bold bg-gradient-to-br ${company.color} bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300`}>
                  {company.name}
                </div>
              </div>

              {/* Glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${company.color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`}></div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-zinc-800">
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
              500+
            </div>
            <div className="text-gray-400">Partner Companies</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-2">
              95%
            </div>
            <div className="text-gray-400">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-2">
              10k+
            </div>
            <div className="text-gray-400">Students Placed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-2">
              50+
            </div>
            <div className="text-gray-400">Countries</div>
          </div>
        </div>
      </div>
    </section>
  );
}
