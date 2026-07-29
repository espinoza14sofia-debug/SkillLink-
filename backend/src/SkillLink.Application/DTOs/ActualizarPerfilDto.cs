public class ActualizarPerfilDto
{
    public string Nombre { get; set; } = string.Empty;
    public string? Carrera { get; set; }
    public int? Semestre { get; set; }
    public string? Github { get; set; }
    public string? Linkedin { get; set; }
    public string? Descripcion { get; set; }
    public string? Foto { get; set; }
    public List<Guid>? HabilidadIds { get; set; } // <--- Cambiado a List<Guid>
}