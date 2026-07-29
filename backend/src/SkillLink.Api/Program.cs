using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using SkillLink.Api.Services;
using SkillLink.Application.Interfaces;
using SkillLink.Application.Services;
using SkillLink.Infrastructure.Persistence;
using SkillLink.Infrastructure.Repositories;
using SkillLink.Infrastructure.Security;
using System.Text;


var builder = WebApplication.CreateBuilder(args);

// ==========================
// Registro de servicios
// ==========================

builder.Services.AddScoped<IRachaService, RachaService>();
builder.Services.AddScoped<INotificacionRepository, NotificacionRepository>();
builder.Services.AddScoped<INotificacionService, NotificacionService>();

builder.Services.AddScoped<IRankingRepository, RankingRepository>();
builder.Services.AddScoped<IRankingService, RankingService>();

builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUsuarioService, UsuarioService>();

builder.Services.AddScoped<IActividadRepository, ActividadRepository>();
builder.Services.AddScoped<IActividadService, ActividadService>();

builder.Services.AddScoped<INivelConfiguracionRepository, NivelConfiguracionRepository>();
builder.Services.AddScoped<INivelService, NivelService>();
builder.Services.AddScoped<IXpService, XpService>();

builder.Services.AddScoped<IMisionRepository, MisionRepository>();
builder.Services.AddScoped<IMisionService, MisionService>();

builder.Services.AddScoped<ILogroRepository, LogroRepository>();
builder.Services.AddScoped<ILogroService, LogroService>();

builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<ITokenService, TokenService>();

builder.Services.AddScoped<IHabilidadRepository, HabilidadRepository>();
builder.Services.AddScoped<IHabilidadService, HabilidadService>();

builder.Services.AddScoped<ITokenRecuperacionRepository, TokenRecuperacionRepository>();

builder.Services.AddScoped<IEquipoRepository, EquipoRepository>();
builder.Services.AddScoped<IEquipoService, EquipoService>();

builder.Services.AddScoped<IProyectoRepository, ProyectoRepository>();
builder.Services.AddScoped<IProyectoService, ProyectoService>();

builder.Services.AddControllers();

builder.Services.AddScoped<IMensajeRepository, MensajeRepository>();
builder.Services.AddScoped<IMensajeService, MensajeService>();

builder.Services.AddScoped<IMensajePrivadoRepository, MensajePrivadoRepository>();
builder.Services.AddScoped<IMensajePrivadoService, MensajePrivadoService>();

builder.Services.AddScoped<IInvitacionRepository, InvitacionRepository>();
builder.Services.AddScoped<IInvitacionService, InvitacionService>();

builder.Services.AddScoped<IEmailService, EmailService>();

// ==========================B
// Base de datos
// ==========================
builder.Services.AddDbContext<SkillLinkDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")));

// ==========================
// Swagger (con soporte JWT - botón Authorize)
// ==========================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ==========================
// CORS
// ==========================
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "http://localhost:5174")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// ==========================
// JWT
// ==========================
var jwtKey = builder.Configuration["Jwt:Key"]!;
var jwtIssuer = builder.Configuration["Jwt:Issuer"]!;
var jwtAudience = builder.Configuration["Jwt:Audience"]!;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,

            ValidateAudience = true,
            ValidAudience = jwtAudience,

            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey)
            ),

            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// ==========================
// Middleware
// ==========================
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("FrontendPolicy");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();