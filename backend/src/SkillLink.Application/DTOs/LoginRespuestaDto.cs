namespace SkillLink.Application.DTOs
{
    public class LoginRespuestaDto
    {
        public string Token { get; set; } = string.Empty;
        public UsuarioRespuestaDto Usuario { get; set; } = null!;
    }
}