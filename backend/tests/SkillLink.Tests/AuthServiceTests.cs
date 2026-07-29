using Microsoft.AspNetCore.Identity;
using Moq;
using SkillLink.Application.DTOs;
using SkillLink.Application.Interfaces;
using SkillLink.Application.Services;
using SkillLink.Domain.Entities;
using Xunit;

namespace SkillLink.Tests;

public class AuthServiceTests
{
    private readonly Mock<IUsuarioRepository> _usuarioRepositoryMock;
    private readonly Mock<IPasswordHasher<Usuario>> _passwordHasherMock;
    private readonly Mock<ITokenService> _tokenServiceMock;
    private readonly Mock<ITokenRecuperacionRepository> _tokenRecuperacionRepositoryMock;
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        _usuarioRepositoryMock = new Mock<IUsuarioRepository>();
        _passwordHasherMock = new Mock<IPasswordHasher<Usuario>>();
        _tokenServiceMock = new Mock<ITokenService>();
        _tokenRecuperacionRepositoryMock = new Mock<ITokenRecuperacionRepository>();

        _authService = new AuthService(
            _tokenRecuperacionRepositoryMock.Object,
            _usuarioRepositoryMock.Object,
            _passwordHasherMock.Object,
            _tokenServiceMock.Object
        );
    }

    // ---------- REGISTRO ----------

    [Fact]
    public async Task RegistrarAsync_ConEmailDuplicado_DeberiaRetornarError()
    {
        var dto = new UsuarioRegistroDto
        {
            Nombre = "Jendry Murillo",
            Email = "mjiia@test.com",
            Password = "murillo33",
            Carrera = "Ingeniería en Sistemas"
        };

        _usuarioRepositoryMock
            .Setup(r => r.ObtenerPorEmailAsync(dto.Email))
            .ReturnsAsync(new Usuario
            {
                Id = Guid.NewGuid(),
                Nombre = dto.Nombre,
                Email = dto.Email
            });

        var resultado = await _authService.RegistrarAsync(dto);

        Assert.False(resultado.Exito);
        Assert.Equal("El correo ya está registrado.", resultado.Error);
        Assert.Null(resultado.Usuario);

        _usuarioRepositoryMock.Verify(
            r => r.AgregarAsync(It.IsAny<Usuario>()),
            Times.Never);
    }

    [Fact]
    public async Task RegistrarAsync_ConDatosValidos_DeberiaCrearUsuario()
    {
        var dto = new UsuarioRegistroDto
        {
            Nombre = "Sofia Vargas",
            Email = "sofia@test.com",
            Password = "MiPassword123",
            Carrera = "Ingeniería en Sistemas"
        };

        _usuarioRepositoryMock
            .Setup(r => r.ObtenerPorEmailAsync(dto.Email))
            .ReturnsAsync((Usuario?)null);

        _passwordHasherMock
            .Setup(p => p.HashPassword(It.IsAny<Usuario>(), dto.Password))
            .Returns("hash-simulado");

        var resultado = await _authService.RegistrarAsync(dto);

        Assert.True(resultado.Exito);
        Assert.Null(resultado.Error);
        Assert.NotNull(resultado.Usuario);
        Assert.Equal(dto.Email, resultado.Usuario!.Email);

        _usuarioRepositoryMock.Verify(
            r => r.AgregarAsync(It.IsAny<Usuario>()),
            Times.Once);

        _usuarioRepositoryMock.Verify(
            r => r.GuardarCambiosAsync(),
            Times.Once);
    }
    // ---------- LOGIN ----------

    [Fact]
    public async Task LoginAsync_ConCredencialesCorrectas_DeberiaRetornarToken()
    {
        var dto = new LoginDto
        {
            Email = "sofia@test.com",
            Password = "MiPassword123"
        };

        var usuario = new Usuario
        {
            Id = Guid.NewGuid(),
            Nombre = "Sofia Vargas",
            Email = dto.Email,
            Carrera = "Ingeniería en Sistemas",
            PasswordHash = "hash-guardado"
        };

        _usuarioRepositoryMock
            .Setup(r => r.ObtenerPorEmailAsync(dto.Email))
            .ReturnsAsync(usuario);

        _passwordHasherMock
            .Setup(p => p.VerifyHashedPassword(usuario, usuario.PasswordHash, dto.Password))
            .Returns(PasswordVerificationResult.Success);

        _tokenServiceMock
            .Setup(t => t.GenerateToken(usuario.Id, usuario.Email))
            .Returns("token-jwt-simulado");

        var resultado = await _authService.LoginAsync(dto);

        Assert.True(resultado.Exito);
        Assert.NotNull(resultado.Resultado);
        Assert.Equal("token-jwt-simulado", resultado.Resultado!.Token);
        Assert.Equal(dto.Email, resultado.Resultado.Usuario.Email);
    }

    [Fact]
    public async Task LoginAsync_ConEmailInexistente_DeberiaRetornarError()
    {
        var dto = new LoginDto
        {
            Email = "noexiste@test.com",
            Password = "12345678"
        };

        _usuarioRepositoryMock
            .Setup(r => r.ObtenerPorEmailAsync(dto.Email))
            .ReturnsAsync((Usuario?)null);

        var resultado = await _authService.LoginAsync(dto);

        Assert.False(resultado.Exito);
        Assert.Equal("Credenciales inválidas.", resultado.Error);
        Assert.Null(resultado.Resultado);
    }

    [Fact]
    public async Task LoginAsync_ConPasswordIncorrecto_DeberiaRetornarError()
    {
        var dto = new LoginDto
        {
            Email = "sofia@test.com",
            Password = "passwordIncorrecto"
        };

        var usuario = new Usuario
        {
            Id = Guid.NewGuid(),
            Nombre = "Sofia Vargas",
            Email = dto.Email,
            PasswordHash = "hash-guardado"
        };

        _usuarioRepositoryMock
            .Setup(r => r.ObtenerPorEmailAsync(dto.Email))
            .ReturnsAsync(usuario);

        _passwordHasherMock
            .Setup(p => p.VerifyHashedPassword(usuario, usuario.PasswordHash, dto.Password))
            .Returns(PasswordVerificationResult.Failed);

        var resultado = await _authService.LoginAsync(dto);

        Assert.False(resultado.Exito);
        Assert.Equal("Credenciales inválidas.", resultado.Error);
        Assert.Null(resultado.Resultado);

        _tokenServiceMock.Verify(
            t => t.GenerateToken(It.IsAny<Guid>(), It.IsAny<string>()),
            Times.Never);
    }
    // ---------- RECUPERACIÓN DE CONTRASEÑA ----------

    [Fact]
    public async Task SolicitarRecuperacionAsync_UsuarioNoExiste_DeberiaRetornarExito()
    {
        var dto = new SolicitarRecuperacionDto
        {
            Email = "noexiste@test.com"
        };

        _usuarioRepositoryMock
            .Setup(r => r.ObtenerPorEmailAsync(dto.Email))
            .ReturnsAsync((Usuario?)null);

        var resultado = await _authService.SolicitarRecuperacionAsync(dto);

        Assert.True(resultado.Exito);
        Assert.Null(resultado.Error);
    }

    [Fact]
    public async Task RestablecerPasswordAsync_TokenValido_DeberiaCambiarPassword()
    {
        var usuarioId = Guid.NewGuid();

        var dto = new RestablecerPasswordDto
        {
            Token = "token-valido",
            NuevoPassword = "NuevaPassword123"
        };

        var token = new TokenRecuperacion
        {
            Token = dto.Token,
            UsuarioId = usuarioId,
            FechaExpiracion = DateTime.UtcNow.AddHours(1)
        };

        var usuario = new Usuario
        {
            Id = usuarioId,
            Email = "sofia@test.com",
            PasswordHash = "hash-anterior"
        };

        _tokenRecuperacionRepositoryMock
            .Setup(r => r.ObtenerPorTokenAsync(dto.Token))
            .ReturnsAsync(token);

        _usuarioRepositoryMock
            .Setup(r => r.ObtenerPorIdAsync(usuarioId))
            .ReturnsAsync(usuario);

        _passwordHasherMock
            .Setup(p => p.HashPassword(usuario, dto.NuevoPassword))
            .Returns("nuevo-hash");

        var resultado = await _authService.RestablecerPasswordAsync(dto);

        Assert.True(resultado.Exito);
        Assert.Null(resultado.Error);

        Assert.Equal("nuevo-hash", usuario.PasswordHash);

        _usuarioRepositoryMock.Verify(
            r => r.GuardarCambiosAsync(),
            Times.Once);
    }
}