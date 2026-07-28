namespace SkillLink.Application.DTOs;

public class MensajePrivadoRespuestaDto
{
    public Guid Id { get; set; }
    public Guid? EquipoId { get; set; }
    public Guid EmisorId { get; set; }
    public string EmisorNombre { get; set; } = string.Empty;
    public Guid ReceptorId { get; set; }
    public string Contenido { get; set; } = string.Empty;
    public DateTime Fecha { get; set; }
}