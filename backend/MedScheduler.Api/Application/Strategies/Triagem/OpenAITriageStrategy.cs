using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using MedScheduler.Api.Application.Interfaces.Triagem;

namespace MedScheduler.Api.Application.Strategies.Triagem;

public class OpenAITriageStrategy : ITriageStrategy
{
    private readonly HttpClient _http;
    private readonly string _apiKey;
    public OpenAITriageStrategy(HttpClient http, string apiKey)
    {
        _http = http ?? throw new ArgumentNullException(nameof(http));
        _apiKey = string.IsNullOrWhiteSpace(apiKey)
            ? throw new InvalidOperationException("OPENAI_API_KEY ausente")
            : apiKey;
    }

    public async Task<string> GetRecommendedSpecialtyAsync(string symptoms)
    {
        if (string.IsNullOrWhiteSpace(symptoms))
            return "Clínico Geral";

        _http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

        var system = "Você é um triador médico. Responda SOMENTE com UMA especialidade exata dentre: " +
                     "Clínico Geral, Cardiologia, Neurologia, Dermatologia, Gastroenterologia, Ortopedia, " +
                     "Pneumologia, Otorrinolaringologia, Endocrinologia.";

        var user = $"Sintomas do paciente: {symptoms}\n" +
                   "Responda apenas com a especialidade, sem explicações.";

        var payload = new
        {
            model = "gpt-4o-mini",
            messages = new[]
            {
                new { role = "system", content = system },
                new { role = "user", content = user }
            },
            temperature = 0
        };

        using var req = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/chat/completions")
        {
            Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
        };

        try
        {
            using var resp = await _http.SendAsync(req);
            resp.EnsureSuccessStatusCode();

            using var doc = JsonDocument.Parse(await resp.Content.ReadAsStringAsync());
            var content = doc.RootElement
                             .GetProperty("choices")[0]
                             .GetProperty("message")
                             .GetProperty("content")
                             .GetString();

            var specialty = (content ?? "").Trim();
            return string.IsNullOrWhiteSpace(specialty) ? "Clínico Geral" : specialty;
        }
        catch
        {
            return "Clínico Geral";
        }
    }
}
