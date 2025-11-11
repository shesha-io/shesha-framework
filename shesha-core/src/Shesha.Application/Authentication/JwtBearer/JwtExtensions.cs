using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Shesha.Authentication.JwtBearer
{
    /// <summary>
    /// JWT tokens extensions
    /// </summary>
    public static class JwtExtensions
    {
        public static async Task EnsureTokenIsNotkBlacklistedAsync(this TokenValidatedContext context) 
        {
            var tokenBlacklistService = context.HttpContext.RequestServices.GetRequiredService<ITokenBlacklistService>();

            var jti = context.Principal?.GetTokenId();
            if (!string.IsNullOrWhiteSpace(jti) && await tokenBlacklistService.IsTokenBlacklistedAsync(jti))
                context.Fail("Token is blacklisted");
        }

        public static string GetTokenId(this ClaimsPrincipal principal) 
        {
            return principal.FindFirst("jti")?.Value;
        }

        public static DateTime? GetTokenExpirationDate(this ClaimsPrincipal principal) 
        {
            var expClaim = principal.FindFirst("exp")?.Value;

            return expClaim != null && long.TryParse(expClaim, out long expUnix)
                ? DateTimeOffset.FromUnixTimeSeconds(expUnix).UtcDateTime
                : null;
        }

        public static JwtSecurityToken GetSecurityToken(this HttpContext httpContext)
        {
            var cookies = httpContext?.Request.Cookies;
            var jwtToken = cookies?["Abp.AuthToken"];
            if (string.IsNullOrWhiteSpace(jwtToken))
                return null;

            var handler = new JwtSecurityTokenHandler();
            return handler.ReadToken(jwtToken) as JwtSecurityToken;
        }

        public static string GetUsernameFromJwtToken(this HttpContext httpContext)
        {
            var token = httpContext.GetSecurityToken();
            return token?.Claims.FirstOrDefault(claim => claim.Type == ClaimTypes.Name)?.Value;
        }
    }
}
