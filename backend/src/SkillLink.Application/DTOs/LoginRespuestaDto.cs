namespace SkillLink.Application.DTOs
{
    public class LoginRespuestaDto
    {
        public string Token { get; set; } = string.Empty;
        public object Usuario { get; set; } = null!; 
    }
}