export interface ProfileResponse {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthday: string;
  campus: string;
  avatarUrl?: string;
  userCode?: string;
  roles?: string[];
  isActive?: boolean;
}

export const mockUserProfiles: Record<string, ProfileResponse> = {
  // Lab Manager profile
  labmanager: {
    id: "USR001",
    fullName: "Nguyen Dinh Thai Ha",
    firstName: "Dinh Thai",
    lastName: "Ha",
    email: "labmanager@fpt.edu.vn",
    phone: "+84 363 398 46",
    birthday: "2001-05-20",
    campus: "Campus Da Nang",
    avatarUrl: "/images/user/owner.jpg",
    userCode: "LM001",
    roles: ["lab_manager"],
    isActive: true,
  },

  // Lecturer profile
  lecturer: {
    id: "USR002",
    fullName: "Tran Minh Duc",
    firstName: "Minh",
    lastName: "Duc",
    email: "lecturer@fpt.edu.vn",
    phone: "+84 912 345 678",
    birthday: "1990-03-15",
    campus: "Campus Ho Chi Minh",
    avatarUrl: "/images/user/lecturer.jpg",
    userCode: "LEC001",
    roles: ["lecturer"],
    isActive: true,
  },

  // Admin profile (fallback)
  admin: {
    id: "USR003",
    fullName: "Admin User",
    firstName: "Admin",
    lastName: "User",
    email: "admin@fpt.edu.vn",
    phone: "+84 888 888 888",
    birthday: "1995-01-01",
    campus: "Campus FPT",
    avatarUrl: "/images/user/admin.jpg",
    userCode: "AD001",
    roles: ["admin", "lab_manager"],
    isActive: true,
  },
};

// Default mock user (used when no specific role is detected)
export const defaultMockProfile = mockUserProfiles.labmanager;
