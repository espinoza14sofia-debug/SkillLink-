using SkillLink.Application.DTOs;

namespace SkillLink.Application.Interfaces;

public interface ILogroService
{
    Task<List<LogroDto>> ObtenerLogrosDeUsuarioAsync(Guid usuarioId);
    Task EvaluarYOtorgarAsync(Guid usuarioId, int xpTotal, int misionesCompletadas);
}