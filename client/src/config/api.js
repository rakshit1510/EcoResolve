// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  BASE_URL: API_BASE_URL,
  
  // Auth endpoints
  AUTH: {
    LOGIN_CITIZEN: `${API_BASE_URL}/api/auth/login/citizen`,
    LOGIN_ADMIN: `${API_BASE_URL}/api/auth/login/admin`,
    LOGIN_STAFF: `${API_BASE_URL}/api/auth/login/staff`,
    LOGIN_SUPERADMIN: `${API_BASE_URL}/api/auth/login/superadmin`,
    SEND_OTP: `${API_BASE_URL}/api/auth/sendotp`,
    SIGNUP: `${API_BASE_URL}/api/auth/signup`,
    UNAPPROVED_STAFF: `${API_BASE_URL}/api/auth/unapproved-staff`,
    APPROVE_ACCOUNT: `${API_BASE_URL}/api/auth/approve-account`,
    REJECT_STAFF: `${API_BASE_URL}/api/auth/reject-staff`,
  },
  
  // Complaints endpoints
  COMPLAINTS: {
    CREATE: `${API_BASE_URL}/api/complaints/createComplaint`,
    GET_ALL: `${API_BASE_URL}/api/complaints/getAllComplaints`,
    MY_COMPLAINTS: `${API_BASE_URL}/api/complaints/my-complaints`,
    CHANGE_STATUS: `${API_BASE_URL}/api/complaints/changeProgressStatus`,
  },
  
  // Resources endpoints
  RESOURCES: {
    BASE: `${API_BASE_URL}/api/resources`,
  },
  
  // Reviews endpoints
  REVIEWS: {
    MY_REVIEWS: `${API_BASE_URL}/api/reviews/my-reviews`,
    GET_ALL: `${API_BASE_URL}/api/reviews/getAllReviews`,
    CREATE: `${API_BASE_URL}/api/reviews/createReview`,
  },
  
  // Announcements endpoints
  ANNOUNCEMENTS: {
    BASE: `${API_BASE_URL}/api/announcements`,
  },
  
  // Reports endpoints
  REPORTS: {
    GENERATE: `${API_BASE_URL}/api/reports/generate`,
    ADMIN: `${API_BASE_URL}/api/reports/admin`,
  },
  
  // Profile endpoints
  PROFILE: {
    GET_PROFILE: `${API_BASE_URL}/api/profile/getProfile`,
    ME: `${API_BASE_URL}/api/profile/me`,
  },
  
  // Assignments endpoints
  ASSIGNMENTS: {
    LOGIN: `${API_BASE_URL}/api/assignments/assignment-login`,
    RESOLVE: `${API_BASE_URL}/api/assignments/resolve-assignment`,
    REJECT: `${API_BASE_URL}/api/assignments/reject`,
  },
};

export default API_ENDPOINTS;