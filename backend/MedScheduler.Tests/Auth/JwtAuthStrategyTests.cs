using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using MedScheduler.Api.Application.DTOs;
using MedScheduler.Api.Application.Strategies.Auth;
using MedScheduler.Api.Domain.Entities;
using MedScheduler.Api.Domain.Enums;
using MedScheduler.Api.Infrastructure.Repositories;
using Microsoft.Extensions.Configuration;
using Moq;

namespace MedScheduler.Tests.Auth;

public class JwtAuthStrategyTests
{
    private static IConfiguration BuildConfig()
    {
        var dict = new Dictionary<string,string?>
        {
            ["Jwt:Issuer"] = "medscheduler",
            ["Jwt:Audience"] = "medscheduler-clients",
            ["Jwt:Key"] = "DEV_KEY_0123456789_0123456789_01234567"
        };
        return new ConfigurationBuilder().AddInMemoryCollection(dict).Build();
    }

    [Fact]
    public async Task RegisterAsync_Should_Create_User_And_Return_RegisterResponse()
    {
        var repo = new Mock<IUserRepository>();
        repo.Setup(r => r.GetByEmailAsync(It.IsAny<string>())).ReturnsAsync((User?)null);
        User? added = null;
        repo.Setup(r => r.AddAsync(It.IsAny<User>())).Callback<User>(u => added = u).Returns(Task.CompletedTask);
        repo.Setup(r => r.SaveAsync()).Returns(Task.CompletedTask);

        var strategy = new JwtAuthStrategy(repo.Object, BuildConfig());
        var req = new RegisterRequest("João", "joao@ex.com", "123456", UserRole.Paciente);

        var res = await strategy.RegisterAsync(req);

        res.Should().NotBeNull();
        res.Name.Should().Be("João");
        res.Email.Should().Be("joao@ex.com");
        res.Role.Should().Be(UserRole.Paciente);

        added.Should().NotBeNull();
        added!.Email.Should().Be("joao@ex.com");
        added.PasswordHash.Should().NotBe("123456");
        repo.Verify(r => r.AddAsync(It.IsAny<User>()), Times.Once);
        repo.Verify(r => r.SaveAsync(), Times.Once);
    }

    [Fact]
    public async Task LoginAsync_Should_Return_Token_With_Claims()
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = "Dra. Ana",
            Email = "ana@ex.com",
            Role = UserRole.Medico,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("senha!")
        };

        var repo = new Mock<IUserRepository>();
        repo.Setup(r => r.GetByEmailAsync("ana@ex.com")).ReturnsAsync(user);

        var strategy = new JwtAuthStrategy(repo.Object, BuildConfig());
        var req = new LoginRequest("ana@ex.com", "senha!");

        var res = await strategy.LoginAsync(req);

        res.Token.Should().NotBeNullOrWhiteSpace();

        var token = new JwtSecurityTokenHandler().ReadJwtToken(res.Token);
        token.Claims.First(c => c.Type == JwtRegisteredClaimNames.Sub).Value.Should().Be(user.Id.ToString());
        token.Claims.First(c => c.Type == JwtRegisteredClaimNames.Email).Value.Should().Be("ana@ex.com");
        token.Claims.First(c => c.Type == ClaimTypes.Role).Value.Should().Be(UserRole.Medico.ToString());
    }

    [Fact]
    public async Task LoginAsync_With_Wrong_Password_Should_Throw()
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = "Bob",
            Email = "bob@ex.com",
            Role = UserRole.Paciente,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("correta")
        };

        var repo = new Mock<IUserRepository>();
        repo.Setup(r => r.GetByEmailAsync("bob@ex.com")).ReturnsAsync(user);

        var strategy = new JwtAuthStrategy(repo.Object, BuildConfig());

        var act = async () => await strategy.LoginAsync(new LoginRequest("bob@ex.com", "errada"));
        await act.Should().ThrowAsync<Exception>().WithMessage("*Credenciais inválidas*");
    }
}
