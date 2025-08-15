using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using MedScheduler.Api.Application.Strategies.Triagem;

namespace MedScheduler.Tests.Triagem;

public class OpenAITriageStrategyTests
{
    private sealed class FakeHandler : HttpMessageHandler
    {
        private readonly HttpResponseMessage _resp;

        public FakeHandler(string specialty)
        {
            var payload = new
            {
                choices = new[]
                {
                    new { message = new { content = specialty } }
                }
            };
            _resp = new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
            };
        }

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
            => Task.FromResult(_resp);
    }

    [Fact]
    public async Task Should_Return_Specialty_From_OpenAI_Response()
    {
        var client = new HttpClient(new FakeHandler("Cardiologia"));
        var strategy = new OpenAITriageStrategy(client, "test_api_key");

        var spec = await strategy.GetRecommendedSpecialtyAsync("dor no peito e palpitações");
        spec.Should().Be("Cardiologia");
    }

    [Fact]
    public async Task On_Error_Should_Fallback_To_ClinicoGeral()
    {
        var handler = new DelegatingHandlerStub((req, ct) => Task.FromResult(new HttpResponseMessage(HttpStatusCode.InternalServerError)));
        var client = new HttpClient(handler);
        var strategy = new OpenAITriageStrategy(client, "k");

        var spec = await strategy.GetRecommendedSpecialtyAsync("qualquer");
        spec.Should().Be("Clínico Geral");
    }

    private sealed class DelegatingHandlerStub : DelegatingHandler
    {
        private readonly Func<HttpRequestMessage, CancellationToken, Task<HttpResponseMessage>> _send;

        public DelegatingHandlerStub(Func<HttpRequestMessage, CancellationToken, Task<HttpResponseMessage>> send)
        {
            _send = send;
        }

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
            => _send(request, cancellationToken);
    }
}
