using System.Linq;
using MedScheduler.Api.Domain.Entities;
using MedScheduler.Api.Domain.Enums;
using MedScheduler.Api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MedScheduler.Api.Infrastructure.Repositories;

public class UserRepository(AppDbContext db) : IUserRepository
{
    public async Task<User?> GetByEmailAsync(string email) =>
        await db.Users.AsNoTracking().FirstOrDefaultAsync(x => x.Email == email);

    public async Task<User?> GetByIdAsync(Guid id) =>
        await db.Users.FindAsync(id);

    public async Task AddAsync(User user) =>
        await db.Users.AddAsync(user);

    public async Task<List<User>> GetByRoleAsync(UserRole role) =>
        await db.Users
            .AsNoTracking()
            .Where(u => u.Role == role)
            .OrderBy(u => u.Name)
            .ToListAsync();

    public Task SaveAsync() => db.SaveChangesAsync();
}

public class AppointmentRepository(AppDbContext db) : IAppointmentRepository
{
    public async Task AddAsync(Appointment appt) =>
        await db.Appointments.AddAsync(appt);

    public async Task<List<Appointment>> GetByPatientAsync(Guid patientId) =>
        await db.Appointments
            .AsNoTracking()
            .Where(a => a.PatientId == patientId)
            .OrderByDescending(a => a.DateTime)
            .ToListAsync();

    public async Task<List<Appointment>> GetByDoctorAndDateAsync(Guid doctorId, DateTime date)
    {
        var start = date.Date;
        var end   = start.AddDays(1);

        return await db.Appointments
            .AsNoTracking()
            .Include(a => a.Patient)
            .Where(a => a.DoctorId == doctorId && a.DateTime >= start && a.DateTime < end)
            .OrderBy(a => a.DateTime)
            .ToListAsync();
    }

    public Task SaveAsync() => db.SaveChangesAsync();
}
