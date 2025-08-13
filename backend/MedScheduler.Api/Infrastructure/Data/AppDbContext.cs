using MedScheduler.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MedScheduler.Api.Infrastructure.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Appointment> Appointments => Set<Appointment>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<User>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Email).IsUnique();
            e.Property(x => x.Role).HasConversion<int>();

            e.HasMany(x => x.PatientAppointments)
             .WithOne(a => a.Patient)
             .HasForeignKey(a => a.PatientId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasMany(x => x.DoctorAppointments)
             .WithOne(a => a.Doctor)
             .HasForeignKey(a => a.DoctorId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        b.Entity<Appointment>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Symptoms).HasMaxLength(4000);
            e.Property(x => x.RecommendedSpecialty).HasMaxLength(200);

            e.HasIndex(x => new { x.PatientId, x.DateTime })
             .HasDatabaseName("IX_Appointments_PatientId_DateTime");

            e.HasIndex(x => new { x.DoctorId, x.DateTime })
             .HasDatabaseName("IX_Appointments_DoctorId_DateTime");
        });
    }
}
