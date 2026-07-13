using SkillLink.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace SkillLink.Application.Interfaces
{
    public interface IProyectoRepository
    {
        Task<Proyecto?> ObtenerPorIdAsync(Guid id);
        Task<Proyecto> CrearAsync(Proyecto proyecto);
        Task<bool> UsuarioPerteneceAlEquipoAsync(Guid equipoId, Guid usuarioId);
        Task<double> CalcularPorcentajeAvanceAsync(Guid proyectoId);
    }
}
