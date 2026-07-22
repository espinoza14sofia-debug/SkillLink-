namespace SkillLink.Domain.Entities;

public enum EstadoInvitacion
{
    Pendiente = 0,
    Aceptada = 1,
    Rechazada = 2
}

public class InvitacionEquipo
{
    public Guid Id { get; set; }

    public Guid EquipoId { get; set; }
    public Equipo Equipo { get; set; } = null!;

    public Guid UsuarioInvitadoId { get; set; }
    public Usuario UsuarioInvitado { get; set; } = null!;

    public Guid UsuarioInvitaId { get; set; }
    public Usuario UsuarioInvita { get; set; } = null!;

    public EstadoInvitacion Estado { get; set; } = EstadoInvitacion.Pendiente;
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
}