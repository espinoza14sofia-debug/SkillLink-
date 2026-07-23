using SkillLink.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SkillLink.Application.Interfaces
{
    public interface IMisionService
    {
        Task<MisionRespuestaDto> CrearAsync(MisionCrearDto dto);
        Task<List<MisionRespuestaDto>> ObtenerTodasAsync();
        Task<List<MisionRespuestaDto>> ObtenerPorUsuarioAsync(Guid usuarioId);
        Task<MisionRespuestaDto> AsignarAsync(Guid misionId, Guid usuarioId);
        Task<MisionRespuestaDto> CompletarAsync(Guid misionId, Guid usuarioId);
        Task<MisionRespuestaDto> ActualizarProgresoAsync(Guid misionId, Guid usuarioId, int progreso);
        Task<MisionRespuestaDto> ReasignarAsync(Guid misionId, Guid usuarioActualId, Guid nuevoUsuarioId);
        Task<List<MisionRespuestaDto>> ObtenerPorEquipoAsync(Guid equipoId);
    }
}