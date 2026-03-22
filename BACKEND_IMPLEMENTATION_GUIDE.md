# 🎯 Option B Implementation Guide - Backend QR Session Management

## 📋 Overview

Bạn cần implement 3 features chính:

1. **Extend AttendanceStatus enum** - Thêm `Late` status
2. **Create AttendanceSession entity** - Lưu QR session info
3. **Implement 3 CQRS operations** - Create/Refresh/End QR
4. **Add Endpoints** - Controller routes

---

## ✅ Step 1: Extend AttendanceStatus Enum

**File:** `Features/Attendances/Enums/AttendanceStatus.cs`

```csharp
namespace BookLAB.Domain.Features.Attendances.Enums;

public enum AttendanceStatus
{
    NotYet = 0,    // Chưa điểm danh
    Present = 1,   // Điểm danh đúng giờ
    Late = 2,      // Điểm danh muộn ← NEW
    Absent = 3     // Vắng
}
```

---

## ✅ Step 2: Create AttendanceSession Entity

**File:** `Features/Attendances/Entities/AttendanceSession.cs`

```csharp
namespace BookLAB.Domain.Features.Attendances.Entities;

using System;
using BookLAB.Domain.Common;
using BookLAB.Domain.Common.Auditing;
using BookLAB.Domain.Features.Attendances.Enums;

public class AttendanceSession : BaseEntity, IAuditable, IUserTrackable
{
    /// <summary>
    /// Reference to Schedule (lab class session)
    /// </summary>
    public Guid ScheduleId { get; set; }

    /// <summary>
    /// QR Code token - unique per session
    /// </summary>
    public string QRToken { get; set; } = default!;

    /// <summary>
    /// When QR code expires
    /// </summary>
    public DateTimeOffset QRExpiry { get; set; }

    /// <summary>
    /// Is this session currently active?
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Total students expected
    /// </summary>
    public int TotalStudents { get; set; }

    /// <summary>
    /// Students marked as Present
    /// </summary>
    public int PresentCount { get; set; }

    /// <summary>
    /// Students marked as Late
    /// </summary>
    public int LateCount { get; set; }

    /// <summary>
    /// Students marked as Absent
    /// </summary>
    public int AbsentCount { get; set; }

    /// <summary>
    /// Session created at
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; }

    /// <summary>
    /// Session updated at
    /// </summary>
    public DateTimeOffset? UpdatedAt { get; set; }

    /// <summary>
    /// Who created the session (Lecturer)
    /// </summary>
    public Guid? CreatedBy { get; set; }

    /// <summary>
    /// Who updated the session
    /// </summary>
    public Guid? UpdatedBy { get; set; }
}
```

---

## ✅ Step 3: Commands & Queries

### 3a. CreateAttendanceSessionCommand

**File:** `Features/Attendances/Commands/CreateAttendanceSession/CreateAttendanceSessionCommand.cs`

```csharp
namespace BookLAB.Application.Features.Attendances.Commands.CreateAttendanceSession;

using MediatR;

public class CreateAttendanceSessionCommand : IRequest<CreateAttendanceSessionResponse>
{
    public Guid ScheduleId { get; set; }
    public int ExpiryMinutes { get; set; } = 60; // Default 1 hour
}
```

**File:** `Features/Attendances/Commands/CreateAttendanceSession/CreateAttendanceSessionResponse.cs`

```csharp
namespace BookLAB.Application.Features.Attendances.Commands.CreateAttendanceSession;

public class CreateAttendanceSessionResponse
{
    public Guid SessionId { get; set; }
    public string QRToken { get; set; }
    public DateTimeOffset QRExpiry { get; set; }
    public bool IsActive { get; set; }
}
```

**File:** `Features/Attendances/Commands/CreateAttendanceSession/CreateAttendanceSessionHandler.cs`

```csharp
namespace BookLAB.Application.Features.Attendances.Commands.CreateAttendanceSession;

using System;
using System.Threading;
using System.Threading.Tasks;
using BookLAB.Domain.Features.Schedules;
using BookLAB.Domain.Features.Attendances.Entities;
using BookLAB.Infrastructure.Persistence;
using MediatR;

public class CreateAttendanceSessionHandler 
    : IRequestHandler<CreateAttendanceSessionCommand, CreateAttendanceSessionResponse>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public CreateAttendanceSessionHandler(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<CreateAttendanceSessionResponse> Handle(
        CreateAttendanceSessionCommand request, 
        CancellationToken cancellationToken)
    {
        // Step 1: Get Schedule
        var schedule = await _context.GetEntityByIdAsync<Schedule>(
            request.ScheduleId, 
            cancellationToken);
        
        if (schedule == null)
            throw new NotFoundException($"Schedule {request.ScheduleId} not found");

        // Step 2: Security check - Verify current user is lecturer
        if (schedule.LecturerId != _currentUser.UserId)
            throw new UnauthorizedAccessException("Only lecturer can create QR session");

        // Step 3: Invalidate existing active sessions
        var existingSession = await _context.AttendanceSessions
            .FirstOrDefaultAsync(s => s.ScheduleId == request.ScheduleId && s.IsActive, cancellationToken);
        
        if (existingSession != null)
        {
            existingSession.IsActive = false;
            existingSession.UpdatedAt = DateTimeOffset.UtcNow;
            existingSession.UpdatedBy = _currentUser.UserId;
        }

        // Step 4: Generate QR Token
        var qrToken = GenerateQRToken();
        var qrExpiry = DateTimeOffset.UtcNow.AddMinutes(request.ExpiryMinutes);

        // Step 5: Get total students from schedule's group
        var totalStudents = await _context.GroupMembers
            .CountAsync(gm => gm.GroupId == schedule.GroupId, cancellationToken);

        // Step 6: Create new session
        var session = new AttendanceSession
        {
            ScheduleId = request.ScheduleId,
            QRToken = qrToken,
            QRExpiry = qrExpiry,
            IsActive = true,
            TotalStudents = totalStudents,
            PresentCount = 0,
            LateCount = 0,
            AbsentCount = 0,
            CreatedAt = DateTimeOffset.UtcNow,
            CreatedBy = _currentUser.UserId
        };

        await _context.AttendanceSessions.AddAsync(session, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return new CreateAttendanceSessionResponse
        {
            SessionId = session.Id,
            QRToken = qrToken,
            QRExpiry = qrExpiry,
            IsActive = true
        };
    }

    private string GenerateQRToken()
    {
        // Generate unique token: timestamp + random + hash
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var randomPart = Convert.ToBase64String(Guid.NewGuid().ToByteArray()).Substring(0, 8);
        return $"QR_{timestamp}_{randomPart}";
    }
}
```

### 3b. RefreshQRTokenCommand

**File:** `Features/Attendances/Commands/RefreshQRToken/RefreshQRTokenCommand.cs`

```csharp
namespace BookLAB.Application.Features.Attendances.Commands.RefreshQRToken;

using MediatR;

public class RefreshQRTokenCommand : IRequest<RefreshQRTokenResponse>
{
    public Guid SessionId { get; set; }
    public int ExpiryMinutes { get; set; } = 60;
}
```

**File:** `Features/Attendances/Commands/RefreshQRToken/RefreshQRTokenHandler.cs`

```csharp
namespace BookLAB.Application.Features.Attendances.Commands.RefreshQRToken;

using System;
using System.Threading;
using System.Threading.Tasks;
using BookLAB.Domain.Features.Attendances.Entities;
using BookLAB.Infrastructure.Persistence;
using MediatR;

public class RefreshQRTokenHandler : IRequestHandler<RefreshQRTokenCommand, RefreshQRTokenResponse>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public RefreshQRTokenHandler(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<RefreshQRTokenResponse> Handle(
        RefreshQRTokenCommand request, 
        CancellationToken cancellationToken)
    {
        // Get session
        var session = await _context.AttendanceSessions
            .FirstOrDefaultAsync(s => s.Id == request.SessionId, cancellationToken);

        if (session == null)
            throw new NotFoundException($"AttendanceSession {request.SessionId} not found");

        // Security: Only creator can refresh
        if (session.CreatedBy != _currentUser.UserId)
            throw new UnauthorizedAccessException("Only session creator can refresh token");

        // Generate new token
        var newToken = GenerateQRToken();
        var newExpiry = DateTimeOffset.UtcNow.AddMinutes(request.ExpiryMinutes);

        session.QRToken = newToken;
        session.QRExpiry = newExpiry;
        session.UpdatedAt = DateTimeOffset.UtcNow;
        session.UpdatedBy = _currentUser.UserId;

        _context.AttendanceSessions.Update(session);
        await _context.SaveChangesAsync(cancellationToken);

        return new RefreshQRTokenResponse
        {
            QRToken = newToken,
            QRExpiry = newExpiry
        };
    }

    private string GenerateQRToken()
    {
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var randomPart = Convert.ToBase64String(Guid.NewGuid().ToByteArray()).Substring(0, 8);
        return $"QR_{timestamp}_{randomPart}";
    }
}
```

### 3c. EndAttendanceSessionCommand

**File:** `Features/Attendances/Commands/EndAttendanceSession/EndAttendanceSessionCommand.cs`

```csharp
namespace BookLAB.Application.Features.Attendances.Commands.EndAttendanceSession;

using MediatR;

public class EndAttendanceSessionCommand : IRequest<EndAttendanceSessionResponse>
{
    public Guid SessionId { get; set; }
}
```

**File:** `Features/Attendances/Commands/EndAttendanceSession/EndAttendanceSessionHandler.cs`

```csharp
namespace BookLAB.Application.Features.Attendances.Commands.EndAttendanceSession;

using System;
using System.Threading;
using System.Threading.Tasks;
using BookLAB.Domain.Features.Attendances.Entities;
using BookLAB.Infrastructure.Persistence;
using MediatR;

public class EndAttendanceSessionHandler 
    : IRequestHandler<EndAttendanceSessionCommand, EndAttendanceSessionResponse>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public EndAttendanceSessionHandler(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<EndAttendanceSessionResponse> Handle(
        EndAttendanceSessionCommand request, 
        CancellationToken cancellationToken)
    {
        var session = await _context.AttendanceSessions
            .FirstOrDefaultAsync(s => s.Id == request.SessionId, cancellationToken);

        if (session == null)
            throw new NotFoundException($"AttendanceSession {request.SessionId} not found");

        // Security check
        if (session.CreatedBy != _currentUser.UserId)
            throw new UnauthorizedAccessException("Only session creator can end session");

        session.IsActive = false;
        session.UpdatedAt = DateTimeOffset.UtcNow;
        session.UpdatedBy = _currentUser.UserId;

        _context.AttendanceSessions.Update(session);
        await _context.SaveChangesAsync(cancellationToken);

        return new EndAttendanceSessionResponse { Success = true };
    }
}
```

### 3d. GetAttendanceSessionQuery

**File:** `Features/Attendances/Queries/GetAttendanceSession/GetAttendanceSessionQuery.cs`

```csharp
namespace BookLAB.Application.Features.Attendances.Queries.GetAttendanceSession;

using MediatR;

public class GetAttendanceSessionQuery : IRequest<GetAttendanceSessionResponse>
{
    public Guid SessionId { get; set; }
}
```

**File:** `Features/Attendances/Queries/GetAttendanceSession/GetAttendanceSessionHandler.cs`

```csharp
namespace BookLAB.Application.Features.Attendances.Queries.GetAttendanceSession;

using System.Threading;
using System.Threading.Tasks;
using BookLAB.Infrastructure.Persistence;
using MediatR;

public class GetAttendanceSessionHandler 
    : IRequestHandler<GetAttendanceSessionQuery, GetAttendanceSessionResponse>
{
    private readonly IApplicationDbContext _context;

    public GetAttendanceSessionHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<GetAttendanceSessionResponse> Handle(
        GetAttendanceSessionQuery request, 
        CancellationToken cancellationToken)
    {
        var session = await _context.AttendanceSessions
            .Include(s => s.Schedule)
            .FirstOrDefaultAsync(s => s.Id == request.SessionId, cancellationToken);

        if (session == null)
            throw new NotFoundException($"Session {request.SessionId} not found");

        return new GetAttendanceSessionResponse
        {
            SessionId = session.Id,
            ScheduleId = session.ScheduleId,
            QRToken = session.QRToken,
            QRExpiry = session.QRExpiry,
            IsActive = session.IsActive,
            TotalStudents = session.TotalStudents,
            PresentCount = session.PresentCount,
            LateCount = session.LateCount,
            AbsentCount = session.AbsentCount
        };
    }
}
```

---

## ✅ Step 4: Add DbContext Mapping

**File:** `Infrastructure/Persistence/ApplicationDbContext.cs`

```csharp
public DbSet<AttendanceSession> AttendanceSessions { get; set; }

protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    // ... existing mappings ...
    
    modelBuilder.Entity<AttendanceSession>(entity =>
    {
        entity.HasKey(e => e.Id);
        
        entity.Property(e => e.ScheduleId).IsRequired();
        entity.Property(e => e.QRToken).IsRequired();
        entity.Property(e => e.QRExpiry).IsRequired();
        entity.Property(e => e.IsActive).IsRequired();
        entity.Property(e => e.TotalStudents).IsRequired();
        
        entity.HasIndex(e => e.ScheduleId);
        entity.HasIndex(e => e.QRToken).IsUnique();
    });
}
```

---

## ✅ Step 5: Add Controller Endpoints

**File:** `Features/Attendances/Commands/Controllers/AttendancesController.cs`

```csharp
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AttendancesController : ControllerBase
{
    private readonly IMediator _mediator;

    public AttendancesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    // Existing endpoints...
    [HttpGet("schedule/{scheduleId:guid}")]
    public async Task<ActionResult<GetAttendanceListResponse>> GetAttendanceList(Guid scheduleId)
    {
        return Ok(await _mediator.Send(new GetAttendanceListQuery { ScheduleId = scheduleId }));
    }

    [HttpPost("submit")]
    public async Task<ActionResult> SubmitAttendance(SubmitAttendanceCommand command)
    {
        await _mediator.Send(command);
        return Ok(new { Message = "Attendance submitted successfully" });
    }

    // ============ NEW ENDPOINTS ============

    /// <summary>
    /// Create QR session for a schedule
    /// POST /api/attendances/qr-session/create
    /// </summary>
    [HttpPost("qr-session/create")]
    public async Task<ActionResult<CreateAttendanceSessionResponse>> CreateQRSession(
        [FromBody] CreateAttendanceSessionCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(new { data = result });
    }

    /// <summary>
    /// Get QR session details
    /// GET /api/attendances/qr-session/{sessionId}
    /// </summary>
    [HttpGet("qr-session/{sessionId:guid}")]
    public async Task<ActionResult<GetAttendanceSessionResponse>> GetQRSession(Guid sessionId)
    {
        var result = await _mediator.Send(new GetAttendanceSessionQuery { SessionId = sessionId });
        return Ok(new { data = result });
    }

    /// <summary>
    /// Refresh QR token
    /// POST /api/attendances/qr-session/{sessionId}/refresh
    /// </summary>
    [HttpPost("qr-session/{sessionId:guid}/refresh")]
    public async Task<ActionResult<RefreshQRTokenResponse>> RefreshQRToken(
        Guid sessionId,
        [FromBody] int expiryMinutes = 60)
    {
        var result = await _mediator.Send(new RefreshQRTokenCommand 
        { 
            SessionId = sessionId, 
            ExpiryMinutes = expiryMinutes 
        });
        return Ok(new { data = result });
    }

    /// <summary>
    /// End QR session
    /// POST /api/attendances/qr-session/{sessionId}/end
    /// </summary>
    [HttpPost("qr-session/{sessionId:guid}/end")]
    public async Task<ActionResult<EndAttendanceSessionResponse>> EndQRSession(Guid sessionId)
    {
        var result = await _mediator.Send(new EndAttendanceSessionCommand { SessionId = sessionId });
        return Ok(new { data = result });
    }
}
```

---

## ✅ Step 6: Update Attendance.Submit to reference AttendanceSession

**Modify:** `Features/Attendances/Commands/SubmitAttendance/SubmitAttendanceHandler.cs`

```csharp
// When marking attendance, update session counts:

if (existingRecord == null)
{
    // Create new Attendance record
    var attendance = new Attendance
    {
        ScheduleId = request.ScheduleId,
        UserId = item.UserId,
        AttendanceStatus = item.Status,
        CheckInMethod = AttendanceCheckInMethod.Manual,
        CheckInTime = item.Status == AttendanceStatus.Present 
            ? DateTimeOffset.UtcNow 
            : null,
        CreatedAt = DateTimeOffset.UtcNow,
        CreatedBy = _currentUser.UserId
    };
    
    await _context.Attendances.AddAsync(attendance);
}
else
{
    // Update existing record
    existingRecord.AttendanceStatus = item.Status;
    existingRecord.UpdatedAt = DateTimeOffset.UtcNow;
    existingRecord.UpdatedBy = _currentUser.UserId;
}

// Update session counts
var session = await _context.AttendanceSessions
    .FirstOrDefaultAsync(s => s.ScheduleId == request.ScheduleId);

if (session != null)
{
    session.PresentCount = await _context.Attendances
        .CountAsync(a => a.ScheduleId == request.ScheduleId 
            && a.AttendanceStatus == AttendanceStatus.Present);
    
    session.LateCount = await _context.Attendances
        .CountAsync(a => a.ScheduleId == request.ScheduleId 
            && a.AttendanceStatus == AttendanceStatus.Late);
    
    session.AbsentCount = await _context.Attendances
        .CountAsync(a => a.ScheduleId == request.ScheduleId 
            && a.AttendanceStatus == AttendanceStatus.Absent);
}

await _context.SaveChangesAsync();
```

---

## 🗂️ Final File Structure

```
Features/Attendances/
├── Entities/
│   ├── Attendance.cs          (existing)
│   └── AttendanceSession.cs   ← NEW
│
├── Enums/
│   └── AttendanceStatus.cs    ← MODIFY (add Late)
│
├── Commands/
│   ├── SubmitAttendance/
│   │   ├── SubmitAttendanceCommand.cs
│   │   └── SubmitAttendanceHandler.cs
│   ├── CreateAttendanceSession/    ← NEW
│   ├── RefreshQRToken/             ← NEW
│   └── EndAttendanceSession/        ← NEW
│
├── Queries/
│   ├── GetAttendanceList/
│   │   ├── GetAttendanceListQuery.cs
│   │   └── GetAttendanceListHandler.cs
│   └── GetAttendanceSession/        ← NEW
│
└── Controllers/
    └── AttendancesController.cs     ← MODIFY (add 3 new endpoints)
```

---

## 📝 Database Migration

After implementing all code, create migration:

```powershell
dotnet ef migrations add AddAttendanceSessionEntity
dotnet ef database update
```

---

## ✅ Checklist

- [ ] Add `Late` to AttendanceStatus enum
- [ ] Create AttendanceSession entity
- [ ] Implement CreateAttendanceSessionCommand
- [ ] Implement RefreshQRTokenCommand
- [ ] Implement EndAttendanceSessionCommand
- [ ] Implement GetAttendanceSessionQuery
- [ ] Update DbContext with AttendanceSession mapping
- [ ] Add 3 new endpoints to controller
- [ ] Update SubmitAttendance to update session counts
- [ ] Create database migration
- [ ] Test endpoints with Postman

---

## 🚀 Next: Frontend Implementation

Once backend is ready, I'll update frontend to:
1. Use `/api/attendances/qr-session/create` endpoint
2. Store sessionId from response
3. Refresh and end sessions
4. Sync updated AttendanceStatus enum

Let me know once you've implemented these! ✅
