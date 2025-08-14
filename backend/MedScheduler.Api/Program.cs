using System.IdentityModel.Tokens.Jwt;     
using System.Security.Claims;              
using System.Text;

using MedScheduler.Api.Infrastructure.Data;
using MedScheduler.Api.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(opt =>
{
    var cs = builder.Configuration.GetConnectionString("Postgres");
    opt.UseNpgsql(cs, x => x.MigrationsAssembly("MedScheduler.Api"));
});

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IAppointmentRepository, AppointmentRepository>();
builder.Services.AddControllers();

// ===== CORS =====
const string CorsPolicy = "MedSchedulerCors";
builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicy, policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:3000",
                "https://localhost:3000"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// ===== JWT / Auth =====
var issuer   = builder.Configuration["Jwt:Issuer"];
var audience = builder.Configuration["Jwt:Audience"];
var keyCfg   = builder.Configuration["Jwt:Key"] ?? "DEV_SUPER_SECRET_CHANGE_ME_32_BYTES_MIN_1234567890";

byte[] keyBytes;
try { keyBytes = Convert.FromBase64String(keyCfg); }
catch { keyBytes = Encoding.UTF8.GetBytes(keyCfg); }
if (keyBytes.Length < 32)
    throw new InvalidOperationException("Jwt:Key precisa ter pelo menos 32 bytes (HS256).");

var signingKey = new SymmetricSecurityKey(keyBytes);

JwtSecurityTokenHandler.DefaultMapInboundClaims = false;

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = issuer,
            ValidAudience = audience,
            IssuerSigningKey = signingKey,

            RoleClaimType = ClaimTypes.Role,               
            NameClaimType = JwtRegisteredClaimNames.Sub
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = ctx =>
            {
                var hasAuth = ctx.Request.Headers.ContainsKey("Authorization");
                var authLen = hasAuth ? ctx.Request.Headers.Authorization.ToString().Length : 0;
                Console.WriteLine($"[JWT] MessageReceived path={ctx.Request.Path} hasAuthHeader={hasAuth} len={authLen}");
                return Task.CompletedTask;
            },
            OnTokenValidated = ctx =>
            {
                var sub = ctx.Principal?.FindFirst(JwtRegisteredClaimNames.Sub)?.Value ?? "(sem sub)";
                var email = ctx.Principal?.FindFirst(JwtRegisteredClaimNames.Email)?.Value ?? "(sem email)";
                var roles = string.Join(",", ctx.Principal?.FindAll(ClaimTypes.Role).Select(r => r.Value) ?? Array.Empty<string>());
                Console.WriteLine($"[JWT] TokenValidated sub={sub} email={email} roles=[{roles}]");
                return Task.CompletedTask;
            },
            OnAuthenticationFailed = ctx =>
            {
                Console.WriteLine($"[JWT] AuthenticationFailed {ctx.Exception.GetType().Name}: {ctx.Exception.Message}");
                return Task.CompletedTask;
            },
            OnChallenge = ctx =>
            {
                Console.WriteLine($"[JWT] Challenge error={ctx.Error} desc={ctx.ErrorDescription} uri={ctx.ErrorUri}");
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "MedScheduler API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Cole APENAS o token (sem 'Bearer ')."
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "MedScheduler API v1");
    c.ConfigObject.AdditionalItems["persistAuthorization"] = true;
});

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors(CorsPolicy);

app.UseAuthentication();

app.Use(async (ctx, next) =>
{
    var sub = ctx.User?.FindFirst(JwtRegisteredClaimNames.Sub)?.Value ?? "anon";
    var roles = string.Join(",", ctx.User?.FindAll(ClaimTypes.Role).Select(r => r.Value) ?? Array.Empty<string>());
    Console.WriteLine($"[PIPE] {ctx.Request.Method} {ctx.Request.Path} user={sub} roles=[{roles}]");
    await next();
});

app.UseAuthorization();
app.MapControllers();

app.Run();
