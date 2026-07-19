namespace SkillLink.Domain.Entities;

public class MensajePrivado
{
    public Guid Id { get; set; }
    public Guid EmisorId { get; set; }
    public Guid ReceptorId { get; set; }
    public string Contenido { get; set; } = string.Empty;
    public DateTime Fecha { get; set; } = DateTime.UtcNow;
    public Usuario? Emisor { get; set; }
    public Usuario? Receptor { get; set; }
}