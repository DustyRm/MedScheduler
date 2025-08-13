using System.Text.RegularExpressions;
using MedScheduler.Api.Application.Interfaces.Triagem;

namespace MedScheduler.Api.Application.Strategies.Triagem;

public class KeywordTriageStrategy : ITriageStrategy
{
    private readonly Dictionary<string, string> _map = new(StringComparer.OrdinalIgnoreCase)
    {
        ["dor no peito"] = "Cardiologia",
        ["taquicardia"] = "Cardiologia",
        ["tosse"] = "Clínico Geral",
        ["febre"] = "Clínico Geral",
        ["dor de cabeça"] = "Neurologia",
        ["enxaqueca"] = "Neurologia",
        ["alergia"] = "Alergologia",
        ["coceira"] = "Dermatologia",
        ["mancha"] = "Dermatologia",
        ["dor abdominal"] = "Gastroenterologia"
    };

    public Task<string> GetRecommendedSpecialtyAsync(string symptoms)
    {
        var s = symptoms.ToLowerInvariant();
        foreach (var kv in _map)
        {
            if (Regex.IsMatch(s, Regex.Escape(kv.Key)))
                return Task.FromResult(kv.Value);
        }
        return Task.FromResult("Clínico Geral");
    }
}
