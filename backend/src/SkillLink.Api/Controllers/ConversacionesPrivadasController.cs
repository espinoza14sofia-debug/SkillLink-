using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillLink.Application.Interfaces;

namespace SkillLink.Api.Controllers;
 
[ApiController]
[Route("api/mensajes-privados/conversaciones")]
[Authorize]
public class ConversacionesPrivadasController : ControllerBase
{
    private readonly IMensajePrivadoService _service;

    public ConversacionesPrivadasController(IMensajePrivadoService service)
    {
        _service = service;
    }

    private Guid? ObtenerUsuarioId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                           ?? User.FindFirstValue("sub");
        return Guid.TryParse(userIdClaim, out var id) ? id : null;
    }

    [HttpGet]
    public async Task<IActionResult> Obtener()
    {
        var usuarioId = ObtenerUsuarioId();
        if (usuarioId == null) return Unauthorized();

        var conversaciones = await _service.ObtenerConversacionesAsync(usuarioId.Value);
        return Ok(conversaciones);
    }
}
