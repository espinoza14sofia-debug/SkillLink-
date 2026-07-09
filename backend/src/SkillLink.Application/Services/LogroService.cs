using SkillLink.Application.DTOs;
using SkillLink.Application.Interfaces;
using SkillLink.Domain.Entities;

namespace SkillLink.Application.Services;

public class LogroService : ILogroService
{
    private readonly ILogroRepository _logroRepository;

    public LogroService(ILogroRepository logroRepository)
    {
        _logroRepository = logroRepository;
    }

    public async Task<List<LogroDto>> ObtenerLogrosDeUsuarioAsync(Guid usuarioId)
    {
        var todos = await _logroRepository.ObtenerTodosAsync();
        var obtenidos = await _logroRepository.ObtenerPorUsuarioAsync(usuarioId);

        return todos.Select(logro =>
        {
            var obtenido = obtenidos.FirstOrDefault(o => o.LogroId == logro.Id);
            return new LogroDto
            {
                Id = logro.Id,
                Nombre = logro.Nombre,
                Descripcion = logro.Descripcion,
                Desbloqueado = obtenido != null,
                FechaObtenido = obtenido?.FechaObtenido
            };
        }).ToList();
    }

    public async Task EvaluarYOtorgarAsync(Guid usuarioId, int xpTotal, int misionesCompletadas)
    {
        var logros = await _logroRepository.ObtenerTodosAsync();

        foreach (var logro in logros)
        {
            var cumple = logro.TipoCondicion switch
            {
                "xp_total" => xpTotal >= logro.ValorCondicion,
                "misiones_completadas" => misionesCompletadas >= logro.ValorCondicion,
                _ => false
            };

            if (!cumple) continue;

            var yaLoTiene = await _logroRepository.YaTieneLogroAsync(usuarioId, logro.Id);
            if (yaLoTiene) continue;

            await _logroRepository.OtorgarAsync(new UsuarioLogro
            {
                UsuarioId = usuarioId,
                LogroId = logro.Id,
                FechaObtenido = DateTime.UtcNow
            });
        }

        await _logroRepository.GuardarCambiosAsync();
    }
}