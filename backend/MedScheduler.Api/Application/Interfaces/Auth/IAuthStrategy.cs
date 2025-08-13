using MedScheduler.Api.Application.DTOs;

namespace MedScheduler.Api.Application.Interfaces.Auth;

public interface IAuthStrategy
{
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
}
