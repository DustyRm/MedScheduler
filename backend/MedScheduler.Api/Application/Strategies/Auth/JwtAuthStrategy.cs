using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using MedScheduler.Api.Application.DTOs;
using MedScheduler.Api.Application.Interfaces.Auth;
using MedScheduler.Api.Domain.Entities;
using MedScheduler.Api.Infrastructure.Repositories;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace MedScheduler.Api.Application.Strategies.Auth;

public class JwtAuthStrategy(IUserRepository users, IConfiguration cfg) : IAuthStrategy
{
    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var existing = await users.GetByEmailAsync(request.Email);
        if (existing is not null) throw new Exception("E-mail já registrado.");

        var user = new User
        {
            Name = request.Name,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = request.Role
        };

        await users.AddAsync(user);
        await users.SaveAsync();

        return GenerateToken(user);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await users.GetByEmailAsync(request.Email);
        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new Exception("Credenciais inválidas.");

        return GenerateToken(user);
    }

    private AuthResponse GenerateToken(User u)
    {
        var issuer = cfg["Jwt:Issuer"]!;
        var audience = cfg["Jwt:Audience"]!;
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(cfg["Jwt:Key"]!));

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, u.Id.ToString()),
            new Claim(ClaimTypes.Role, u.Role.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, u.Email),
            new Claim("name", u.Name)
        };

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(issuer, audience, claims, expires: DateTime.UtcNow.AddHours(8), signingCredentials: creds);
        var jwt = new JwtSecurityTokenHandler().WriteToken(token);

        return new AuthResponse(jwt, u.Name, u.Email, u.Role);
    }
}
