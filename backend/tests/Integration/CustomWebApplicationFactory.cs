using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using SkillLink.Api.Services;
using SkillLink.Infrastructure.Persistence;

namespace SkillLink.Tests.Integration;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(Microsoft.AspNetCore.Hosting.IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // ---- Reemplazar la base de datos real por una en memoria ----
            var dbDescriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<SkillLinkDbContext>));

            if (dbDescriptor != null)
            {
                services.Remove(dbDescriptor);
            }

            services.AddDbContext<SkillLinkDbContext>(options =>
            {
                options.UseInMemoryDatabase($"SkillLinkTestDb_{Guid.NewGuid()}");
            });

            // ---- Reemplazar el servicio de email real por un mock ----
            var emailDescriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(IEmailService));

            if (emailDescriptor != null)
            {
                services.Remove(emailDescriptor);
            }

            var emailMock = new Mock<IEmailService>();
            emailMock
                .Setup(e => e.SendEmailAsync(
                    It.IsAny<string>(),
                    It.IsAny<string>(),
                    It.IsAny<string>()))
                .Returns(Task.CompletedTask);

            services.AddSingleton(emailMock.Object);

            // ---- Crear el esquema en memoria (incluye seed de NivelConfiguracion) ----
            var sp = services.BuildServiceProvider();
            using var scope = sp.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<SkillLinkDbContext>();
            db.Database.EnsureCreated();
        });
    }
}