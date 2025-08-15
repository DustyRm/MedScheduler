using MedScheduler.Api.Domain.Entities;
using MedScheduler.Api.Infrastructure.Data;
using MedScheduler.Api.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace MedScheduler.Tests.Infrastructure;

public class AppointmentRepositoryTests
{
    private static AppDbContext NewDb()
    {
        var opts = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase("appts_" + Guid.NewGuid())
            .Options;
        return new AppDbContext(opts);
    }

    [Fact]
    public async Task Add_And_GetByPatient_Should_Work()
    {
        using var db = NewDb();
        var repo = new AppointmentRepository(db);

        var patientId = Guid.NewGuid();
        var doctorId = Guid.NewGuid();

        var a1 = new Appointment
        {
            Id = Guid.NewGuid(),
            PatientId = patientId,
            DoctorId = doctorId,
            DateTime = DateTime.UtcNow,
            Symptoms = "dor de cabeça e febre",
            CreatedAt = DateTime.UtcNow
        };

        await repo.AddAsync(a1);
        await repo.SaveAsync();

        var list = await repo.GetByPatientAsync(patientId);
        list.Should().HaveCount(1);
        list[0].PatientId.Should().Be(patientId);
    }

    [Fact]
    public async Task GetByDoctorAndDate_Should_Filter_By_Day()
    {
        using var db = NewDb();
        var repo = new AppointmentRepository(db);

        var doc = Guid.NewGuid();
        var day = new DateTime(2025, 8, 15, 13, 0, 0, DateTimeKind.Utc);

        await repo.AddAsync(new Appointment
        {
            Id = Guid.NewGuid(),
            DoctorId = doc,
            PatientId = Guid.NewGuid(),
            DateTime = day.AddHours(-2),
            Symptoms = "sintomas A",
            CreatedAt = DateTime.UtcNow
        });
        await repo.AddAsync(new Appointment
        {
            Id = Guid.NewGuid(),
            DoctorId = doc,
            PatientId = Guid.NewGuid(),
            DateTime = day.AddHours(1),
            Symptoms = "sintomas B",
            CreatedAt = DateTime.UtcNow
        });
        await repo.AddAsync(new Appointment
        {
            Id = Guid.NewGuid(),
            DoctorId = doc,
            PatientId = Guid.NewGuid(),
            DateTime = day.AddDays(1),
            Symptoms = "sintomas C",
            CreatedAt = DateTime.UtcNow
        });
        await repo.SaveAsync();

        var list = await repo.GetByDoctorAndDateAsync(doc, day);
        list.Should().HaveCount(2);
        list.Select(x => x.DateTime.Date).Distinct().Should().ContainSingle().Which.Should().Be(day.Date);
    }
}
