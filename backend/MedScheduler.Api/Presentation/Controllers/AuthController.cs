using MedScheduler.Api.Application.DTOs;
using MedScheduler.Api.Application.Factories.Auth;
using MedScheduler.Api.Infrastructure.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace MedScheduler.Api.Presentation.Controllers;

[ApiController]
[Route("auth")]
public class AuthController(IUserRepository users, IConfiguration cfg) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<RegisterResponse>> Register([FromBody] RegisterRequest req)
    {
        var strategy = AuthFactory.Create(users, cfg);
        var result = await strategy.RegisterAsync(req);
        return Created($"/users/{result.Id}", result);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest req)
    {
        var strategy = AuthFactory.Create(users, cfg);
        return Ok(await strategy.LoginAsync(req));
    }
}
