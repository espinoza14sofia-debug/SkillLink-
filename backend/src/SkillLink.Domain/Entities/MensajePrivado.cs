using System;

namespace SkillLink.Domain.Entities;

public class MensajePrivado
{
    public Guid Id { get; set; }

    public Guid EmisorId { get; set; }
    public Usuario Emisor { get; set; } = null!;

    public Guid ReceptorId { get; set; }
    public Usuario Receptor { get; set; } = null!;

    public string Contenido { get; set; } = string.Empty;

    public DateTime Fecha { get; set; } = DateTime.UtcNow;

    public bool Leido { get; set; } = false;
}