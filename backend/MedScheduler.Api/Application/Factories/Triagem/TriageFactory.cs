using MedScheduler.Api.Application.Interfaces.Triagem;
using MedScheduler.Api.Application.Strategies.Triagem;
using Microsoft.Extensions.Configuration;

namespace MedScheduler.Api.Application.Factories.Triagem;

public static class TriageFactory
{
    public static ITriageStrategy Create(IConfiguration cfg)
    {
        var provider = cfg["Triagem:Provider"]?.ToLowerInvariant() ?? "keyword";
        return provider switch
        {
            "openai" => new OpenAITriageStrategy(),
            _ => new KeywordTriageStrategy()
        };
    }
}
