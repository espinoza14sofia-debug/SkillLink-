using Microsoft.EntityFrameworkCore;
using SkillLink.Application.Interfaces;
using SkillLink.Domain.Entities;
using SkillLink.Infrastructure.Persistence;

namespace SkillLink.Infrastructure.Repositories
{
    public class TokenRecuperacionRepository : ITokenRecuperacionRepository
    {
        private readonly SkillLinkDbContext _context;

        public TokenRecuperacionRepository(SkillLinkDbContext context)
        {
            _context = context;
        }

        public async Task CrearAsync(TokenRecuperacion token)
        {
            await _context.TokensRecuperacion.AddAsync(token);
        }

        public async Task<TokenRecuperacion?> ObtenerPorTokenAsync(string token)
        {
            return await _context.TokensRecuperacion
                .FirstOrDefaultAsync(t => t.Token == token);
        }

        public async Task GuardarCambiosAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}