export const Role = {
  Student: "Student",
  Lecturer: "Lecturer",
  Manager: "Manager",
  Admin: "Admin",

}
export type Role = (typeof Role)[keyof typeof Role];