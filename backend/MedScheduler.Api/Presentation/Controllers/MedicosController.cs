using MedScheduler.Api.Application.DTOs;
using MedScheduler.Api.Domain.Enums;
using MedScheduler.Api.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MedScheduler.Api.Presentation.Controllers;

[ApiController]
[Route("medicos")]
public class MedicosController(IUserRepository users) : ControllerBase
{
    [Authorize]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<DoctorResponse>>> GetAll()
    {
        var doctors = await users.GetByRoleAsync(UserRole.Medico);

        var result = doctors.Select(d => new DoctorResponse(
            d.Id,
            d.Name,
            d.Email
        ));

        return Ok(result);
    }
}
