namespace SkillLink.Application.DTOs;

public class ConversacionDto
{
    public Guid UsuarioId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string UltimoMensaje { get; set; } = string.Empty;
    public DateTime Fecha { get; set; }
    public int NoLeidos { get; set; }
}