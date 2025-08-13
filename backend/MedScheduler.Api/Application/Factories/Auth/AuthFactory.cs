using MedScheduler.Api.Application.Interfaces.Auth;
using MedScheduler.Api.Application.Strategies.Auth;
using MedScheduler.Api.Infrastructure.Repositories;
using Microsoft.Extensions.Configuration;

namespace MedScheduler.Api.Application.Factories.Auth;

public static class AuthFactory
{
    public static IAuthStrategy Create(IUserRepository users, IConfiguration cfg)
        => new JwtAuthStrategy(users, cfg);
}
