using SkillLink.Application.DTOs;
using SkillLink.Application.Interfaces;
using SkillLink.Domain.Entities;

namespace SkillLink.Application.Services;

public class HabilidadService : IHabilidadService
{
    private readonly IHabilidadRepository _habilidadRepository;

    public HabilidadService(IHabilidadRepository habilidadRepository)
    {
        _habilidadRepository = habilidadRepository;
    }

    public async Task<HabilidadRespuestaDto> AgregarHabilidadAsync(Guid usuarioId, HabilidadCrearDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Nombre))
            throw new Exception("El nombre de la habilidad es requerido");

        // Busca si la habilidad ya existe en el catálogo general; si no, la crea
        var habilidad = await _habilidadRepository.ObtenerPorNombreAsync(dto.Nombre);
        if (habilidad == null)
        {
            habilidad = new Habilidad
            {
                Id = Guid.NewGuid(),
                Nombre = dto.Nombre
            };
            habilidad = await _habilidadRepository.CrearHabilidadAsync(habilidad);
        }

        // Verifica que el usuario no la tenga ya agregada
        var yaExiste = await _habilidadRepository.ExisteUsuarioHabilidadAsync(usuarioId, habilidad.Id);
        if (yaExiste)
            throw new Exception("Ya tienes esta habilidad agregada a tu perfil");

        var usuarioHabilidad = new UsuarioHabilidad
        {
            UsuarioId = usuarioId,
            HabilidadId = habilidad.Id,
            Nivel = "Básico"
        };

        await _habilidadRepository.AgregarUsuarioHabilidadAsync(usuarioHabilidad);

        return new HabilidadRespuestaDto
        {
            Id = habilidad.Id,
            Nombre = habilidad.Nombre,
            Nivel = usuarioHabilidad.Nivel
        };
    }

    public async Task<List<HabilidadRespuestaDto>> ObtenerHabilidadesDeUsuarioAsync(Guid usuarioId)
    {
        var lista = await _habilidadRepository.ObtenerPorUsuarioAsync(usuarioId);

        return lista.Select(uh => new HabilidadRespuestaDto
        {
            Id = uh.HabilidadId,
            Nombre = uh.Habilidad?.Nombre ?? "",
            Nivel = uh.Nivel
        }).ToList();
    }

    public async Task EliminarHabilidadAsync(Guid usuarioId, Guid habilidadId)
    {
        var usuarioHabilidad = await _habilidadRepository.ObtenerUsuarioHabilidadAsync(usuarioId, habilidadId);
        if (usuarioHabilidad == null)
            throw new Exception("No tienes esta habilidad agregada a tu perfil.");

        await _habilidadRepository.EliminarUsuarioHabilidadAsync(usuarioHabilidad);
    }

    public async Task<HabilidadRespuestaDto> ActualizarNivelHabilidadAsync(
        Guid usuarioId,
        Guid habilidadId,
        ActualizarNivelHabilidadDto dto)
    {
        var nivelesValidos = new[] { "Básico", "Intermedio", "Avanzado" };

        if (!nivelesValidos.Contains(dto.Nivel))
            throw new Exception("Nivel inválido. Debe ser: Básico, Intermedio o Avanzado.");

        var usuarioHabilidad = await _habilidadRepository.ObtenerUsuarioHabilidadAsync(usuarioId, habilidadId);

        if (usuarioHabilidad == null)
            throw new Exception("No tienes esta habilidad agregada a tu perfil.");

        usuarioHabilidad.Nivel = dto.Nivel;

        await _habilidadRepository.GuardarCambiosAsync();

        return new HabilidadRespuestaDto
        {
            Id = usuarioHabilidad.HabilidadId,
            Nombre = usuarioHabilidad.Habilidad?.Nombre ?? "",
            Nivel = usuarioHabilidad.Nivel
        };
    }

    public async Task<List<SugerenciaCompaneroDto>> SugerirCompanerosAsync(Guid usuarioId)
    {
        var misHabilidades = await _habilidadRepository.ObtenerPorUsuarioAsync(usuarioId);
        if (misHabilidades.Count == 0)
        {
            return new List<SugerenciaCompaneroDto>();
        }

        var misHabilidadIds = misHabilidades.Select(h => h.HabilidadId).ToList();

        var coincidencias = await _habilidadRepository.ObtenerPorHabilidadesAsync(misHabilidadIds, usuarioId);

        var sugerencias = coincidencias
            .GroupBy(uh => uh.UsuarioId)
            .Select(g => new SugerenciaCompaneroDto
            {
                UsuarioId = g.Key,
                Nombre = g.First().Usuario?.Nombre ?? "",
                CantidadHabilidadesEnComun = g.Count(),
                HabilidadesEnComun = g.Select(uh => uh.Habilidad?.Nombre ?? "").ToList()
            })
            .OrderByDescending(s => s.CantidadHabilidadesEnComun)
            .Take(10)
            .ToList();

        return sugerencias;
    }
}