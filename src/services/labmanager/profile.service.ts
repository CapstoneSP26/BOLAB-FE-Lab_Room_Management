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

const USE_MOCK = true;

const API_URL = import.meta.env.VITE_API_URL as string | undefined;

function sleep(ms = 200) {
  return new Promise((r) => setTimeout(r, ms));
}

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

const defaultProfile: Profile = normalizeProfile({
  fullName: "Nguyen Dinh Thai Ha",
  email: "abc@gmail.com",
  phone: "+09 363 398 46",
  birthday: "2001-05-20",
  campus: "Campus Da Nang",
  avatarUrl: "/images/user/owner.jpg",
});

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_URL) throw new Error("Missing VITE_API_URL");
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text || "Request failed"}`);
  }
  return (await res.json()) as T;
}

export const profileService = {
  async getMe(): Promise<Profile> {
    if (!USE_MOCK) {
      return normalizeProfile(await http<Profile>("/me"));
    }

    await sleep(150);
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProfile));
      return defaultProfile;
    }
    try {
      const parsed = JSON.parse(raw) as Profile;
      return normalizeProfile(parsed);
    } catch {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProfile));
      return defaultProfile;
    }
  },

  async updateMe(next: Partial<Profile>): Promise<Profile> {
    const normalized = normalizeProfile(next);

    if (!USE_MOCK) {
      return normalizeProfile(
        await http<Profile>("/me", {
          method: "PUT",
          body: JSON.stringify(normalized),
        }),
      );
    }

    await sleep(150);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  },
};
