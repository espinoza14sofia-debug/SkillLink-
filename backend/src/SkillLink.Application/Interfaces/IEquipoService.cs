using SkillLink.Application.DTOs;
using SkillLink.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace SkillLink.Application.Interfaces
{
    public interface IEquipoService
    {
        Task<Guid> CrearEquipoAsync(CrearEquipoDto dto, Guid usuarioCreadorId);
        Task<List<MiembroEquipoDto>> ObtenerMiembrosAsync(Guid equipoId);
        Task<bool> CambiarRolMiembroAsync(Guid equipoId, Guid usuarioObjetivoId, RolEquipo nuevoRol, Guid usuarioSolicitanteId);
        Task<List<EquipoResumenDto>> ObtenerMisEquiposAsync(Guid usuarioId);
    }
}
