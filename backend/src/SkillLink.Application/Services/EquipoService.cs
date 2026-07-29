using SkillLink.Application.DTOs;
using SkillLink.Application.Interfaces;
using SkillLink.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SkillLink.Application.Services
{
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
            // 1. Obtener todos los miembros para validar roles de forma segura
            var miembros = await _equipoRepository.ObtenerMiembrosPorEquipoAsync(equipoId);

            var solicitante = miembros.FirstOrDefault(m => m.UsuarioId == usuarioSolicitanteId);
            if (solicitante == null || solicitante.Rol != RolEquipo.Lider)
                return false;

            // 2. El miembro objetivo debe existir en el equipo
            var objetivo = miembros.FirstOrDefault(m => m.UsuarioId == usuarioObjetivoId);
            if (objetivo == null)
                return false;

            // 3. Si se asigna un nuevo líder, el líder actual pasa a ser colaborador
            if (nuevoRol == RolEquipo.Lider)
            {
                var lideresActuales = miembros.Where(m => m.Rol == RolEquipo.Lider && m.UsuarioId != usuarioObjetivoId).ToList();
                foreach (var lider in lideresActuales)
                {
                    await _equipoRepository.CambiarRolAsync(equipoId, lider.UsuarioId, RolEquipo.Colaborador);
                }
            }

            return await _equipoRepository.CambiarRolAsync(equipoId, usuarioObjetivoId, nuevoRol);
        }

        public async Task<bool> SalirDelEquipoAsync(Guid equipoId, Guid usuarioId)
        {
            var miembro = await _equipoRepository.ObtenerMiembroAsync(equipoId, usuarioId);
            if (miembro == null) return false;

            return await _equipoRepository.EliminarMiembroAsync(equipoId, usuarioId);
        }
    }
}