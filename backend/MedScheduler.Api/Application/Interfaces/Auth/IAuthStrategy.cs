using MedScheduler.Api.Application.DTOs;

namespace MedScheduler.Api.Application.Interfaces.Auth;

public interface IAuthStrategy
{
    Task<RegisterResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);           
}
