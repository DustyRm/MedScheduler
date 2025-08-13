using MedScheduler.Api.Domain.Enums;

namespace MedScheduler.Api.Domain.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string PasswordHash { get; set; } = default!;
    public UserRole Role { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Appointment> PatientAppointments { get; set; } = [];
    public ICollection<Appointment> DoctorAppointments { get; set; } = [];
}
