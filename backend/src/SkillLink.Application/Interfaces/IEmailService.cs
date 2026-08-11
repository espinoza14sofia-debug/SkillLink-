using System.Threading.Tasks;

namespace SkillLink.Application.Interfaces
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string body);
    }
}