import type { Profile, UserDto } from "../types/profile.type";

export function splitFullName(fullName: string) {
  const cleaned = fullName.trim().replace(/\s+/g, " ");
  if (!cleaned) return { firstName: "", lastName: "" };

  const parts = cleaned.split(" ");
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

export function mapUserDtoToProfile(dto: UserDto): Profile {
  return {
    id: dto.Id,
    email: dto.Email,
    fullName: dto.FullName,
    userCode: dto.UserCode,
    userImageUrl: dto.UserImageUrl,
    campusId: dto.CampusId,
    createdAt: dto.CreatedAt,
    updatedAt: dto.UpdatedAt ?? null,
    createdBy: dto.CreatedBy ?? null,
    updatedBy: dto.UpdatedBy ?? null,
    lastLogin: dto.LastLogin ?? null,
    isActive: dto.IsActive ?? null,
  };
}
