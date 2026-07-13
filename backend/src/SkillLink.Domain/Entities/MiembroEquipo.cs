using System;
using System.Collections.Generic;
using System.Text;

namespace SkillLink.Domain.Entities;
public enum RolEquipo
{
    Colaborador = 0,
    Lider = 1
}

    public class MiembroEquipo
    {
    public Guid Id { get; set; }

    public Guid EquipoId { get; set; }
    public Equipo Equipo { get; set; } = null!;

    public Guid UsuarioId { get; set; }
    public Usuario Usuario { get; set; } = null!;

    public RolEquipo Rol { get; set; } = RolEquipo.Colaborador;
    public DateTime FechaIngreso { get; set; } = DateTime.UtcNow;
}

