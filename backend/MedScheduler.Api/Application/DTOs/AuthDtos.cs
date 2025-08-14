using MedScheduler.Api.Domain.Enums;

namespace MedScheduler.Api.Application.DTOs;

public record RegisterRequest(string Name, string Email, string Password, UserRole Role);
public record LoginRequest(string Email, string Password);
public record AuthResponse(string Token, string Name, string Email, UserRole Role);
public record RegisterResponse(Guid Id, string Name, string Email, UserRole Role);
