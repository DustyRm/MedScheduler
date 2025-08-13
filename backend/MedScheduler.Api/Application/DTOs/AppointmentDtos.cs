namespace MedScheduler.Api.Application.DTOs;

public record CreateAppointmentRequest(Guid DoctorId, DateTime DateTime, string Symptoms);
public record AppointmentResponse(Guid Id, Guid PatientId, Guid DoctorId, DateTime DateTime, string Symptoms, string? RecommendedSpecialty);
