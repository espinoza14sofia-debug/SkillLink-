namespace SkillLink.Application.DTOs;

public class NotificacionRespuestaDto
{
    public Guid Id { get; set; }
    public string Tipo { get; set; } = string.Empty;
    public string Mensaje { get; set; } = string.Empty;
    public bool Leida { get; set; }
    public DateTime Fecha { get; set; }
}