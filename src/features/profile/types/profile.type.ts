export interface UserDto {
  Id: string;
  Email: string;
  FullName: string;
  UserCode: string;
  UserImageUrl: string;
  Provider?: string | null;
  ProviderId?: string | null;
  CampusId: number;
  CreatedAt: string;
  UpdatedAt?: string | null;
  CreatedBy?: string | null;
  UpdatedBy?: string | null;
  LastLogin: string;
  IsDeleted?: boolean | null;
  IsActive?: boolean | null;
}

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  userCode: string;
  userImageUrl: string;
  campusId: number;
  createdAt: string;
  updatedAt?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  lastLogin?: string | null;
  isActive?: boolean | null;
}
