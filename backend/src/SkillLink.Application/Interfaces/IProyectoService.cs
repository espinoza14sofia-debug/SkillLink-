using SkillLink.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace SkillLink.Application.Interfaces
{
    public interface IProyectoService
    {
        Task<ProyectoDetalleDto> CrearProyectoAsync(ProyectoCrearDto dto, Guid usuarioId);
        Task<ProyectoDetalleDto?> ObtenerDetalleAsync(Guid proyectoId, Guid usuarioId);
 
        Task<List<ProyectoDetalleDto>> ObtenerMisProyectosAsync(Guid usuarioId);
 
        Task<List<ProyectoDetalleDto>> ObtenerPorEquipoAsync(Guid equipoId, Guid usuarioId);
 
    }
}