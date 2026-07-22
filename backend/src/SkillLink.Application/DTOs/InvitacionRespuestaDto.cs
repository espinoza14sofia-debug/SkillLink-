using System;
using System.Collections.Generic;
using System.Text;

namespace SkillLink.Application.DTOs; 

public class InvitacionRespuestaDto
{
    public Guid Id { get; set; }
    public Guid EquipoId { get; set; }
    public string NombreEquipo { get; set; } = string.Empty;
    public string NombreQuienInvita { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;
    public DateTime FechaCreacion { get; set; }
}