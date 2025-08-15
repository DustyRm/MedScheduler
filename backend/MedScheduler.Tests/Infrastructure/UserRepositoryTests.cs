using MedScheduler.Api.Domain.Entities;
using MedScheduler.Api.Domain.Enums;
using MedScheduler.Api.Infrastructure.Data;
using MedScheduler.Api.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace MedScheduler.Tests.Infrastructure;

public class UserRepositoryTests
{
    private static AppDbContext NewDb()
    {
        var opts = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase("users_" + Guid.NewGuid())
            .Options;
        return new AppDbContext(opts);
    }

    [Fact]
    public async Task Add_And_GetByEmail_Should_Work()
    {
        using var db = NewDb();
        var repo = new UserRepository(db);

        var u = new User { Name = "Carol", Email = "carol@ex.com", PasswordHash = "hash", Role = UserRole.Paciente };
        await repo.AddAsync(u);
        await repo.SaveAsync();

        var found = await repo.GetByEmailAsync("carol@ex.com");
        found.Should().NotBeNull();
        found!.Name.Should().Be("Carol");
    }
}
