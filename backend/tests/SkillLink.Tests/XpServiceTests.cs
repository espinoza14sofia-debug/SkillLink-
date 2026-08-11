using SkillLink.Application.DTOs;
using SkillLink.Application.Interfaces;
using SkillLink.Application.Services;
using SkillLink.Domain.Entities;
using Moq;
using Xunit;

namespace SkillLink.Tests;

public class XpServiceTests
{
    private readonly Mock<IUsuarioRepository> _usuarioRepositoryMock;
    private readonly Mock<INivelService> _nivelServiceMock;
    private readonly Mock<ILogroService> _logroServiceMock;
    private readonly Mock<INotificacionService> _notificacionServiceMock;
    private readonly XpService _xpService;

    public XpServiceTests()
    {
        _usuarioRepositoryMock = new Mock<IUsuarioRepository>();
        _nivelServiceMock = new Mock<INivelService>();
        _logroServiceMock = new Mock<ILogroService>();
        _notificacionServiceMock = new Mock<INotificacionService>();

        _xpService = new XpService(
            _usuarioRepositoryMock.Object,
            _nivelServiceMock.Object,
            _logroServiceMock.Object,
            _notificacionServiceMock.Object
        );
    }

    // ============================================================
    // OtorgarXpAsync - VALIDACIONES
    // ============================================================

    [Theory]
    [InlineData(0)]
    [InlineData(-10)]
    public async Task OtorgarXpAsync_ConCantidadInvalida_DeberiaLanzarArgumentException(
        int cantidad)
    {
        var usuarioId = Guid.NewGuid();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => _xpService.OtorgarXpAsync(usuarioId, cantidad));

        Assert.Equal(
            "La cantidad de XP debe ser mayor a cero.",
            ex.Message
        );

        _usuarioRepositoryMock.Verify(
            r => r.ObtenerPorIdAsync(It.IsAny<Guid>()),
            Times.Never
        );
    }

    [Fact]
    public async Task OtorgarXpAsync_ConUsuarioInexistente_DeberiaLanzarInvalidOperationException()
    {
        var usuarioId = Guid.NewGuid();

        _usuarioRepositoryMock
            .Setup(r => r.ObtenerPorIdAsync(usuarioId))
            .ReturnsAsync((Usuario?)null);

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _xpService.OtorgarXpAsync(usuarioId, 10));

        Assert.Equal("Usuario no encontrado.", ex.Message);

        _usuarioRepositoryMock.Verify(
            r => r.GuardarCambiosAsync(),
            Times.Never
        );
    }

    // ============================================================
    // OtorgarXpAsync - ACTUALIZACIÓN DE XP Y NIVEL
    // ============================================================

    [Fact]
    public async Task OtorgarXpAsync_ConDatosValidos_DeberiaSumarXpYActualizarNivel()
    {
        var usuarioId = Guid.NewGuid();

        var usuario = new Usuario
        {
            Id = usuarioId,
            Xp = 10,
            Nivel = 1
        };

        _usuarioRepositoryMock
            .Setup(r => r.ObtenerPorIdAsync(usuarioId))
            .ReturnsAsync(usuario);

        // 10 + 5 = 15 XP
        _nivelServiceMock
            .Setup(n => n.CalcularNivelAsync(15))
            .ReturnsAsync(new NivelInfoDto
            {
                Nivel = 1
            });

        _logroServiceMock
            .Setup(l => l.EvaluarYOtorgarAsync(usuarioId))
            .ReturnsAsync(new List<LogroDto>());

        var resultado = await _xpService.OtorgarXpAsync(usuarioId, 5);

        Assert.Equal(15, usuario.Xp);
        Assert.Equal(1, usuario.Nivel);
        Assert.False(resultado.SubioDeNivel);
        Assert.Empty(resultado.NuevosLogros);

        _usuarioRepositoryMock.Verify(
            r => r.GuardarCambiosAsync(),
            Times.Once
        );

        _nivelServiceMock.Verify(
            n => n.CalcularNivelAsync(15),
            Times.Once
        );

        _logroServiceMock.Verify(
            l => l.EvaluarYOtorgarAsync(usuarioId),
            Times.Once
        );
    }

    // ============================================================
    // OtorgarXpAsync - SUBIDA DE NIVEL
    // ============================================================

    [Fact]
    public async Task OtorgarXpAsync_SubiendoDeNivel_DeberiaActualizarNivelYNotificar()
    {
        var usuarioId = Guid.NewGuid();

        var usuario = new Usuario
        {
            Id = usuarioId,
            Xp = 95,
            Nivel = 1
        };

        _usuarioRepositoryMock
            .Setup(r => r.ObtenerPorIdAsync(usuarioId))
            .ReturnsAsync(usuario);

        // 95 + 10 = 105 XP -> nivel 2
        _nivelServiceMock
            .Setup(n => n.CalcularNivelAsync(105))
            .ReturnsAsync(new NivelInfoDto
            {
                Nivel = 2
            });

        _logroServiceMock
            .Setup(l => l.EvaluarYOtorgarAsync(usuarioId))
            .ReturnsAsync(new List<LogroDto>());

        var resultado = await _xpService.OtorgarXpAsync(usuarioId, 10);

        Assert.Equal(105, usuario.Xp);
        Assert.Equal(2, usuario.Nivel);
        Assert.True(resultado.SubioDeNivel);

        _notificacionServiceMock.Verify(
            n => n.CrearAsync(
                usuarioId,
                "subida_nivel",
                It.Is<string>(s => s.Contains("2"))
            ),
            Times.Once
        );

        _logroServiceMock.Verify(
            l => l.EvaluarYOtorgarAsync(usuarioId),
            Times.Once
        );
    }

    // ============================================================
    // OtorgarXpAsync - NUEVOS LOGROS
    // ============================================================

    [Fact]
    public async Task OtorgarXpAsync_ConNuevosLogros_DeberiaAsignarlosAlDtoYNotificarCadaUno()
    {
        var usuarioId = Guid.NewGuid();

        var usuario = new Usuario
        {
            Id = usuarioId,
            Xp = 10,
            Nivel = 1
        };

        var logros = new List<LogroDto>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Nombre = "Primer Mensaje",
                Desbloqueado = true
            },
            new()
            {
                Id = Guid.NewGuid(),
                Nombre = "Conector Novato",
                Desbloqueado = true
            }
        };

        _usuarioRepositoryMock
            .Setup(r => r.ObtenerPorIdAsync(usuarioId))
            .ReturnsAsync(usuario);

        _nivelServiceMock
            .Setup(n => n.CalcularNivelAsync(15))
            .ReturnsAsync(new NivelInfoDto
            {
                Nivel = 1
            });

        _logroServiceMock
            .Setup(l => l.EvaluarYOtorgarAsync(usuarioId))
            .ReturnsAsync(logros);

        var resultado = await _xpService.OtorgarXpAsync(usuarioId, 5);

        Assert.Equal(15, usuario.Xp);
        Assert.Equal(1, usuario.Nivel);

        Assert.Equal(2, resultado.NuevosLogros.Count);

        Assert.Contains(
            resultado.NuevosLogros,
            l => l.Nombre == "Primer Mensaje"
        );

        Assert.Contains(
            resultado.NuevosLogros,
            l => l.Nombre == "Conector Novato"
        );

        _notificacionServiceMock.Verify(
            n => n.CrearAsync(
                usuarioId,
                "logro_desbloqueado",
                It.Is<string>(s => s.Contains("Primer Mensaje"))
            ),
            Times.Once
        );

        _notificacionServiceMock.Verify(
            n => n.CrearAsync(
                usuarioId,
                "logro_desbloqueado",
                It.Is<string>(s => s.Contains("Conector Novato"))
            ),
            Times.Once
        );
    }

    // ============================================================
    // OtorgarXpPorMensajeAsync - USUARIO INEXISTENTE
    // ============================================================

    [Fact]
    public async Task OtorgarXpPorMensajeAsync_ConUsuarioInexistente_DeberiaLanzarInvalidOperationException()
    {
        var usuarioId = Guid.NewGuid();

        _usuarioRepositoryMock
            .Setup(r => r.ObtenerPorIdAsync(usuarioId))
            .ReturnsAsync((Usuario?)null);

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _xpService.OtorgarXpPorMensajeAsync(usuarioId)
        );
    }

    // ============================================================
    // OtorgarXpPorMensajeAsync - COOLDOWN
    // ============================================================

    [Fact]
    public async Task OtorgarXpPorMensajeAsync_DentroDelCooldown_NoDeberiaOtorgarXpYRetornarNull()
    {
        var usuarioId = Guid.NewGuid();

        var usuario = new Usuario
        {
            Id = usuarioId,
            Xp = 10,
            Nivel = 1,
            UltimoXpMensajeFecha = DateTime.UtcNow.AddMinutes(-1)
        };

        _usuarioRepositoryMock
            .Setup(r => r.ObtenerPorIdAsync(usuarioId))
            .ReturnsAsync(usuario);

        var resultado =
            await _xpService.OtorgarXpPorMensajeAsync(usuarioId);

        Assert.Null(resultado);

        Assert.Equal(10, usuario.Xp);

        _usuarioRepositoryMock.Verify(
            r => r.GuardarCambiosAsync(),
            Times.Never
        );

        _nivelServiceMock.Verify(
            n => n.CalcularNivelAsync(It.IsAny<int>()),
            Times.Never
        );
    }

    // ============================================================
    // OtorgarXpPorMensajeAsync - FUERA DEL COOLDOWN
    // ============================================================

    [Fact]
    public async Task OtorgarXpPorMensajeAsync_FueraDelCooldown_DeberiaOtorgar5XpYActualizarFecha()
    {
        var usuarioId = Guid.NewGuid();

        var usuario = new Usuario
        {
            Id = usuarioId,
            Xp = 10,
            Nivel = 1,
            UltimoXpMensajeFecha = null
        };

        _usuarioRepositoryMock
            .Setup(r => r.ObtenerPorIdAsync(usuarioId))
            .ReturnsAsync(usuario);

        // 10 + 5 = 15 XP
        _nivelServiceMock
            .Setup(n => n.CalcularNivelAsync(15))
            .ReturnsAsync(new NivelInfoDto
            {
                Nivel = 1
            });

        _logroServiceMock
            .Setup(l => l.EvaluarYOtorgarAsync(usuarioId))
            .ReturnsAsync(new List<LogroDto>());

        var resultado =
            await _xpService.OtorgarXpPorMensajeAsync(usuarioId);

        Assert.NotNull(resultado);

        Assert.Equal(15, usuario.Xp);

        Assert.NotNull(usuario.UltimoXpMensajeFecha);

        // 1 vez al guardar la fecha del cooldown
        // 1 vez dentro de OtorgarXpAsync
        _usuarioRepositoryMock.Verify(
            r => r.GuardarCambiosAsync(),
            Times.Exactly(2)
        );
    }

    // ============================================================
    // OtorgarXpPorMensajeAsync - DESPUÉS DEL COOLDOWN
    // ============================================================

    [Fact]
    public async Task OtorgarXpPorMensajeAsync_JustoDespuesDelCooldown_DeberiaOtorgarXp()
    {
        var usuarioId = Guid.NewGuid();

        var usuario = new Usuario
        {
            Id = usuarioId,
            Xp = 0,
            Nivel = 1,
            UltimoXpMensajeFecha = DateTime.UtcNow.AddMinutes(-6)
        };

        _usuarioRepositoryMock
            .Setup(r => r.ObtenerPorIdAsync(usuarioId))
            .ReturnsAsync(usuario);

        _nivelServiceMock
            .Setup(n => n.CalcularNivelAsync(5))
            .ReturnsAsync(new NivelInfoDto
            {
                Nivel = 1
            });

        _logroServiceMock
            .Setup(l => l.EvaluarYOtorgarAsync(usuarioId))
            .ReturnsAsync(new List<LogroDto>());

        var resultado =
            await _xpService.OtorgarXpPorMensajeAsync(usuarioId);

        Assert.NotNull(resultado);

        Assert.Equal(5, usuario.Xp);

        Assert.NotNull(usuario.UltimoXpMensajeFecha);
    }
}