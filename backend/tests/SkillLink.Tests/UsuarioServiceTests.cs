using Moq;
using SkillLink.Application.DTOs;
using SkillLink.Application.Interfaces;
using SkillLink.Application.Services;
using SkillLink.Domain.Entities;
using Xunit;

namespace SkillLink.Tests;

public class UsuarioServiceTests
{
    private readonly Mock<IUsuarioRepository> _usuarioRepositoryMock;
    private readonly UsuarioService _usuarioService;

    public UsuarioServiceTests()
    {
        _usuarioRepositoryMock = new Mock<IUsuarioRepository>();
        _usuarioService = new UsuarioService(_usuarioRepositoryMock.Object);
    }

    // ---------- ActualizarPerfilAsync ----------

    [Fact]
    public async Task ActualizarPerfilAsync_ConUsuarioInexistente_DeberiaLanzarExcepcion()
    {
        var id = Guid.NewGuid();
        var dto = new ActualizarPerfilDto { Nombre = "Nuevo Nombre" };

        _usuarioRepositoryMock
            .Setup(r => r.ObtenerPorIdAsync(id))
            .ReturnsAsync((Usuario?)null);

        var ex = await Assert.ThrowsAsync<Exception>(
            () => _usuarioService.ActualizarPerfilAsync(id, dto));

        Assert.Equal("Usuario no encontrado", ex.Message);
    }

    [Fact]
    public async Task ActualizarPerfilAsync_ConNombreVacio_DeberiaLanzarExcepcion()
    {
        var id = Guid.NewGuid();
        var usuario = new Usuario { Id = id, Nombre = "Original" };
        var dto = new ActualizarPerfilDto { Nombre = "   " };

        _usuarioRepositoryMock
            .Setup(r => r.ObtenerPorIdAsync(id))
            .ReturnsAsync(usuario);

        var ex = await Assert.ThrowsAsync<Exception>(
            () => _usuarioService.ActualizarPerfilAsync(id, dto));

        Assert.Equal("El nombre no puede estar vacío", ex.Message);

        _usuarioRepositoryMock.Verify(
            r => r.GuardarCambiosAsync(),
            Times.Never);
    }

    [Fact]
    public async Task ActualizarPerfilAsync_ConDatosValidos_DeberiaActualizarCampos()
    {
        var id = Guid.NewGuid();
        var usuario = new Usuario { Id = id, Nombre = "Viejo Nombre", Carrera = "Vieja Carrera" };

        var dto = new ActualizarPerfilDto
        {
            Nombre = "Sofia Vargas",
            Carrera = "Ingeniería en Sistemas",
            Semestre = 5,
            Github = "sofiav",
            Linkedin = "sofia-vargas",
            Descripcion = "Desarrolladora backend",
            Foto = "foto.png",
            HabilidadIds = null
        };

        _usuarioRepositoryMock
            .Setup(r => r.ObtenerPorIdAsync(id))
            .ReturnsAsync(usuario);

        await _usuarioService.ActualizarPerfilAsync(id, dto);

        Assert.Equal(dto.Nombre, usuario.Nombre);
        Assert.Equal(dto.Carrera, usuario.Carrera);
        Assert.Equal(dto.Semestre, usuario.Semestre);
        Assert.Equal(dto.Github, usuario.Github);
        Assert.Equal(dto.Linkedin, usuario.Linkedin);
        Assert.Equal(dto.Descripcion, usuario.Descripcion);
        Assert.Equal(dto.Foto, usuario.Foto);

        _usuarioRepositoryMock.Verify(r => r.GuardarCambiosAsync(), Times.Once);
        _usuarioRepositoryMock.Verify(
            r => r.ActualizarHabilidadesUsuarioAsync(It.IsAny<Guid>(), It.IsAny<List<Guid>>()),
            Times.Never);
    }

    [Fact]
    public async Task ActualizarPerfilAsync_ConHabilidadIds_DeberiaSincronizarHabilidades()
    {
        var id = Guid.NewGuid();
        var usuario = new Usuario { Id = id, Nombre = "Sofia" };
        var habilidadIds = new List<Guid> { Guid.NewGuid(), Guid.NewGuid() };

        var dto = new ActualizarPerfilDto
        {
            Nombre = "Sofia Vargas",
            HabilidadIds = habilidadIds
        };

        _usuarioRepositoryMock
            .Setup(r => r.ObtenerPorIdAsync(id))
            .ReturnsAsync(usuario);

        await _usuarioService.ActualizarPerfilAsync(id, dto);

        _usuarioRepositoryMock.Verify(
            r => r.ActualizarHabilidadesUsuarioAsync(id, habilidadIds),
            Times.Once);

        _usuarioRepositoryMock.Verify(r => r.GuardarCambiosAsync(), Times.Once);
    }

    // ---------- ObtenerPerfilPublicoAsync ----------

    [Fact]
    public async Task ObtenerPerfilPublicoAsync_ConUsuarioExistente_DeberiaRetornarDatosPublicos()
    {
        var id = Guid.NewGuid();
        var usuario = new Usuario
        {
            Id = id,
            Nombre = "Sofia Vargas",
            Foto = "foto.png",
            Carrera = "Ingeniería en Sistemas",
            Descripcion = "Backend dev",
            Nivel = 3,
            Xp = 250
        };

        _usuarioRepositoryMock
            .Setup(r => r.ObtenerPorIdAsync(id))
            .ReturnsAsync(usuario);

        var resultado = await _usuarioService.ObtenerPerfilPublicoAsync(id);

        Assert.NotNull(resultado);

        var tipo = resultado.GetType();
        Assert.Equal(usuario.Nombre, tipo.GetProperty("nombre")!.GetValue(resultado));
        Assert.Equal(usuario.Nivel, tipo.GetProperty("nivel")!.GetValue(resultado));
        Assert.Equal(usuario.Xp, tipo.GetProperty("xp")!.GetValue(resultado));
    }

    [Fact]
    public async Task ObtenerPerfilPublicoAsync_ConUsuarioInexistente_DeberiaRetornarNull()
    {
        var id = Guid.NewGuid();

        _usuarioRepositoryMock
            .Setup(r => r.ObtenerPorIdAsync(id))
            .ReturnsAsync((Usuario?)null);

        var resultado = await _usuarioService.ObtenerPerfilPublicoAsync(id);

        Assert.Null(resultado);
    }

    // ---------- ActualizarHabilidadesUsuarioAsync ----------

    [Fact]
    public async Task ActualizarHabilidadesUsuarioAsync_DeberiaLlamarRepositorioYGuardar()
    {
        var usuarioId = Guid.NewGuid();
        var habilidadIds = new List<Guid> { Guid.NewGuid() };

        await _usuarioService.ActualizarHabilidadesUsuarioAsync(usuarioId, habilidadIds);

        _usuarioRepositoryMock.Verify(
            r => r.ActualizarHabilidadesUsuarioAsync(usuarioId, habilidadIds),
            Times.Once);

        _usuarioRepositoryMock.Verify(r => r.GuardarCambiosAsync(), Times.Once);
    }
}