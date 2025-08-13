using MedScheduler.Api.Domain.Entities;

namespace MedScheduler.Api.Infrastructure.Repositories;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByIdAsync(Guid id);
    Task AddAsync(User user);
    Task SaveAsync();
}

public interface IAppointmentRepository
{
    Task AddAsync(Appointment appt);
    Task<List<Appointment>> GetByPatientAsync(Guid patientId);
    Task<List<Appointment>> GetByDoctorAndDateAsync(Guid doctorId, DateTime date);
    Task SaveAsync();
}
