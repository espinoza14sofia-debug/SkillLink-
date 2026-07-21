using SkillLink.Application.DTOs;
using SkillLink.Application.Interfaces;
using SkillLink.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace SkillLink.Application.Services;

public class EquipoService : IEquipoService
{
    private readonly IEquipoRepository _equipoRepository;

    public EquipoService(IEquipoRepository equipoRepository)
    {
        _equipoRepository = equipoRepository;
    }

    public async Task<Guid> CrearEquipoAsync(CrearEquipoDto dto, Guid usuarioCreadorId)
    {
        var equipo = new Equipo
        {
            Id = Guid.NewGuid(),
            Nombre = dto.Nombre,
            FechaCreacion = DateTime.UtcNow
        };

        await _equipoRepository.CrearEquipoAsync(equipo);

        // El creador se vuelve Líder automáticamente
        var lider = new MiembroEquipo
        {
            Id = Guid.NewGuid(),
            EquipoId = equipo.Id,
            UsuarioId = usuarioCreadorId,
            Rol = RolEquipo.Lider,
            FechaIngreso = DateTime.UtcNow
        };

        await _equipoRepository.AgregarMiembroAsync(lider);

        return equipo.Id;
    }

    public async Task<List<MiembroEquipoDto>> ObtenerMiembrosAsync(Guid equipoId)
    {
        var miembros = await _equipoRepository.ObtenerMiembrosPorEquipoAsync(equipoId);

        return miembros.Select(m => new MiembroEquipoDto
        {
            UsuarioId = m.UsuarioId,
            Nombre = m.Usuario.Nombre,
            Rol = m.Rol.ToString()
        }).ToList();
    }
    public async Task<List<EquipoResumenDto>> ObtenerMisEquiposAsync(Guid usuarioId)
    {
        var equipos = await _equipoRepository.ObtenerEquiposPorUsuarioAsync(usuarioId);
        var resultado = new List<EquipoResumenDto>();

        foreach (var equipo in equipos)
        {
            var miembro = await _equipoRepository.ObtenerMiembroAsync(equipo.Id, usuarioId);
            var miembros = await _equipoRepository.ObtenerMiembrosPorEquipoAsync(equipo.Id);

            resultado.Add(new EquipoResumenDto
            {
                Id = equipo.Id,
                Nombre = equipo.Nombre,
                Rol = miembro?.Rol.ToString() ?? "",
                CantidadMiembros = miembros.Count,
                FechaCreacion = equipo.FechaCreacion
            });
        }

        return resultado;
    }

    public async Task<bool> CambiarRolMiembroAsync(Guid equipoId, Guid usuarioObjetivoId, RolEquipo nuevoRol, Guid usuarioSolicitanteId)
    {
        // 1. Solo un líder puede cambiar roles (Acceptance Criteria)
        var solicitante = await _equipoRepository.ObtenerMiembroAsync(equipoId, usuarioSolicitanteId);
        if (solicitante == null || solicitante.Rol != RolEquipo.Lider)
            return false;

        // 2. El miembro objetivo debe existir en el equipo
        var objetivo = await _equipoRepository.ObtenerMiembroAsync(equipoId, usuarioObjetivoId);
        if (objetivo == null)
            return false;

        // 3. Solo puede haber un líder activo: si se asigna un nuevo líder, se transfiere el liderazgo
        if (nuevoRol == RolEquipo.Lider)
        {
            var miembros = await _equipoRepository.ObtenerMiembrosPorEquipoAsync(equipoId);
            var liderActual = miembros.FirstOrDefault(m => m.Rol == RolEquipo.Lider && m.UsuarioId != usuarioObjetivoId);

            if (liderActual != null)
                await _equipoRepository.CambiarRolAsync(equipoId, liderActual.UsuarioId, RolEquipo.Colaborador);
        }

        return await _equipoRepository.CambiarRolAsync(equipoId, usuarioObjetivoId, nuevoRol);
    }
}
