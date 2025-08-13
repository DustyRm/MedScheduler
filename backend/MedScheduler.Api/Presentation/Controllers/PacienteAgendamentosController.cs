using System.Security.Claims;
using MedScheduler.Api.Application.DTOs;
using MedScheduler.Api.Application.Factories.Triagem;
using MedScheduler.Api.Domain.Entities;
using MedScheduler.Api.Domain.Enums;
using MedScheduler.Api.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MedScheduler.Api.Presentation.Controllers;

[ApiController]
[Route("paciente/agendamentos")]
[Authorize(Roles = nameof(UserRole.Paciente))]
public class PacienteAgendamentosController(IAppointmentRepository appts, IUserRepository users, IConfiguration cfg) : ControllerBase
{
    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub")!.Value);

    [HttpPost]
    public async Task<ActionResult<AppointmentResponse>> Create([FromBody] CreateAppointmentRequest req)
    {
        var patientId = GetUserId();
        var triage = TriageFactory.Create(cfg);
        var specialty = await triage.GetRecommendedSpecialtyAsync(req.Symptoms);

        var appt = new Appointment
        {
            PatientId = patientId,
            DoctorId = req.DoctorId,
            DateTime = req.DateTime.ToUniversalTime(),
            Symptoms = req.Symptoms,
            RecommendedSpecialty = specialty
        };

        await appts.AddAsync(appt);
        await appts.SaveAsync();

        var resp = new AppointmentResponse(appt.Id, appt.PatientId, appt.DoctorId, appt.DateTime, appt.Symptoms, appt.RecommendedSpecialty);
        return Created(string.Empty, resp);
    }

    [HttpGet]
    public async Task<ActionResult<List<AppointmentResponse>>> ListMine()
    {
        var patientId = GetUserId();
        var list = await appts.GetByPatientAsync(patientId);
        return Ok(list.Select(a => new AppointmentResponse(a.Id, a.PatientId, a.DoctorId, a.DateTime, a.Symptoms, a.RecommendedSpecialty)).ToList());
    }
}
