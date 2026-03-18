# 🚀 QUICK START - API Integration Checklist for Backend Team

**Document cho:** Backend Development Team  
**Mục đích:** Danh sách kiểm tra nhanh các API cần implement  
**Priority:** High  

---

## 📋 **CRITICAL - MUST HAVE FIRST**

### Phase 1 (Week 1-2): Authentication + Attendance
- [ ] **POST** `/api/auth/login` - User login
- [ ] **POST** `/api/auth/refresh-token` - Token refresh
- [ ] **POST** `/api/attendance/qr-session` - Create QR session
- [ ] **GET** `/api/attendance/qr-session/:id` - Get session details
- [ ] **POST** `/api/attendance/qr-session/refresh` - Refresh token
- [ ] **POST** `/api/attendance/qr-session/:id/end` - End session
- [ ] **GET** `/api/attendance/session/:id/students` - Get attendance list
- [ ] **POST** `/api/attendance/mark` - Mark attendance manually

### Phase 2 (Week 2-3): Bookings + Homepage
- [ ] **GET** `/api/rooms` - List rooms
- [ ] **GET** `/api/buildings` - List buildings
- [ ] **GET** `/api/stats` - Overall stats
- [ ] **GET** `/api/bookings/upcoming` - Upcoming bookings
- [ ] **GET** `/api/bookings/stats` - Booking statistics
- [ ] **GET** `/api/booking-requests/recent` - Recent requests
- [ ] **GET** `/api/bookings/history` - Booking history

### Phase 3 (Week 3): Room Booking Feature
- [ ] **GET** `/api/lab-rooms` - Lab rooms list
- [ ] **GET** `/api/student-groups` - Student groups
- [ ] **GET** `/api/available-slots` - Available time slots
- [ ] **POST** `/api/bookings` - Create booking
- [ ] **GET** `/api/bookings/my-bookings` - My bookings

### Phase 4 (Week 4): Reports + Lab Manager
- [ ] **POST** `/api/reports` - Create report (multipart/form-data)
- [ ] **GET** `/api/reports/my-reports` - My reports
- [ ] **GET** `/api/reports/:id` - Report detail
- [ ] **GET** `/api/users/me` - Current user profile
- [ ] **GET** `/api/attendance/lecturer-bookings` - Lecturer bookings
- [ ] **POST** `/api/booking-requests/:id/approve` - Approve/reject request

### Phase 5 (Week 4+): Advanced Features
- [ ] **GET** `/api/schedules` - Lab schedules
- [ ] **GET** `/api/booking-requests/pending` - Pending approvals
- [ ] **GET** `/api/incidents` - Incident history
- [ ] **GET** `/api/attendance/session/:id/export` - Export attendance

---

## 🔑 **KEY REQUEST/RESPONSE PATTERNS**

### Login Response Pattern
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "...",
  "user": {
    "id": "user-123",
    "email": "user@fpt.edu.vn",
    "name": "Nguyễn Văn A",
    "role": "LECTURER"
  }
}
```

### List Response Pattern
```json
{
  "data": [
    { "id": "1", "name": "Room A" },
    { "id": "2", "name": "Room B" }
  ],
  "total": 100,
  "skip": 0,
  "take": 20
}
```

### QR Session Response Pattern
```json
{
  "sessionId": "sess-123",
  "qrToken": "abc123xyz",
  "qrExpiry": "2026-03-18T15:00:00Z",
  "isActive": true,
  "presentCount": 25,
  "totalStudents": 30
}
```

### Error Response Pattern
```json
{
  "success": false,
  "message": "Room not available",
  "code": "ROOM_UNAVAILABLE",
  "details": {}
}
```

---

## ⚙️ **IMPORTANT CONFIGS**

### Environment Variables (Frontend expects)
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=15000
```

### Request Headers (Auto-injected by Frontend)
```
Content-Type: application/json
Authorization: Bearer {accessToken}
```

### Query Param Pattern (Pagination)
```
GET /api/resources?skip=0&take=20
```

### Date Format
- ISO 8601: `2026-03-18T14:30:00Z`
- All dates should be in UTC

### Status Values (Standardize)
- Attendance: `NotYet | Present | Late | Absent`
- Booking: `PENDING | APPROVED | REJECTED`
- Report: `OPEN | IN_PROGRESS | RESOLVED | CLOSED`

---

## 📊 **PRIORITY MATRIX**

```
HIGH PRIORITY (Do First):
├─ Auth endpoints (Login/Refresh)
├─ Attendance endpoints (QR session management)
├─ Booking list endpoints
└─ Homepage endpoints (rooms, buildings, stats)

MEDIUM PRIORITY (Week 2-3):
├─ Room booking flow
├─ Report creation
└─ Lab manager approvals

LOW PRIORITY (Week 4+):
├─ Advanced scheduling
├─ Incident management
└─ Export features
```

---

## 🧪 **TESTING CHECKLIST**

For each endpoint, test:
- [ ] Happy path (valid request)
- [ ] Invalid input (400 Bad Request)
- [ ] Unauthorized (401 Unauthorized)
- [ ] Forbidden (403 Forbidden)
- [ ] Not found (404 Not Found)
- [ ] Rate limiting (429 Too Many Requests)
- [ ] Server error (500 Internal Server Error)

---

## 🐛 **COMMON ISSUES TO AVOID**

1. **CORS Issues** - Configure CORS for `http://localhost:5173` (Vite dev)
2. **Date Parsing** - Always use ISO 8601 format
3. **Token Expiry** - Set reasonable expiry (e.g., 15 mins access, 7 days refresh)
4. **File Upload** - Support `multipart/form-data` for report images
5. **Pagination** - Support both `skip/take` pattern
6. **Filtering** - Support query params for filtering lists
7. **Timestamps** - Use consistent UTC timestamps everywhere

---

## 📱 **POSTMAN COLLECTIONS**

Use this for testing endpoints during development:

```
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@fpt.edu.vn", "password": "pass123"}'

curl -X GET http://localhost:3000/api/rooms \
  -H "Authorization: Bearer {accessToken}"

curl -X POST http://localhost:3000/api/attendance/qr-session \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {accessToken}" \
  -d '{"scheduleId": "sch-123", "expiryMinutes": 30}'
```

---

## 🔗 **FRONTEND SERVICES CONNECTING TO THESE ENDPOINTS**

| Service File | Endpoints | Status |
|------|-----------|--------|
| `src/api/axios.ts` | HTTP client, token refresh | ✅ Ready |
| `src/features/attendance/services/attendance.service.ts` | All attendance APIs | ✅ Ready |
| `src/features/booking/services/booking.service.ts` | Booking APIs | ✅ Ready |
| `src/features/homepage/services/homepage.service.ts` | Homepage APIs | ✅ Ready |
| `src/features/room-booking/api/room-bookingApi.ts` | Room booking APIs | ✅ Ready |
| `src/features/feedback-report/services/report.service.ts` | Report APIs | ✅ Ready |
| `src/pages/LoginPage.tsx` | Login (TODO) | ❌ Not impl |
| `src/services/labmanager/profile.service.ts` | Profile (Mock) | 🔄 Mock |

---

## 📞 **NEXT STEPS**

1. **Backend Team:**
   - Implement Phase 1 endpoints first
   - Test with Postman
   - Provide API documentation (Swagger/OpenAPI)

2. **Frontend Team:**
   - Start with Phase 1 integration
   - Mock responses for Phase 2-5 while backend catches up
   - Test real API connections as backend rolls out

3. **Both Teams:**
   - Weekly sync on API status
   - Use provided test cases in this document
   - Standardize error response formats

---

**Document Updated:** 2026-03-18  
**See full details:** [FE_API_REQUIREMENTS.md](./FE_API_REQUIREMENTS.md)
