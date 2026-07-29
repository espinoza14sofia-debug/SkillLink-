public interface IUsuarioService
{
    Task ActualizarPerfilAsync(Guid id, ActualizarPerfilDto dto);
    Task<object> ObtenerPerfilPublicoAsync(Guid id);

    
    Task<IEnumerable<object>> ObtenerHabilidadesDeUsuarioAsync(Guid usuarioId);
    Task ActualizarHabilidadesUsuarioAsync(Guid usuarioId, List<Guid> habilidadIds);
}