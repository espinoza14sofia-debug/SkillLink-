using SkillLink.Application.DTOs;
using SkillLink.Application.Interfaces;
using SkillLink.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace SkillLink.Application.Services;

public class ProyectoService : IProyectoService
{
    private readonly IProyectoRepository _proyectoRepository;

    public ProyectoService(IProyectoRepository proyectoRepository)
    {
        _proyectoRepository = proyectoRepository;
    }

    public async Task<ProyectoDetalleDto> CrearProyectoAsync(ProyectoCrearDto dto, Guid usuarioId)
    {
        // Acceptance Criteria: solo un miembro del equipo puede crear proyectos
        var pertenece = await _proyectoRepository.UsuarioPerteneceAlEquipoAsync(dto.EquipoId, usuarioId);
        if (!pertenece)
            throw new UnauthorizedAccessException("No perteneces a este equipo.");

        var proyecto = new Proyecto
        {
            Id = Guid.NewGuid(),
            Nombre = dto.Nombre,
            Descripcion = dto.Descripcion,
            EquipoId = dto.EquipoId,
            Estado = EstadoProyecto.EnProgreso,
            FechaCreacion = DateTime.UtcNow
        };

        var creado = await _proyectoRepository.CrearAsync(proyecto);

        return new ProyectoDetalleDto
        {
            Id = creado.Id,
            Nombre = creado.Nombre,
            Descripcion = creado.Descripcion,
            Estado = creado.Estado.ToString(),
            PorcentajeAvance = 0,
            FechaCreacion = creado.FechaCreacion
        };
    }

    public async Task<ProyectoDetalleDto?> ObtenerDetalleAsync(Guid proyectoId, Guid usuarioId)
    {
        var proyecto = await _proyectoRepository.ObtenerPorIdAsync(proyectoId);
        if (proyecto == null) return null;

        // Acceptance Criteria: solo miembros del equipo pueden ver el detalle
        var pertenece = await _proyectoRepository.UsuarioPerteneceAlEquipoAsync(proyecto.EquipoId, usuarioId);
        if (!pertenece)
            throw new UnauthorizedAccessException("No perteneces a este equipo.");

        var avance = await _proyectoRepository.CalcularPorcentajeAvanceAsync(proyectoId);

        return new ProyectoDetalleDto
        {
            Id = proyecto.Id,
            Nombre = proyecto.Nombre,
            Descripcion = proyecto.Descripcion,
            Estado = proyecto.Estado.ToString(),
            PorcentajeAvance = avance,
            FechaCreacion = proyecto.FechaCreacion
        };
    }
}
