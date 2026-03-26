import axiosInstance from "../../api/axios";

export type Role = "Lab Manager" | "Lecturer";

export type Profile = {
  // để UI bạn dùng được cả 2 kiểu
  fullName: string;
  firstName: string;
  lastName: string;

  email: string;
  phone: string;
  birthday: string;
  campus: string;
  avatarUrl?: string;
};

const STORAGE_KEY = "profile_v1";

function splitFullName(fullName: string) {
  const cleaned = fullName.trim().replace(/\s+/g, " ");
  if (!cleaned) return { firstName: "", lastName: "" };
  const parts = cleaned.split(" ");
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function normalizeProfile(input: Partial<Profile>): Profile {
  const fullName = (input.fullName ?? "").trim();

  const firstName =
    (input.firstName ?? "").trim() || splitFullName(fullName).firstName;
  const lastName =
    (input.lastName ?? "").trim() || splitFullName(fullName).lastName;

  const computedFullName = fullName || `${firstName} ${lastName}`.trim();

  return {
    fullName: computedFullName,
    firstName,
    lastName,
    email: (input.email ?? "").trim(),
    phone: (input.phone ?? "").trim(),
    birthday: (input.birthday ?? "").trim(),
    campus: (input.campus ?? "").trim(),
    avatarUrl: input.avatarUrl,
  };
}

export const profileService = {
  /**
   * GET /auth/me
   * Fetch current user profile
   * Supports mock mode via VITE_USE_MOCK_DATA env
   */
  async getMe(): Promise<Profile> {
    try {
      const response = await axiosInstance.get<Profile>("/auth/me");
      return normalizeProfile(response.data);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      throw error;
    }
  },

  /**
   * PUT /auth/me
   * Update current user profile
   * Supports mock mode via VITE_USE_MOCK_DATA env
   */
  async updateMe(next: Partial<Profile>): Promise<Profile> {
    const normalized = normalizeProfile(next);

    try {
      const response = await axiosInstance.put<Profile>(
        "/auth/me",
        normalized,
      );
      return normalizeProfile(response.data);
    } catch (error) {
      console.error("Failed to update user profile:", error);
      throw error;
    }
  },
};
