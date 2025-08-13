namespace MedScheduler.Api.Domain.Entities;

public class Appointment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PatientId { get; set; }
    public Guid DoctorId { get; set; }
    public DateTime DateTime { get; set; }
    public string Symptoms { get; set; } = default!;
    public string? RecommendedSpecialty { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User Patient { get; set; } = default!;
    public User Doctor { get; set; } = default!;
}
