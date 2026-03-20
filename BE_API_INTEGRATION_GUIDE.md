# 🔌 FE INTEGRATION GUIDE - 4 New Backend APIs

**Date:** March 18, 2026  
**Status:** ✅ Backend APIs Ready  
**Priority:** HIGH - Implement This Week!

---

## 📡 4 APIs Now Available

Backend team vừa implement 4 endpoints. Frontend có thể kết nối ngay!

### Quick Reference

```typescript
// All require: Authorization: Bearer {token}

// 1. Dashboard Stats
GET /api/dashboard/stats
→ Response: DashboardStatsDto (12 fields)
→ Use in: ManagerDashboard, DashboardMetrics

// 2. Pending Booking Requests  
GET /api/dashboard/pending-requests
→ Response: Array<PendingRequestDto>
→ Use in: BookingRequestsPendingPage

// 3. Unresolved Incidents
GET /api/incidents/unresolved
→ Response: Array<IncidentDto>
→ Use in: IncidentHistoryPage

// 4. User Profile
GET /api/users/me
→ Response: UserProfileDto
→ Use in: UserProfilePage
```

---

## 🎯 Frontend Files to Update

### 1️⃣ Dashboard Stats Integration

**File:** `src/features/dashboard/services/dashboardStats.service.ts` (Create New)

```typescript
import axiosInstance from '../../../api/axios';

export interface DashboardStatsDto {
  totalBookings: number;
  pendingBookings: number;
  approvedBookings: number;
  rejectedBookings: number;
  totalIncidents: number;
  unresolvedIncidents: number;
  totalRooms: number;
  availableRooms: number;
  totalStudents: number;
  totalLecturers: number;
  averageBookingDuration: number;
  mostBookedRoom: string;
  busiestHourOfDay: number;
}

export const getDashboardStats = async (): Promise<DashboardStatsDto> => {
  const response = await axiosInstance.get<DashboardStatsDto>(
    '/api/dashboard/stats'
  );
  return response.data;
};
```

**Hook:** `src/features/dashboard/hooks/useDashboardStats.ts` (Create New)

```typescript
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '../services/dashboardStats.service';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
    refetchInterval: 30 * 1000, // Refresh every 30s
  });
};
```

**Usage in Component:**

```typescript
// src/pages/labmanager/ManagerDashboard.tsx
import { useDashboardStats } from '../../features/dashboard/hooks/useDashboardStats';

export default function ManagerDashboard() {
  const { data: stats, isLoading, error } = useDashboardStats();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading dashboard</div>;

  return (
    <div>
      {/* Replace mock data with real data */}
      <DashboardMetrics stats={stats} />
      <MonthlyBookings stats={stats} />
      {/* ... */}
    </div>
  );
}
```

---

### 2️⃣ Pending Booking Requests Integration

**File:** `src/features/schedules/services/bookingRequestService.ts` (Update)

```typescript
import axiosInstance from '../../../api/axios';

export interface PendingRequestDto {
  bookingId: string;
  labRoomName: string;
  buildingName: string;
  requesterName: string;
  requesterEmail: string;
  startTime: string;
  endTime: string;
  expectedStudents: number;
  purpose: string;
  requestedAt: string;
}

// Replace localStorage mock with real API
export const getPendingRequests = async (
): Promise<PendingRequestDto[]> => {
  const response = await axiosInstance.get<PendingRequestDto[]>(
    '/api/dashboard/pending-requests'
  );
  return response.data;
};
```

**Usage:**

```typescript
// src/pages/labmanager/BookingRequestsPendingPage.tsx
import { getPendingRequests } from '../../features/schedules/services/bookingRequestService';

export default function BookingRequestsPendingPage() {
  const { data: requests, isLoading } = useQuery({
    queryKey: ['pending-requests'],
    queryFn: getPendingRequests,
    refetchInterval: 10 * 1000, // Auto-refresh
  });

  return (
    <div>
      <PageBreadcrumb pageTitle="Pending Booking Requests" />
      {isLoading && <LoadingFallback />}
      {requests?.map(req => (
        <RequestCard
          key={req.bookingId}
          request={req}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      ))}
    </div>
  );
}
```

---

### 3️⃣ Unresolved Incidents Integration

**File:** `src/features/incident-history/services/incidentService.ts` (Create/Update)

```typescript
import axiosInstance from '../../../api/axios';

export interface IncidentDto {
  incidentId: string;
  labRoomName: string;
  description: string;
  isResolved: boolean;
  createdAt: string;
  createdByName: string;
  daysOpenCount: number;
}

// Replace localStorage mock with real API
export const getUnresolvedIncidents = async (): Promise<IncidentDto[]> => {
  const response = await axiosInstance.get<IncidentDto[]>(
    '/api/incidents/unresolved'
  );
  return response.data;
};
```

**Usage:**

```typescript
// src/pages/labmanager/IncidentHistoryPage.tsx
import { getUnresolvedIncidents } from '../services/incidentService';

export default function IncidentHistoryPage() {
  const { data: incidents, isLoading } = useQuery({
    queryKey: ['unresolved-incidents'],
    queryFn: getUnresolvedIncidents,
  });

  return (
    <div>
      <PageBreadcrumb pageTitle="Incident History" />
      {isLoading && <LoadingFallback />}
      {incidents?.map(incident => (
        <IncidentCard
          key={incident.incidentId}
          incident={incident}
          severity={getSeverity(incident.daysOpenCount)}
        />
      ))}
    </div>
  );
}
```

---

### 4️⃣ User Profile Integration

**File:** `src/services/labmanager/profile.service.ts` (Update)

```typescript
import axiosInstance from '../../api/axios';

export interface UserProfileDto {
  id: string;
  email: string;
  fullName: string;
  userCode: string;
  campusName: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export const profileService = {
  // Replace localStorage mock with real API
  async getMe(): Promise<UserProfileDto> {
    const response = await axiosInstance.get<UserProfileDto>(
      '/api/users/me'
    );
    return response.data;
  },
};
```

**Usage:**

```typescript
// src/pages/labmanager/UserProfilePage.tsx
import { useQuery } from '@tanstack/react-query';
import { profileService } from '../../services/labmanager/profile.service';

export default function UserProfilePage() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => profileService.getMe(),
  });

  if (isLoading) return <LoadingFallback />;

  return (
    <div>
      <PageBreadcrumb pageTitle="User Profile" />
      <ProfileCard profile={profile} />
    </div>
  );
}
```

---

## 📋 Implementation Checklist

### Phase 1: Create/Update Service Layers
- [ ] Create `dashboardStats.service.ts`
- [ ] Update `bookingRequestService.ts`
- [ ] Create/Update `incidentService.ts`
- [ ] Update `profile.service.ts`

### Phase 2: Create Hooks
- [ ] `useDashboardStats.ts`
- [ ] `usePendingRequests.ts` (if needed)
- [ ] `useUnresolvedIncidents.ts` (if needed)

### Phase 3: Update Components/Pages
- [ ] `src/pages/labmanager/ManagerDashboard.tsx`
- [ ] `src/pages/labmanager/BookingRequestsPendingPage.tsx`
- [ ] `src/pages/labmanager/IncidentHistoryPage.tsx`
- [ ] `src/pages/labmanager/UserProfilePage.tsx`

### Phase 4: Testing
- [ ] Test each API connection with real data
- [ ] Verify error handling
- [ ] Check loading states
- [ ] Test token refresh flow
- [ ] Remove localStorage mock data after testing

---

## 🔄 Migration Strategy: Mock → Real Data

### Before (Using localStorage)
```typescript
// Old approach
const incidents = JSON.parse(localStorage.getItem('incidents') || '[]');
```

### After (Using Real API)
```typescript
// New approach
const { data: incidents } = useQuery({
  queryKey: ['unresolved-incidents'],
  queryFn: getUnresolvedIncidents,
});
```

**Files to Remove localStorage from:**
1. `src/features/incident-history/api/incidentHistoryApi.ts` - Keep structure, just fetch from API
2. `src/services/labmanager/profile.service.ts` - Already partially done
3. `src/features/schedules/api/bookingRequestApi.ts` - Replace with real API

---

## 🧪 Testing with Postman

```bash
# Test Dashboard Stats
curl -X GET http://localhost:3000/api/dashboard/stats \
  -H "Authorization: Bearer {YOUR_TOKEN}"

# Test Pending Requests
curl -X GET http://localhost:3000/api/dashboard/pending-requests \
  -H "Authorization: Bearer {YOUR_TOKEN}"

# Test Unresolved Incidents
curl -X GET http://localhost:3000/api/incidents/unresolved \
  -H "Authorization: Bearer {YOUR_TOKEN}"

# Test User Profile
curl -X GET http://localhost:3000/api/users/me \
  -H "Authorization: Bearer {YOUR_TOKEN}"
```

---

## ⚠️ Important Notes

1. **Authorization:** All endpoints require valid JWT token in header
2. **DateTime Format:** Backend returns ISO 8601 format (compatible with JS Date)
3. **Null Handling:** Some fields might be null (e.g., `mostBookedRoom`), add null checks
4. **Error Handling:** If 401 returned, token likely expired - axios interceptor will refresh
5. **Polling:** Dashboard stats should refresh every 30s, others as needed

---

## 🚀 Priority Implementation Order

1. **CRITICAL:** User Profile (`/api/users/me`)
   - Required for auth flow
   - Use in header/sidebar

2. **HIGH:** Dashboard Stats (`/api/dashboard/stats`)
   - Main landing page
   - Quick visual dashboard

3. **MEDIUM:** Pending Requests (`/api/dashboard/pending-requests`)
   - Lab manager feature
   - Show pending approvals

4. **MEDIUM:** Unresolved Incidents (`/api/incidents/unresolved`)
   - Lab manager feature
   - Show maintenance issues

---

## 📚 Related Files

| File | Purpose | Status |
|------|---------|--------|
| `src/api/axios.ts` | HTTP client | ✅ Ready (token refresh built-in) |
| `src/app/routes.ts` | Routes config | ✅ Ready (all routes defined) |
| `src/pages/labmanager/*` | Pages | ✅ Ready (need data updates) |
| `FE_API_REQUIREMENTS.md` | API specs | 🔄 Update with new endpoints |
| `INTEGRATION_STATUS.md` | Status report | 🔄 Mark as integrated |

---

## 📞 QA Before Going Live

- [ ] All 4 endpoints responding with correct data
- [ ] Authorization working (token validation)
- [ ] Error states handled gracefully
- [ ] Loading states display properly
- [ ] Data displays correctly in components
- [ ] Refresh intervals working
- [ ] No memory leaks from queries

---

**Next Update:** After Phase 1 implementation complete

**Backend APIs Ready Since:** 2026-03-18
