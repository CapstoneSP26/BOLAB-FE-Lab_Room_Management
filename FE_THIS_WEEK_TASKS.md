# 🚀 ACTION PLAN - FE TEAM THIS WEEK

**Start Date:** March 18, 2026  
**Deadline:** March 22, 2026  
**Priority:** 🔴 HIGH

---

## 📌 WHAT HAPPENED

Backend team implemented **4 key APIs**:
- ✅ Dashboard statistics
- ✅ Pending booking requests  
- ✅ Unresolved incidents
- ✅ User profile

FE can now **replace localStorage mocks** with **real API calls**!

---

## 🎯 THIS WEEK'S TASKS

### Day 1-2: User Profile Integration
**Priority:** 🔴 CRITICAL  
**Why:** Needed for auth flow

**Tasks:**
1. [ ] Update `src/services/labmanager/profile.service.ts`
   - Replace mock fetch with `axiosInstance.get('/api/users/me')`
2. [ ] Test profile loads in `UserProfilePage.tsx`
3. [ ] Add to Header/Sidebar (show logged-in user)
4. [ ] Verify error handling

**Time:** 2-3 hours

---

### Day 2-3: Dashboard Stats Integration  
**Priority:** 🟠 HIGH  
**Why:** Main landing page

**Tasks:**
1. [ ] Create `src/features/dashboard/services/dashboardStats.service.ts`
2. [ ] Create `src/features/dashboard/hooks/useDashboardStats.ts`
3. [ ] Update `ManagerDashboard.tsx` to use real data
4. [ ] Replace mock data in components:
   - [ ] `DashboardMetrics` 
   - [ ] `MonthlyBookings`
   - [ ] `CheckinComplianceToday`
   - [ ] `StatisticsChart`
5. [ ] Test auto-refresh (30s interval)

**Time:** 3-4 hours

---

### Day 3-4: Pending Requests & Incidents
**Priority:** 🟡 MEDIUM  
**Why:** Lab Manager features

**Tasks:**
1. [ ] Update `src/features/schedules/api/bookingRequestApi.ts`
   - Replace localStorage with `axiosInstance.get('/api/dashboard/pending-requests')`
2. [ ] Create/Update incident service
   - Replace localStorage with `axiosInstance.get('/api/incidents/unresolved')`
3. [ ] Update pages:
   - [ ] `BookingRequestsPendingPage.tsx`
   - [ ] `IncidentHistoryPage.tsx`
4. [ ] Test data loading and display

**Time:** 2-3 hours

---

### Day 4-5: Testing & Cleanup
**Priority:** 🟡 MEDIUM  

**Tasks:**
1. [ ] Test all 4 endpoints with real data
2. [ ] Verify token refresh on 401
3. [ ] Check error states (network error, 500, etc)
4. [ ] Remove localStorage mocks completely
5. [ ] Test in different browsers
6. [ ] Create test report

**Time:** 2-3 hours

---

## 📋 CHECKLIST - DO THIS FIRST

Before starting code:

- [ ] Read [BE_API_INTEGRATION_GUIDE.md](./BE_API_INTEGRATION_GUIDE.md)
- [ ] Review response formats for all 4 endpoints
- [ ] Check if you have valid auth token for testing
- [ ] Understand `useQuery` pattern in your codebase
- [ ] Know where localStorage mocks are located

---

## 💻 CODE TEMPLATE

Use this as starting point:

```typescript
// 1. Create service
import axiosInstance from '../../../api/axios';

export const getMyProfile = async () => {
  const response = await axiosInstance.get('/api/users/me');
  return response.data;
};

// 2. Create hook
import { useQuery } from '@tanstack/react-query';

export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: getMyProfile,
  });
};

// 3. Use in component
const { data: profile, isLoading, error } = useUserProfile();

if (isLoading) return <LoadingFallback />;
if (error) return <ErrorMessage error={error} />;

return <ProfileDisplay profile={profile} />;
```

---

## 🧪 Testing

**Before calling backend:**

```bash
# Get your token (ask backend team)
TOKEN="your-jwt-token-here"

# Test each endpoint
curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer $TOKEN"

curl http://localhost:3000/api/dashboard/stats \
  -H "Authorization: Bearer $TOKEN"

curl http://localhost:3000/api/dashboard/pending-requests \
  -H "Authorization: Bearer $TOKEN"

curl http://localhost:3000/api/incidents/unresolved \
  -H "Authorization: Bearer $TOKEN"
```

---

## ⚠️ GOTCHAS TO AVOID

1. **No Authorization Header**
   - All 4 endpoints require `Authorization: Bearer {token}`
   - axios interceptor auto-injects this ✅

2. **DateTime Format**
   - Backend sends ISO 8601 (e.g., "2026-03-18T10:00:00Z")
   - JS Date() handles this correctly ✅

3. **Null Values**
   - Some fields might be null (e.g., `mostBookedRoom`)
   - Add null checks: `data?.mostBookedRoom || "N/A"`

4. **Token Expiry**
   - If you get 401, error interceptor will auto-refresh
   - Request will retry automatically ✅

5. **localStorage Cleanup**
   - Don't forget to remove old mock data keys
   - Otherwise old data will mix with new

---

## 📈 SUCCESS CRITERIA

By end of Friday:

- [ ] All 4 endpoints tested and working
- [ ] Real data displayed on pages (not mock)
- [ ] No console errors related to APIs
- [ ] Auto-refresh working (dashboard stats)
- [ ] Error handling graceful (show error message if API fails)
- [ ] localStorage completely removed
- [ ] Documentation updated

---

## 🤝 DEPENDENCIES

**Blocking:** None! All APIs are ready.

**Nice to Have:** Login screen (currently bypassed)

---

## 📞 QUESTIONS?

**Ask Backend If:**
- API returns different format than docs
- 500 error on any endpoint
- Token format/generation help needed

**See Documentation:**
- [BE_API_INTEGRATION_GUIDE.md](./BE_API_INTEGRATION_GUIDE.md) - Full code examples
- [INTEGRATION_STATUS.md](./INTEGRATION_STATUS.md) - Current status
- [FE_API_REQUIREMENTS.md](./FE_API_REQUIREMENTS.md) - All API specs

---

## ⏰ TIMELINE

```
Mon 18:  📖 Read docs, understand endpoints
Tue 19:  👤 Integrate user profile
Wed 20:  📊 Integrate dashboard stats
Thu 21:  📋 + ⚠️ Integrate requests & incidents
Fri 22:  🧪 Test & cleanup
```

---

**Status:** 🚀 READY TO START  
**Document:** Action Plan v1  
**Last Updated:** 2026-03-18
