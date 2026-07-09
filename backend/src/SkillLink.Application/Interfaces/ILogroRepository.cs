using SkillLink.Domain.Entities;

namespace SkillLink.Application.Interfaces;

public interface ILogroRepository
{
    Task<List<Logro>> ObtenerTodosAsync();
    Task<List<UsuarioLogro>> ObtenerPorUsuarioAsync(Guid usuarioId);
    Task<bool> YaTieneLogroAsync(Guid usuarioId, Guid logroId);
    Task OtorgarAsync(UsuarioLogro usuarioLogro);
    Task GuardarCambiosAsync();
}