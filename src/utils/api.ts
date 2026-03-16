// API Configuration
// Update this based on your backend server configuration
export const API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:8000' // PHP backend development server
  : '/backend'; // Production path

/**
 * Make API calls to the backend
 * Automatically handles JSON encoding/decoding and error handling
 */
export const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const token = localStorage.getItem('jwt_token');
  if (token) {
    // @ts-ignore
    defaultOptions.headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is FormData, let browser set Content-Type
  if (options.body instanceof FormData) {
    // @ts-ignore
    delete defaultOptions.headers['Content-Type'];
  }

  const response = await fetch(url, { ...defaultOptions, ...options });

  // Handle response
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Authentication API calls
 */
export const authAPI = {
  login: async (email: string, password: string) => {
    const res = await apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.token) {
      localStorage.setItem('jwt_token', res.token);
    }
    return res;
  },

  register: async (userData: { name: string; email: string; password: string; role?: string }) => {
    const res = await apiCall('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (res.token) {
      localStorage.setItem('jwt_token', res.token);
    }
    return res;
  },

  forgotPassword: (email: string) =>
    apiCall('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (email: string, otp: string, new_password: string) =>
    apiCall('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, new_password }),
    }),
};

/**
 * User Profile API calls
 */
export const userAPI = {
  getProfile: () =>
    apiCall(`/api/users/profile`),

  updateProfile: (profileData: any) =>
    apiCall('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),

  uploadProfilePicture: (profilePicture: string) =>
    apiCall('/api/users/profile-picture', {
      method: 'POST',
      body: JSON.stringify({ profile_picture: profilePicture }),
    }),
};

/**
 * Skills API calls
 */
export const skillAPI = {
  create: (skillName: string, proficiencyLevel: string = 'Beginner') =>
    apiCall('/api/skills/create', {
      method: 'POST',
      body: JSON.stringify({ skill_name: skillName, proficiency_level: proficiencyLevel }),
    }),

  getByUser: () =>
    apiCall(`/api/skills/user`),

  update: (skillId: number, skillName: string, proficiencyLevel: string) =>
    apiCall('/api/skills/update', {
      method: 'PUT',
      body: JSON.stringify({ id: skillId, skill_name: skillName, proficiency_level: proficiencyLevel }),
    }),

  delete: (skillId: number) =>
    apiCall(`/api/skills/delete?id=${skillId}`, {
      method: 'DELETE',
    }),
};

/**
 * Education API calls
 */
export const educationAPI = {
  create: (educationData: any) =>
    apiCall('/api/education/create', {
      method: 'POST',
      body: JSON.stringify(educationData),
    }),

  getByUser: () =>
    apiCall(`/api/education/user`),

  update: (educationData: any) =>
    apiCall('/api/education/update', {
      method: 'PUT',
      body: JSON.stringify(educationData),
    }),

  delete: (educationId: number) =>
    apiCall(`/api/education/delete?id=${educationId}`, {
      method: 'DELETE',
    }),
};

/**
 * Work Experience API calls
 */
export const experienceAPI = {
  create: (experienceData: any) =>
    apiCall('/api/experience/create', {
      method: 'POST',
      body: JSON.stringify(experienceData),
    }),

  getByUser: () =>
    apiCall(`/api/experience/user`),

  update: (experienceData: any) =>
    apiCall('/api/experience/update', {
      method: 'PUT',
      body: JSON.stringify(experienceData),
    }),

  delete: (experienceId: number) =>
    apiCall(`/api/experience/delete?id=${experienceId}`, {
      method: 'DELETE',
    }),
};

/**
 * Internship API calls
 */
export const internshipAPI = {
  getInternship: (id: number) =>
    apiCall(`/api/internships/getInternship?id=${id}`),

  getAllInternships: () =>
    apiCall('/api/internships/getAll'),

  getActiveInternships: () =>
    apiCall('/api/internships/getActive'),

  createInternship: (internshipData: any) =>
    apiCall('/api/internships/create', {
      method: 'POST',
      body: JSON.stringify(internshipData),
    }),

  getByRecruiter: () =>
    apiCall(`/api/internships/getByRecruiter`),

  updateInternship: (internshipData: any) =>
    apiCall('/api/internships/update', {
      method: 'PUT',
      body: JSON.stringify(internshipData),
    }),

  deleteInternship: (id: number) =>
    apiCall(`/api/internships/delete?id=${id}`, {
      method: 'DELETE',
    }),
};

/**
 * Application API calls
 */
export const applicationAPI = {
  create: (internshipId: number, resumeId?: number, notes?: string) =>
    apiCall('/api/applications/create', {
      method: 'POST',
      body: JSON.stringify({
        internship_id: internshipId,
        resume_id: resumeId || null,
        notes: notes || ''
      }),
    }),

  getByUser: () =>
    apiCall(`/api/applications/user`),

  getByInternship: (internshipId: number) =>
    apiCall(`/api/applications/internship?internshipId=${internshipId}`),

  updateStatus: (applicationId: number, status: string) =>
    apiCall('/api/applications/status', {
      method: 'PUT',
      body: JSON.stringify({ id: applicationId, status }),
    }),
};

/**
 * Saved Internships API calls
 */
export const savedInternshipAPI = {
  save: (internshipId: number) =>
    apiCall('/api/saved/save', {
      method: 'POST',
      body: JSON.stringify({ internship_id: internshipId }),
    }),

  unsave: (internshipId: number) =>
    apiCall('/api/saved/unsave', {
      method: 'DELETE',
      body: JSON.stringify({ internship_id: internshipId }),
    }),

  getByUser: () =>
    apiCall(`/api/saved/user`),

  isSaved: (internshipId: number) =>
    apiCall(`/api/saved/check?internshipId=${internshipId}`),
};

/**
 * Resume API calls
 */
export const resumeAPI = {
  upload: (title: string, content: string, filePath?: string) =>
    apiCall('/api/resumes/upload', {
      method: 'POST',
      body: JSON.stringify({
        title,
        content,
        file_path: filePath || null
      }),
    }),

  uploadResumeFile: (formData: FormData) =>
    apiCall('/api/resumes/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set content-type for FormData
    }),

  saveBuilder: (data: any) =>
    apiCall('/api/resumes/saveBuilder', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getByUser: () =>
    apiCall(`/api/resumes/user`),

  getById: () =>
    apiCall(`/api/resumes/get`), // Handled by /user now under new Auth flow

  delete: (resumeId: number) =>
    apiCall(`/api/resumes/delete?id=${resumeId}`, {
      method: 'DELETE',
    }),

  getScore: (resumeId?: number) =>
    apiCall(`/api/resumes/analyze`, {
      method: 'POST',
      body: JSON.stringify({ resumeId: resumeId || 'self' }),
    }),
};

/**
 * Skill Gap Analysis API calls
 */
export const skillGapAPI = {
  analyze: (roleName: string) =>
    apiCall('/api/skillgap/analyze', {
      method: 'POST',
      body: JSON.stringify({ role: roleName }),
    }),

  getAnalysis: (roleName: string) =>
    apiCall(`/api/skillgap/get?role=${encodeURIComponent(roleName)}`),
};

/**
 * Projects API calls
 */
export const projectAPI = {
  create: (projectData: any) =>
    apiCall('/api/projects/create', {
      method: 'POST',
      body: JSON.stringify(projectData),
    }),

  getByUser: () =>
    apiCall(`/api/projects/user`),

  update: (projectData: any) =>
    apiCall('/api/projects/update', {
      method: 'PUT',
      body: JSON.stringify(projectData),
    }),

  delete: (projectId: number) =>
    apiCall(`/api/projects/delete?id=${projectId}`, {
      method: 'DELETE',
    }),
};


// Export all APIs as a single object for convenience
export const API = {
  auth: authAPI,
  user: userAPI,
  skill: skillAPI,
  education: educationAPI,
  experience: experienceAPI,
  internship: internshipAPI,
  application: applicationAPI,
  savedInternship: savedInternshipAPI,
  resume: resumeAPI,
  skillGap: skillGapAPI,
  project: projectAPI,
};

export default API;
