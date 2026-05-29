export interface UserAuth {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  roleId?: string;
  campusId: number;
  avatarUrl?: string;
  aiRequestQuota: number;
}