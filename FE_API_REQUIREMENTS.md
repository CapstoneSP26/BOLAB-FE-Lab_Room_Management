# 📋 Frontend API Requirements - BOLAB-FE

**Ngày cập nhật:** March 18, 2026  
**Status:** Hiện tại FE chưa mock API với BE, chỉ có structure sẵn  
**Mục đích:** Ghi lại các API endpoints mà FE đang sử dụng/cần từ backend

---

## 🔐 **1. AUTHENTICATION ENDPOINTS**

### ✅ Login (Placeholder - TODO)
**Frontend File:** `src/pages/LoginPage.tsx`  
**Status:** Chưa implement  
**ghi chú:** Comment: `// TODO: gọi API login (bạn có axios.ts sẵn)`

```typescript
// Cần implement
POST /api/auth/login
Request:
{
  email: string
  password: string
}

Response:
{
  accessToken: string
  refreshToken: string
  user: {
    id: string
    email: string
    name: string
    role: "ADMIN" | "LAB_MANAGER" | "LECTURER" | "STUDENT"
  }
}
```

### ✅ Refresh Token (Implemented)
**Interceptor:** `src/api/axios.ts`  
**Auto triggered:** Khi accessToken hết hạn

```typescript
POST /api/auth/refresh-token
Request:
{
  refreshToken: string
}

Response:
{
  accessToken: string
  refreshToken: string
}
```

---

## 🔍 **2. ATTENDANCE ENDPOINTS**

**File:** `src/features/attendance/services/attendance.service.ts`

### 2.1️⃣ Create QR Session
```typescript
POST /api/attendance/qr-session
Request: CreateQRSessionRequest
{
  scheduleId: string          // ID của lớp (booking)
  lectureId?: string          // ID giảng viên (optional)
  expiryMinutes?: number      // Token expiry (default: 30 mins)
}

Response: CreateQRSessionResponse
{
  sessionId: string           // ID session QR
  qrToken: string            // QR code token
  qrExpiry: string           // ISO datetime: T+30mins
  isActive: boolean          // Should be true
}
```

### 2.2️⃣ Get QR Session Details
```typescript
GET /api/attendance/qr-session/:sessionId
Response: GetQRSessionResponse
{
  sessionId: string
  qrToken: string
  qrExpiry: string
  isActive: boolean
  totalStudents: number       // Expected attendance
  presentCount: number        // Already checked in
  lateCount: number          // Late check-ins
  absentCount: number        // Marked absent
  checkInList: [
    {
      studentId: string
      studentName: string
      checkInTime: string     // ISO datetime when scanned
      status: "PRESENT" | "LATE" | "ABSENT"
    }
  ]
}
```

### 2.3️⃣ Refresh QR Token
```typescript
POST /api/attendance/qr-session/refresh
Request: RefreshQRTokenRequest
{
  sessionId: string
  expiryMinutes?: number  // New expiry time
}

Response: RefreshQRTokenResponse
{
  qrToken: string         // New token
  qrExpiry: string        // New expiry
}
```

### 2.4️⃣ End QR Session
```typescript
POST /api/attendance/qr-session/:sessionId/end
Request: EndQRSessionRequest
{
  sessionId: string
  // Body có thể empty {}
}

Response: EndQRSessionResponse
{
  isActive: false         // Session deactivated
  finalStats: {
    totalStudents: number
    presentCount: number
    lateCount: number
    absentCount: number
  }
}
```

### 2.5️⃣ Get Attendance List
```typescript
GET /api/attendance/session/:sessionId/students
Response: GetAttendanceListResponse
{
  data: [
    {
      userId: string
      fullName: string
      studentCode: string
      email: string
      status: "NotYet" | "Present" | "Late" | "Absent"
      checkInTime?: string  // ISO datetime if already checked
    }
  ]
}
```

### 2.6️⃣ Mark Attendance (Manual)
```typescript
POST /api/attendance/mark
Request: MarkAttendanceRequest
{
  sessionId: string
  studentId: string
  status: "Present" | "Late" | "Absent"
}

Response: MarkAttendanceResponse
{
  success: boolean
  attendanceRecord: {
    studentId: string
    status: "Present" | "Late" | "Absent"
    markedAt: string      // ISO datetime
    markedBy: string      // Lecturer ID
  }
}
```

### 2.7️⃣ Get Lecturer's Bookings (For QR Management)
```typescript
GET /api/attendance/lecturer-bookings
Response: GetLecturerBookingsResponse
{
  data: [
    {
      bookingId: string
      scheduleId: string
      roomName: string
      startTime: string
      endTime: string
      totalStudents: number
      qrSessionId?: string  // If already created
    }
  ]
}
```

### 2.8️⃣ Export Attendance
```typescript
GET /api/attendance/session/:sessionId/export?format=xlsx
Query Params:
  format: "xlsx" | "csv" | "pdf"

Response: Blob (Excel/CSV/PDF file)
```

---

## 📅 **3. BOOKING ENDPOINTS**

### 3.1️⃣ Get Upcoming Bookings
**File:** `src/features/booking/services/booking.service.ts`

```typescript
GET /api/bookings/upcoming
Query Params:
{
  skip?: number           // Pagination offset
  take?: number           // Pagination limit (default: 10)
  status?: string         // Filter: "PENDING" | "APPROVED" | "REJECTED"
}

Response: GetUpcomingBookingsResponse
{
  data: [
    {
      bookingId: string
      roomId: number
      roomName: string
      buildingName: string
      startTime: string
      endTime: string
      status: "PENDING" | "APPROVED" | "REJECTED"
      bookedBy: string
      createdAt: string
    }
  ]
}
```

### 3.2️⃣ Get Booking Stats
```typescript
GET /api/bookings/stats
Query Params:
{
  period?: "week" | "month" | "year"  // Default: month
}

Response: GetBookingStatsResponse
{
  totalBookings: number
  approvedCount: number
  pendingCount: number
  rejectedCount: number
  avgDuration: number                 // Hours
  busyPeakHours: [
    {
      hour: number
      bookingCount: number
    }
  ]
}
```

### 3.3️⃣ Get Recent Booking Requests
```typescript
GET /api/booking-requests/recent
Query Params:
{
  limit?: number          // Default: 5
}

Response: GetRecentRequestsResponse
{
  data: [
    {
      requestId: string
      requesterName: string
      roomName: string
      requestedTime: string
      status: "PENDING" | "APPROVED" | "REJECTED"
      reason?: string
    }
  ]
}
```

### 3.4️⃣ Get Booking History
```typescript
GET /api/bookings/history
Query Params:
{
  skip?: number
  take?: number
  status?: string
  startDate?: string      // ISO date
  endDate?: string        // ISO date
}

Response: GetBookingHistoryResponse
{
  data: [
    {
      bookingId: string
      roomName: string
      buildingName: string
      startTime: string
      endTime: string
      status: "PENDING" | "APPROVED" | "REJECTED"
      approvedBy?: string
      approvalReason?: string
      createdAt: string
      approvedAt?: string
    }
  ]
}
```

---

## 🏢 **4. HOMEPAGE/DASHBOARD ENDPOINTS**

**File:** `src/features/homepage/services/homepage.service.ts`

### 4.1️⃣ Get Rooms
```typescript
GET /api/rooms
Query Params:
{
  skip?: number
  take?: number
  buildingId?: number
  searchText?: string
  status?: "ACTIVE" | "INACTIVE"
}

Response: GetRoomsResponse
{
  data: [
    {
      roomId: number
      roomName: string
      buildingName: string
      capacity: number
      equipment: string[]  // ["Projector", "PC", "Whiteboard"]
      status: "AVAILABLE" | "IN_USE" | "MAINTENANCE"
      floor: number
    }
  ]
}
```

### 4.2️⃣ Get Buildings
```typescript
GET /api/buildings
Query Params:
{
  skip?: number
  take?: number
  searchText?: string
}

Response: GetBuildingsResponse
{
  data: [
    {
      buildingId: number
      name: string
      totalRooms: number
      location: string
      builtYear: number
    }
  ]
}
```

### 4.3️⃣ Get Overall Stats
```typescript
GET /api/stats
Response: GetStatsResponse
{
  totalRooms: number
  totalBuildings: number
  availableRooms: number
  activeBookings: number
  totalStudents: number
  totalLecturers: number
}
```

---

## 🛎️ **5. ROOM BOOKING ENDPOINTS**

**File:** `src/features/room-booking/api/room-bookingApi.ts`

### 5.1️⃣ Get Lab Rooms (For Booking)
```typescript
GET /api/lab-rooms
Query Params:
{
  skip?: number
  take?: number
  buildingId?: number
  capacity?: number         // Min capacity
}

Response: GetLabRoomsResponse
{
  data: [
    {
      roomId: number
      name: string
      building: string
      capacity: number
      equipment: string[]
      currentStatus: "AVAILABLE" | "IN_USE"
      features: ["AC", "WiFi", "Projector"]
    }
  ]
}
```

### 5.2️⃣ Get Student Groups (For Lecturer)
```typescript
GET /api/student-groups
Response: GetStudentGroupsResponse
{
  data: [
    {
      groupId: string
      groupName: string
      courseCode: string
      semester: string
      studentCount: number
    }
  ]
}
```

### 5.3️⃣ Get Available Slots
```typescript
GET /api/available-slots
Query Params:
{
  roomId: number (required)
  startDate: string       // ISO date (required)
  endDate: string         // ISO date (required)
  duration?: number       // Hours (default: 1)
}

Response: GetAvailableSlotsResponse
{
  data: [
    {
      slotId: string
      startTime: string   // ISO datetime
      endTime: string
      isAvailable: boolean
      reason?: string     // If not available: "In use", "Maintenance"
    }
  ]
}
```

### 5.4️⃣ Create Booking
```typescript
POST /api/bookings
Request: CreateBookingRequest
{
  roomId: number
  studentGroupId: string
  startTime: string       // ISO datetime
  endTime: string
  purpose: string         // "Lab Practice", "Seminar", etc.
  description?: string
  isRecurring?: boolean
  recurringDays?: number  // If recurring
}

Response: CreateBookingResponse
{
  bookingId: string
  status: "PENDING" | "APPROVED"
  createdAt: string
  message: string         // "Booking created, waiting for approval"
}
```

### 5.5️⃣ Get My Bookings
```typescript
GET /api/bookings/my-bookings
Query Params:
{
  skip?: number
  take?: number
  status?: string
}

Response: GetMyBookingsResponse
{
  data: [
    {
      bookingId: string
      roomName: string
      buildingName: string
      startTime: string
      endTime: string
      status: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED"
      createdAt: string
      approvedBy?: string
      rejectionReason?: string
    }
  ]
}
```

---

## 📑 **6. REPORT/FEEDBACK ENDPOINTS**

**File:** `src/features/feedback-report/services/report.service.ts`

### 6.1️⃣ Create Report
```typescript
POST /api/reports
Request: FormData
{
  roomId: number (form field)
  reason: string                  // "Equipment broken", "Cleanliness", etc.
  description: string             // Detailed description
  images: File[]                  // Multi-part file upload
}

Response: CreateReportResponse
{
  reportId: string
  status: "OPEN" | "PENDING_REVIEW"
  createdAt: string
  estimatedResolutionTime?: string
}
```

### 6.2️⃣ Get My Reports
```typescript
GET /api/reports/my-reports
Query Params:
{
  skip?: number
  take?: number
  status?: string         // "OPEN" | "RESOLVED" | "CLOSED"
}

Response: GetMyReportsResponse
{
  data: [
    {
      reportId: string
      roomName: string
      reason: string
      description: string
      status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
      createdAt: string
      updatedAt?: string
      resolvedAt?: string
      imageUrls: string[]
    }
  ]
}
```

### 6.3️⃣ Get Report Detail
```typescript
GET /api/reports/:reportId
Response: GetReportDetailResponse
{
  reportId: string
  roomId: number
  roomName: string
  reason: string
  description: string
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
  severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  createdAt: string
  createdBy: string
  updatedAt?: string
  resolvedAt?: string
  resolvedBy?: string
  resolutionNotes?: string
  imageUrls: string[]
  comments: [
    {
      commentId: string
      author: string
      content: string
      createdAt: string
    }
  ]
}
```

---

## 📊 **7. LAB MANAGER ENDPOINTS**

### 7.1️⃣ Get User Profile
**File:** `src/services/labmanager/profile.service.ts`  
**Status:** Hiện sử dụng mock data

```typescript
GET /api/users/me
Response: Profile
{
  id: string
  email: string
  fullName: string
  firstName: string
  lastName: string
  phone: string
  birthday: string        // ISO date
  campus: string
  role: "Lab Manager" | "Lecturer" | "Admin"
  avatarUrl?: string
}
```

---

## 📅 **8. SCHEDULE/CALENDAR ENDPOINTS**

**File:** `src/features/schedules/api/bookingRequestApi.ts` (Mock)  
**Status:** Hiện chỉ mock data từ localStorage

### 8.1️⃣ Get Lab Schedules
```typescript
GET /api/schedules
Query Params:
{
  startDate?: string      // ISO date
  endDate?: string
  roomId?: number
  status?: "PENDING" | "APPROVED" | "REJECTED"
}

Response:
{
  data: [
    {
      scheduleId: string
      roomId: number
      lectureId: string
      startTime: string
      endTime: string
      scheduleType: "OLD_SLOT" | "NEW_SLOT" | "OUT_SLOT"
      status: "PENDING" | "APPROVED" | "REJECTED"
      buildingName: string
      createdBy: string
      createdAt: string
    }
  ]
}
```

### 8.2️⃣ Get Booking Requests (For Lab Manager)
```typescript
GET /api/booking-requests/pending
Query Params:
{
  skip?: number
  take?: number
}

Response:
{
  data: [
    {
      requestId: string
      lectureId: string
      lectureName: string
      roomId: number
      roomName: string
      startTime: string
      endTime: string
      purpose: string
      groupSize: number
      createdAt: string
      requestedDate: string
    }
  ]
}
```

### 8.3️⃣ Approve/Reject Booking Request
```typescript
POST /api/booking-requests/:requestId/approve
Request:
{
  approvalStatus: "APPROVED" | "REJECTED"
  reason?: string
  rescheduledTime?: string     // If suggesting alternative time
}

Response:
{
  success: boolean
  message: string
}
```

---

## ⚠️ **9. INCIDENT HISTORY ENDPOINT**

**File:** `src/features/incident-history/api/incidentHistoryApi.ts` (Mock)  
**Status:** Hiện chỉ mock data từ localStorage

### 9.1️⃣ Get Incident History
```typescript
GET /api/incidents
Query Params:
{
  skip?: number
  take?: number
  status?: "OPEN" | "CLOSED" | "RESOLVED"
  severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  roomId?: number
}

Response:
{
  data: [
    {
      incidentId: string
      reportId: string
      roomId: number
      roomName: string
      title: string
      description: string
      severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
      status: "OPEN" | "CLOSED" | "RESOLVED"
      createdAt: string
      createdBy: string
      resolvedAt?: string
      resolvedBy?: string
    }
  ]
}
```

---

## 💾 **10. PROFILE SERVICE ENDPOINT**

**File:** `src/services/labmanager/profile.service.ts`

### 10.1️⃣ Switch User Role (Demo Only)
```typescript
// Hiện tại chỉ lưu vào localStorage
// Cần implement backend API nếu muốn permanent role switch

POST /api/users/me/switch-role
Request:
{
  newRole: "Lab Manager" | "Lecturer"
}

Response:
{
  success: boolean
  role: string
}
```

---

## 🔧 **11. AXIOS CONFIGURATION**

**File:** `src/api/axios.ts`

```typescript
// Base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// Auto token refresh on 401
// Auto Bearer token injection in headers
// Timeout: 15 seconds

// Headers:
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {accessToken}"
}
```

---

## 📌 **CURRENT IMPLEMENTATION STATUS**

### ✅ **Fully Implemented** (Ready to Connect):
- Attendance Service (8 endpoints)
- Booking Service (4 endpoints)
- Homepage Service (3 endpoints)
- Room Booking API (5 endpoints)
- Report Service (3 endpoints)

### 🔄 **Mock Data (Need Backend)**:
- Schedule/Booking Requests (localStorage)
- Incident History (localStorage)
- User Profile (mixed mock + mock fetch)

### ❌ **Not Implemented Yet**:
- Login endpoint (placeholder only)
- Lab Manager specific endpoints (Approve/Reject bookings)
- Calendar sync with backend

---

## 🎯 **QUICK SUMMARY**

### Total Endpoints Needed: **40+**

| Category | Count | Status |
|----------|-------|--------|
| Auth | 2 | ⚠️ 1/2 Impl |
| Attendance | 8 | ✅ Ready |
| Booking | 4 | ✅ Ready |
| Homepage | 3 | ✅ Ready |
| Room Booking | 5 | ✅ Ready |
| Reports | 3 | ✅ Ready |
| Lab Manager | 5 | 🔄 Mock |
| Schedule | 3 | 🔄 Mock |
| Incidents | 1 | 🔄 Mock |
| Profile | 2 | 🔄 Mock |
| **TOTAL** | **36+** | 🔄 **Partial** |

---

## 📝 **NOTES FOR BACKEND TEAM**

1. **Authentication:** Implement JWT with access + refresh tokens
2. **Base URL:** Set in `VITE_API_BASE_URL` environment variable
3. **Date Format:** Use ISO 8601 strings (e.g., "2026-03-18T14:30:00Z")
4. **Pagination:** Use `skip`/`take` pattern (not page-based)
5. **Error Handling:** Return consistent error response format
6. **File Upload:** Use `multipart/form-data` for report images
7. **Real-time:** Consider WebSocket for live attendance checking
8. **Polling Intervals:**
   - Attendance: 3 seconds
   - QR Session: 5 seconds
   - Stats: 30 seconds

---

## 🔗 **Frontend Service Files Location**

```
src/
├── api/
│   └── axios.ts                         # HTTP client config
├── features/
│   ├── attendance/
│   │   └── services/attendance.service.ts
│   ├── booking/
│   │   └── services/booking.service.ts
│   ├── homepage/
│   │   └── services/homepage.service.ts
│   ├── room-booking/
│   │   └── api/room-bookingApi.ts
│   ├── feedback-report/
│   │   └── services/report.service.ts
│   ├── schedules/
│   │   └── api/bookingRequestApi.ts     # Mock only
│   ├── incident-history/
│   │   └── api/incidentHistoryApi.ts    # Mock only
│   └── calendar/
│       └── api/labSchedulerApi.ts       # Mock only
└── services/
    └── labmanager/
        └── profile.service.ts           # Mixed
```

---

**Generated:** 2026-03-18 | **Project:** BOLAB-FE-Lab_Room_Management
