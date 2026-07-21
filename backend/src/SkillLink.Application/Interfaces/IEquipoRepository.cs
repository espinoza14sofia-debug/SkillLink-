using SkillLink.Domain.Entities;

namespace SkillLink.Application.Interfaces
{
    public interface IEquipoRepository
    {
        Task<Equipo> CrearEquipoAsync(Equipo equipo);
        Task AgregarMiembroAsync(MiembroEquipo miembro);
        Task<MiembroEquipo?> ObtenerMiembroAsync(Guid equipoId, Guid usuarioId);
        Task<List<MiembroEquipo>> ObtenerMiembrosPorEquipoAsync(Guid equipoId);
        Task<bool> CambiarRolAsync(Guid equipoId, Guid usuarioId, RolEquipo nuevoRol);
        Task<List<Equipo>> ObtenerEquiposPorUsuarioAsync(Guid usuarioId);
    }

}
