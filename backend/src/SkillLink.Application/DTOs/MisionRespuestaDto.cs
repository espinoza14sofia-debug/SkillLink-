namespace SkillLink.Application.DTOs;

public class MisionRespuestaDto
{
    public Guid Id { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string Estado { get; set; } = string.Empty;
    public int XpValor { get; set; }
    public Guid? UsuarioAsignadoId { get; set; }
    public DateTime FechaCreacion { get; set; }
    public List<LogroDto> NuevosLogros { get; set; } = new();

    public bool SubioDeNivel { get; set; }
    public int NuevoNivel { get; set; }

    public Guid? ProyectoId { get; set; }
    public string? ProyectoNombre { get; set; }
    public DateTime? FechaLimite { get; set; }
    public string? Etiquetas { get; set; }
    public int Progreso { get; set; }
    public bool EsUrgente { get; set; }
    public bool Vencida { get; set; }
}