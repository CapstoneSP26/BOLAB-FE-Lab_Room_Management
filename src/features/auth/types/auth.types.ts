export interface UserAuth {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  campusId: number;
  avatarUrl?: string;
}