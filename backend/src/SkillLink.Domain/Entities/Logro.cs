namespace SkillLink.Domain.Entities;

public class Logro
{
    public Guid Id { get; set; }

    public string Nombre { get; set; } = string.Empty;

    public string? Descripcion { get; set; }

    public string TipoCondicion { get; set; } = string.Empty;

    public int ValorCondicion { get; set; }
}