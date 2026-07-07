namespace SkillLink.Application.DTOs;

public class RegistroUsuarioDto
{
    public string Nombre { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? Carrera { get; set; }
}