namespace MedScheduler.Api.Application.Interfaces.Triagem;

public interface ITriageStrategy
{
    Task<string> GetRecommendedSpecialtyAsync(string symptoms);
}
