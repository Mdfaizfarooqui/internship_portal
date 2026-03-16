import { Target, Users, Award, Heart } from "lucide-react";



export function AboutUs() {
  const values = [
    {
      icon: Target,
      title: "Our Mission",
      description: "To bridge the gap between academic learning and professional excellence by connecting students with meaningful internship opportunities.",
    },
    {
      icon: Users,
      title: "Our Community",
      description: "A thriving network of 10,000+ students and 500+ partner companies working together to create career opportunities.",
    },
    {
      icon: Award,
      title: "Our Achievement",
      description: "95% placement success rate with students landing positions at top companies across various industries.",
    },
    {
      icon: Heart,
      title: "Our Commitment",
      description: "Dedicated to providing personalized support and guidance throughout your internship journey.",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 pt-16">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">InternHub</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            We're on a mission to transform how students discover and secure internship opportunities,
            making the journey from classroom to career seamless and successful.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-gradient-to-b from-zinc-950 to-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-400">
                <p>
                  Founded in 2020, InternHub emerged from a simple observation: students struggled to find
                  quality internship opportunities while companies missed out on talented candidates.
                </p>
                <p>
                  We created a platform that not only connects students with internships but also provides
                  tools to enhance their applications, identify skill gaps, and track their progress.
                </p>
                <p>
                  Today, we're proud to be the leading internship platform, helping thousands of students
                  launch successful careers every year.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            What Drives Us
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="bg-zinc-900 rounded-xl p-8 border border-zinc-800 hover:border-cyan-500/50 transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-4">
                    <Icon className="text-white" size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{value.title}</h3>
                  <p className="text-gray-400">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white text-center mb-6">
            Our Leadership Team
          </h2>
          <p className="text-gray-400 text-center max-w-2xl mx-auto mb-16">
            Meet the passionate individuals dedicated to transforming student careers
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Md Faiz Farooqui", role: "CEO & Founder", img: "👨‍⚖️" },
              { name: "Ankit chauhan", role: "CTO", img: "👨‍💻" },
              { name: "nishit", role: "Head of Partnerships", img: "👨" },
            ].map((member, index) => (
              <div
                key={index}
                className="bg-zinc-950 rounded-xl p-6 border border-zinc-800 text-center hover:border-cyan-500/50 transition-all duration-300"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center text-5xl mx-auto mb-4">
                  {member.img}
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                <p className="text-cyan-400">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
