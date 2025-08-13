using MedScheduler.Api.Application.Interfaces.Triagem;

namespace MedScheduler.Api.Application.Strategies.Triagem;

public class OpenAITriageStrategy : ITriageStrategy
{
    public Task<string> GetRecommendedSpecialtyAsync(string symptoms)
    {
        return Task.FromResult("Clinico Geral");
    }
}
