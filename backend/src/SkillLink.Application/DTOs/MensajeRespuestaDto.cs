namespace SkillLink.Application.DTOs;

public class MensajeRespuestaDto
{
    public Guid Id { get; set; }
    public Guid EmisorId { get; set; }
    public string EmisorNombre { get; set; } = string.Empty;
    public string Contenido { get; set; } = string.Empty;
    public DateTime Fecha { get; set; }
}
