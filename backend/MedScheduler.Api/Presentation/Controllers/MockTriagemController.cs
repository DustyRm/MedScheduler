using MedScheduler.Api.Application.Factories.Triagem;
using Microsoft.AspNetCore.Mvc;

namespace MedScheduler.Api.Presentation.Controllers;

public record TriagemRequest(string Symptoms);
public record TriagemResponse(string RecommendedSpecialty);

[ApiController]
[Route("mock/triagem")]
public class MockTriagemController(IConfiguration cfg) : ControllerBase
{
    [HttpPost]
    public ActionResult<TriagemResponse> Simulate([FromBody] TriagemRequest req)
    {
        if (string.IsNullOrWhiteSpace(req?.Symptoms))
            return BadRequest(new { message = "Informe os sintomas." });

        var triage = TriageFactory.Create(cfg);
        var specialty = triage.GetRecommendedSpecialtyAsync(req.Symptoms).GetAwaiter().GetResult();
        return Ok(new TriagemResponse(specialty));
    }
}
