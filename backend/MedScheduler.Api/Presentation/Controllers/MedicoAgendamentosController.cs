using System.Security.Claims;
using System.Linq;
using MedScheduler.Api.Application.DTOs;
using MedScheduler.Api.Domain.Enums;
using MedScheduler.Api.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MedScheduler.Api.Presentation.Controllers;

[ApiController]
[Route("medico/agendamentos")]
[Authorize(Roles = nameof(UserRole.Medico))]
public class MedicoAgendamentosController(IAppointmentRepository appts) : ControllerBase
{
    private Guid GetUserId() => Guid.Parse(User.FindFirst("sub")!.Value);

    [HttpGet]
    public async Task<ActionResult<List<AppointmentWithPatientNameResponse>>> GetByDate([FromQuery] DateTime data)
    {
        var doctorId = GetUserId();
        var target = data == default ? DateTime.UtcNow : data.ToUniversalTime();

        var list = await appts.GetByDoctorAndDateAsync(doctorId, target);

        var result = list.Select(a => new AppointmentWithPatientNameResponse(
            a.Id,
            a.PatientId,
            a.DoctorId,
            a.DateTime,
            a.Symptoms,
            a.RecommendedSpecialty,
            a.Patient?.Name ?? string.Empty
        )).ToList();

        return Ok(result);
    }
}
