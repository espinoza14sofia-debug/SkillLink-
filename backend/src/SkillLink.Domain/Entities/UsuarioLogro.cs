namespace SkillLink.Domain.Entities;

public class UsuarioLogro
{
    public Guid UsuarioId { get; set; }

    public Guid LogroId { get; set; }

    public DateTime FechaObtenido { get; set; }

    public Logro? Logro { get; set; }
}