// import axiosInstance from '../../../api/axios';
// Not used in mock implementation, will be used when backend is ready
import type {
  GetStudentGroupsRequest,
  GetStudentGroupsResponse,
  CreateStudentGroupRequest,
  CreateStudentGroupResponse,
  UpdateStudentGroupRequest,
  UpdateStudentGroupResponse,
  DeleteStudentGroupRequest,
  DeleteStudentGroupResponse,
  GetGroupStudentsRequest,
  GetGroupStudentsResponse,
  AddStudentToGroupRequest,
  AddStudentToGroupResponse,
  RemoveStudentFromGroupRequest,
  RemoveStudentFromGroupResponse,
  StudentGroup,
  StudentInGroup,
} from '../types/types';

/**
 * ===== DATA ACCESS LAYER =====
 * Rules:
 * - Chỉ dùng axiosInstance
 * - Phải định nghĩa TypeScript Interface cho cả Request và Response
 * - Không được catch error (để UI hoặc React Query xử lý)
 *
 * Note: CRUD endpoints (POST/PUT/DELETE) are mocked for now.
 * Sẽ thay thế với real endpoints khi backend implementation hoàn thành.
 */

// const STUDENT_GROUPS_API = {
//   STUDENT_GROUPS: '/api/student-groups',
//   GROUP_STUDENTS: '/api/student-groups/:id/students',
// };

// Mock data for development
const MOCK_GROUPS: StudentGroup[] = [
  {
    id: '1',
    name: 'SE1801',
    studentCount: 0,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'SE1802',
    studentCount: 0,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '3',
    name: 'SE1803',
    studentCount: 0,
    createdAt: '2024-01-16T10:00:00Z',
  },
];

const FIRST_NAMES = [
  'An',
  'Bao',
  'Chi',
  'Duc',
  'Giang',
  'Huy',
  'Khanh',
  'Linh',
  'Minh',
  'Phuong',
  'Quang',
  'Trang',
  'Tuan',
  'Vy',
];

const LAST_NAMES = ['Nguyen', 'Tran', 'Le', 'Pham', 'Hoang', 'Vo', 'Dang', 'Do', 'Bui'];

const buildMockStudents = (groupCode: string, count: number, offset: number): StudentInGroup[] => {
  return Array.from({ length: count }).map((_, index) => {
    const sequence = index + 1;
    const firstName = FIRST_NAMES[(offset + index) % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(offset + index * 3) % LAST_NAMES.length];
    const studentCode = `HE${groupCode}${String(sequence).padStart(3, '0')}`;
    const avatarSeed = ((offset + index * 13) % 70) + 1;

    return {
      studentId: studentCode,
      studentCode,
      fullName: `${lastName} ${firstName}`,
      email: `${studentCode.toLowerCase()}@fpt.edu.vn`,
      avatarUrl: `https://i.pravatar.cc/80?img=${avatarSeed}`,
    };
  });
};

const MOCK_GROUP_STUDENTS: { [key: string]: StudentInGroup[] } = {
  '1': buildMockStudents('1801', 6, 3),
  '2': buildMockStudents('1802', 5, 11),
  '3': buildMockStudents('1803', 6, 19),
};

const syncGroupAggregates = () => {
  MOCK_GROUPS.forEach((group) => {
    group.studentCount = (MOCK_GROUP_STUDENTS[group.id] || []).length;
    group.previewStudents = (MOCK_GROUP_STUDENTS[group.id] || []).slice(0, 4);
  });
};

syncGroupAggregates();

/**
 * Lấy danh sách nhóm sinh viên của giảng viên
 */
export const getStudentGroups = async (
  params: GetStudentGroupsRequest = {}
): Promise<GetStudentGroupsResponse> => {
  // TODO: Thay thế bằng real API call khi backend ready
  // const response = await axiosInstance.get<GetStudentGroupsResponse>(
  //   STUDENT_GROUPS_API.STUDENT_GROUPS,
  //   { params }
  // );
  // return response.data;

  // Mock implementation
  syncGroupAggregates();
  let results = [...MOCK_GROUPS];

  // Apply search filter
  if (params.searchQuery) {
    const query = params.searchQuery.toLowerCase();
    results = results.filter((group) => group.name.toLowerCase().includes(query));
  }

  // Apply sorting
  const sortBy = params.sortBy || 'name';
  const sortOrder = params.sortOrder || 'asc';

  results.sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'count':
        comparison = a.studentCount - b.studentCount;
        break;
      case 'name':
      default:
        comparison = a.name.localeCompare(b.name);
    }
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  return {
    groups: results,
    total: results.length,
  };
};

/**
 * Tạo nhóm sinh viên mới
 */
export const createStudentGroup = async (
  request: CreateStudentGroupRequest
): Promise<CreateStudentGroupResponse> => {
  // TODO: Thay thế bằng real API call khi backend ready
  // const response = await axiosInstance.post<CreateStudentGroupResponse>(
  //   STUDENT_GROUPS_API.STUDENT_GROUPS,
  //   request
  // );
  // return response.data;

  // Mock implementation
  const newGroup: StudentGroup = {
    id: Math.random().toString(36).substr(2, 9),
    name: request.name,
    studentCount: 0,
    previewStudents: [],
    createdAt: new Date().toISOString(),
  };

  MOCK_GROUPS.push(newGroup);
  MOCK_GROUP_STUDENTS[newGroup.id] = [];
  syncGroupAggregates();

  return {
    success: true,
    group: newGroup,
    message: 'Student group created successfully',
  };
};

/**
 * Cập nhật thông tin nhóm sinh viên
 */
export const updateStudentGroup = async (
  request: UpdateStudentGroupRequest
): Promise<UpdateStudentGroupResponse> => {
  // TODO: Thay thế bằng real API call khi backend ready
  // const response = await axiosInstance.put<UpdateStudentGroupResponse>(
  //   `${STUDENT_GROUPS_API.STUDENT_GROUPS}/${request.id}`,
  //   request
  // );
  // return response.data;

  // Mock implementation
  const groupIndex = MOCK_GROUPS.findIndex((g) => g.id === request.id);
  if (groupIndex === -1) {
    throw new Error('Student group does not exist');
  }

  const updatedGroup: StudentGroup = {
    ...MOCK_GROUPS[groupIndex],
    name: request.name,
    updatedAt: new Date().toISOString(),
  };

  MOCK_GROUPS[groupIndex] = updatedGroup;
  syncGroupAggregates();

  return {
    success: true,
    group: updatedGroup,
    message: 'Student group updated successfully',
  };
};

/**
 * Xóa nhóm sinh viên
 */
export const deleteStudentGroup = async (
  request: DeleteStudentGroupRequest
): Promise<DeleteStudentGroupResponse> => {
  // TODO: Thay thế bằng real API call khi backend ready
  // const response = await axiosInstance.delete<DeleteStudentGroupResponse>(
  //   `${STUDENT_GROUPS_API.STUDENT_GROUPS}/${request.id}`
  // );
  // return response.data;

  // Mock implementation
  const groupIndex = MOCK_GROUPS.findIndex((g) => g.id === request.id);
  if (groupIndex === -1) {
    throw new Error('Student group does not exist');
  }

  MOCK_GROUPS.splice(groupIndex, 1);
  delete MOCK_GROUP_STUDENTS[request.id];
  syncGroupAggregates();

  return {
    success: true,
    message: 'Student group deleted successfully',
  };
};

/**
 * Lấy danh sách sinh viên trong nhóm
 */
export const getGroupStudents = async (
  request: GetGroupStudentsRequest
): Promise<GetGroupStudentsResponse> => {
  // TODO: Thay thế bằng real API call khi backend ready
  // const response = await axiosInstance.get<GetGroupStudentsResponse>(
  //   STUDENT_GROUPS_API.GROUP_STUDENTS.replace(':id', request.groupId)
  // );
  // return response.data;

  // Mock implementation
  const students = MOCK_GROUP_STUDENTS[request.groupId] || [];
  return {
    students,
    total: students.length,
  };
};

/**
 * Thêm sinh viên vào nhóm
 */
export const addStudentToGroup = async (
  request: AddStudentToGroupRequest
): Promise<AddStudentToGroupResponse> => {
  // TODO: Thay thế bằng real API call khi backend ready
  // const response = await axiosInstance.post<AddStudentToGroupResponse>(
  //   `${STUDENT_GROUPS_API.GROUP_STUDENTS.replace(':id', request.groupId)}/add`,
  //   { studentId: request.studentId }
  // );
  // return response.data;

  // Mock implementation
  if (!MOCK_GROUP_STUDENTS[request.groupId]) {
    MOCK_GROUP_STUDENTS[request.groupId] = [];
  }

  const mockAllStudents: StudentInGroup[] = [
    {
      studentId: 'HE200001',
      studentCode: 'HE200001',
      fullName: 'Võ Văn F',
      email: 'f@fpt.edu.vn',
    },
    {
      studentId: 'HE200002',
      studentCode: 'HE200002',
      fullName: 'Bùi Thị G',
      email: 'g@fpt.edu.vn',
    },
  ];

  const student = mockAllStudents.find((s) => s.studentId === request.studentId);
  if (!student) {
    throw new Error('Student does not exist');
  }

  const exists = MOCK_GROUP_STUDENTS[request.groupId].find(
    (s) => s.studentId === request.studentId
  );
  if (exists) {
    throw new Error('Student already exists in this group');
  }

  MOCK_GROUP_STUDENTS[request.groupId].push(student);
  syncGroupAggregates();

  return {
    success: true,
    message: 'Student added to group successfully',
  };
};

/**
 * Xóa sinh viên khỏi nhóm
 */
export const removeStudentFromGroup = async (
  request: RemoveStudentFromGroupRequest
): Promise<RemoveStudentFromGroupResponse> => {
  // TODO: Thay thế bằng real API call khi backend ready
  // const response = await axiosInstance.delete<RemoveStudentFromGroupResponse>(
  //   `${STUDENT_GROUPS_API.GROUP_STUDENTS.replace(':id', request.groupId)}/${request.studentId}`
  // );
  // return response.data;

  // Mock implementation
  if (!MOCK_GROUP_STUDENTS[request.groupId]) {
    throw new Error('Student group does not exist');
  }

  const studentIndex = MOCK_GROUP_STUDENTS[request.groupId].findIndex(
    (s) => s.studentId === request.studentId
  );
  if (studentIndex === -1) {
    throw new Error('Student does not exist in this group');
  }

  MOCK_GROUP_STUDENTS[request.groupId].splice(studentIndex, 1);
  syncGroupAggregates();

  return {
    success: true,
    message: 'Student removed from group successfully',
  };
};
