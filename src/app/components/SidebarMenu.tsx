import { X, Home, User, FileText, Briefcase, Info, Phone, TrendingUp, CheckCircle, ChevronDown, ChevronRight, Upload } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onPostInternship?: () => void;
}

export function SidebarMenu({ isOpen, onClose, onPostInternship }: SidebarMenuProps) {
  const location = useLocation();
  const [isResumeOpen, setIsResumeOpen] = useState(false);

  const storedUser = localStorage.getItem("currentUser");
  const userData = storedUser ? JSON.parse(storedUser).user || JSON.parse(storedUser) : null;
  const isRecruiter = userData?.role?.toLowerCase() === 'recruiter';

  let menuItems = [
    {
      icon: Home,
      label: "Home",
      path: "/",
    },
    {
      icon: User,
      label: "Profile",
      path: "/profile",
    },
    {
      icon: FileText,
      label: "Resume",
      path: "/resume-builder",
      hasSubmenu: true,
      submenu: [
        { icon: FileText, label: "Resume Builder", path: "/resume-builder" },
        { icon: CheckCircle, label: "Resume Score", path: "/resume-score" },
        { icon: TrendingUp, label: "Skill Gap Analysis", path: "/skill-gap-analysis" },
      ],
    },
    {
      icon: Briefcase,
      label: "Internships",
      path: "/internships",
    },
    // Add Post Internship if callback is provided
    ...(onPostInternship ? [{
      icon: Upload,
      label: "Post Internship",
      action: onPostInternship,
      isAction: true
    }] : []),
    {
      icon: Info,
      label: "About Us",
      path: "/about",
    },
    {
      icon: Phone,
      label: "Contact Us",
      path: "/contact",
    },
  ];

  if (isRecruiter) {
    menuItems = [
      {
        icon: Home,
        label: "Home",
        path: "/",
      },
      {
        icon: Briefcase,
        label: "Recruiter Dashboard",
        path: "/recruiter-dashboard",
      },
      {
        icon: Info,
        label: "About Us",
        path: "/about",
      },
      {
        icon: Phone,
        label: "Contact Us",
        path: "/contact",
      },
      {
        icon: User,
        label: "Logout",
        isAction: true,
        action: () => {
          localStorage.removeItem("currentUser");
          window.location.href = "/";
        }
      } as any
    ];
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-zinc-950 border-r border-zinc-800 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="text-2xl font-bold">
            <span className="text-white">Intern</span>
            <span className="text-cyan-400">Hub</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-4 overflow-y-auto h-[calc(100%-80px)]">
          <ul className="space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;

              if ('isAction' in item && item.isAction) {
                return (
                  <li key={index}>
                    <button
                      onClick={() => {
                        item.action?.();
                        onClose();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-gray-400 hover:bg-zinc-800 hover:text-white"
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </button>
                  </li>
                )
              }

              const active = isActive(item.path || '');

              return (
                <li key={index}>
                  {item.hasSubmenu ? (
                    <>
                      <button
                        onClick={() => setIsResumeOpen(!isResumeOpen)}
                        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${active || location.pathname.startsWith("/resume") || location.pathname.startsWith("/skill-gap-analysis")
                          ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                          : "text-gray-400 hover:bg-zinc-800 hover:text-white"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={20} />
                          <span>{item.label}</span>
                        </div>
                        {isResumeOpen ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </button>

                      {/* Submenu */}
                      {isResumeOpen && item.submenu && (
                        <ul className="mt-2 ml-4 space-y-1">
                          {item.submenu.map((subItem, subIndex) => {
                            const SubIcon = subItem.icon;
                            const subActive = isActive(subItem.path);
                            return (
                              <li key={subIndex}>
                                <Link
                                  to={subItem.path}
                                  onClick={onClose}
                                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${subActive
                                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                    : "text-gray-400 hover:bg-zinc-800 hover:text-white"
                                    }`}
                                >
                                  <SubIcon size={18} />
                                  <span className="text-sm">{subItem.label}</span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link
                      to={item.path!}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${active
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                        : "text-gray-400 hover:bg-zinc-800 hover:text-white"
                        }`}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
}