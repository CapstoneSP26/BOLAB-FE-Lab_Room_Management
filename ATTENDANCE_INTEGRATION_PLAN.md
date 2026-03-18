# 📋 Attendance Feature - Frontend ↔ Backend Integration Plan

## 🎯 Current State Analysis

### Backend Ready ✅
```
GET  /api/attendances/schedule/{scheduleId}     → getAttendanceList
POST /api/attendances/submit                     → submitAttendance
```

### Frontend Currently Uses ❌
```
GET  /api/attendance/qr-session                  ← NOT IN BACKEND
GET  /api/attendance/qr-session/{id}             ← NOT IN BACKEND
POST /api/attendance/qr-session/refresh          ← NOT IN BACKEND
POST /api/attendance/qr-session/{id}/end         ← NOT IN BACKEND
GET  /api/attendance/session/{id}/students       ← Partially (should be /schedule/{scheduleId})
POST /api/attendance/mark                        ← NOT DESIGNED YET
```

---

## 🔄 Mapping Strategy

### Layer 1: Terminology Alignment
| Concept | Backend | Frontend | Action |
|---------|---------|----------|--------|
| Class Session | ScheduleId | sessionId | Map 1:1 |
| Student List | GroupMember | StudentAttendance[] | Transform DTO |
| Mark Attendance | SubmitAttendance | (No direct equivalent) | CREATE NEW |
| QR Session Mgmt | NOT EXISTS | Uses QRSession | **DECISION NEEDED** |

### Option A: Frontend QR Management (No Backend Changes) ⚡
```
Frontend manages QR session state locally
- sessionId = ScheduleId (same value)
- QR token generated on client
- No backend QR endpoints needed
- Less server load
```

### Option B: Backend QR Session API 🏗️
```
Implement 3 new backend endpoints:
POST   /api/attendances/qr-session/create
POST   /api/attendances/qr-session/{id}/refresh
POST   /api/attendances/qr-session/{id}/end

Requires DB schema: AttendanceSession table
More complex but unified architecture
```

---

## 📊 DTO Mapping

### GetAttendanceList Response
**Backend:** `GET /api/attendances/schedule/{scheduleId}`
```json
{
  "data": [
    {
      "userId": "guid",
      "fullName": "string",
      "studentCode": "string",
      "email": "string",
      "status": "NotYet|Present|Absent|Late",
      "checkInTime": "2024-01-01T10:30:00Z"
    }
  ]
}
```

**Frontend Expected:** Same structure ✅

### SubmitAttendance Request
**Backend:** `POST /api/attendances/submit`
```json
{
  "scheduleId": "guid",
  "attendanceItems": [
    {
      "userId": "guid",
      "status": "NotYet|Present|Absent|Late"
    }
  ]
}
```

**Frontend Must Send:** This exact format ✅

---

## ⚠️ Issues to Fix

### Issue 1: AttendanceStatus Enum Mismatch
**Frontend has:** `present | absent | late`
**Backend has:** `NotYet | Present | Absent` (❌ Missing Late)

**Solution:** Extend backend enum first
```csharp
public enum AttendanceStatus
{
    NotYet,    // Not marked yet
    Present,   // Marked present (on time)
    Late,      // ← ADD THIS
    Absent     // Marked absent
}
```

### Issue 2: API Path Inconsistency
**Frontend uses:** `/api/attendance/session/{id}/students`
**Backend expects:** `/api/attendances/schedule/{scheduleId}`

**Solution:** Update frontend service layer

### Issue 3: Mark Attendance Endpoint
**Frontend:** `POST /api/attendance/mark` (for QR scan)
**Backend:** No direct equivalent - need to clarify

**Options:**
- A) Same as `POST /api/attendances/submit` (batch update)
- B) New endpoint `POST /api/attendances/{studentId}/checkin` (single student)
- C) QR endpoint outside this feature (separate flow)

---

## 🛠️ Implementation Roadmap

### Phase 1: Align Existing Endpoints ✅ PRIORITY
1. Update `attendance.service.ts` paths to match backend
   - Change `/api/attendance/session/{id}/students` → `/api/attendances/schedule/{scheduleId}`
   - Change `/api/attendances/submit` endpoint (already correct)

2. Update types to match backend DTOs
   - AttendanceStatus alignment
   - Button/UI label mapping

3. Update hooks to use correct endpoints

### Phase 2: Quick Win - Remove Non-Existent APIs ⚠️
Remove or stub these (causing 404 errors):
   - `GET /api/attendance/qr-session`
   - `POST /api/attendance/qr-session/refresh`
   - `POST /api/attendance/qr-session/{id}/end`

**Decision:** Option A (frontend-only QR) OR Option B (implement backend first)

### Phase 3: Backend Enhancement (If Needed)
If choosing Option B:
1. Add `AttendanceSession` entity OR extend `Attendance`
2. Implement QR session CRUD endpoints
3. Add QR token refresh logic
4. Add security checks

### Phase 4: Frontend Refactor
Complete integration with backend endpoints

---

## 📝 Files to Modify

### Frontend Changes Needed
```
src/features/attendance/
├── types.ts                          ← Fix AttendanceStatus enum
├── services/attendance.service.ts    ← Fix API paths + add QR decision
└── hooks/
    ├── useAttendance.ts              ← Update query keys
    └── useQRSession.ts               ← QR decision logic
```

### Backend Changes (If Option B)
```
Features/Attendances/
├── Entities/AttendanceSession.cs     ← NEW
├── Commands/
│   ├── CreateQRSessionCommand.cs     ← NEW
│   ├── RefreshQRTokenCommand.cs      ← NEW
│   └── EndQRSessionCommand.cs        ← NEW
└── Queries/
    └── GetAttendanceListQuery.cs     ← Already exists
```

---

## 🚀 Quick Start Decision Tree

```
START
  ↓
Q: Do you need real-time QR session tracking on server?
  ├─ YES → Option B (Backend QR Management) [3-5 days work]
  └─ NO  → Option A (Frontend QR Only) [2-3 days work] ← RECOMMENDED
           (Just use ScheduleId as sessionId)
           ↓
Option A: Simplified Path
  ├─ Fix service layer paths
  ├─ Sync enum values
  ├─ Test with mock backend
  └─ DONE ✅

Option B: Server-Managed Sessions
  ├─ Implement 3 new endpoints
  ├─ Add DB schema
  ├─ Update frontend to consume
  └─ DONE ✅ (but more work)
```

---

## ✅ Validation Checklist

- [ ] Backend enum includes `Late` status
- [ ] Frontend service uses `/api/attendances/...` paths (not `/api/attendance/...`)
- [ ] ScheduleId = SessionId mapping clarified
- [ ] DTOs match exactly (case-sensitive!)
- [ ] QR management strategy decided (A or B)
- [ ] All 4 endpoints tested with backend
- [ ] Error handling for 401/403/404
- [ ] Loading/retry logic functional

---

## 📞 Next Steps

**Your feedback needed on:**
1. ✅ QR Management: Option A or B?
2. ✅ Backend enum: Add `Late` status?
3. ✅ Single checkin endpoint: Do you need POST `/api/attendances/{studentId}/checkin`?

Once decided, I'll implement the frontend changes immediately! 🚀
