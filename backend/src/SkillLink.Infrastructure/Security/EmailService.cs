using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;
using MimeKit.Text;
using SkillLink.Application.Interfaces;  
using System.Threading.Tasks;

namespace SkillLink.Infrastructure.Security
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuracion;

        public EmailService(IConfiguration config)
        {
            _configuracion = config;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            var email = new MimeMessage();

            // Configurar remitente y destinatario usando las claves correctas del appsettings.json
            email.From.Add(new MailboxAddress(
                _configuracion["Smtp:NombreRemitente"],
                _configuracion["Smtp:Usuario"]
            ));

            email.To.Add(MailboxAddress.Parse(toEmail));
            email.Subject = subject;

            // Configurar el cuerpo del correo (acepta HTML)
            email.Body = new TextPart(TextFormat.Html) { Text = body };

            using var smtp = new SmtpClient();
            try
            {
                // Conectar al servidor SMTP de Gmail
                await smtp.ConnectAsync(
                    _configuracion["Smtp:Host"],
                    int.Parse(_configuracion["Smtp:Port"]!),
                    SecureSocketOptions.StartTls
                );

                // Autenticarse con la Contraseña de Aplicación de 16 letras
                await smtp.AuthenticateAsync(
                    _configuracion["Smtp:Usuario"],
                    _configuracion["Smtp:Password"]
                );

                // Enviar y desconectar
                await smtp.SendAsync(email);
                await smtp.DisconnectAsync(true);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al enviar correo: {ex.Message}");
                throw;
            }
        }
    }
}