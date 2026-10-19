using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Shesha.Authentication.JwtBearer
{
    /// <summary>
    /// JWT tokens extensions
    /// </summary>
    public static class JwtExtensions
    {
        public static async Task EnsureTokenIsNotBlacklistedAsync(this TokenValidatedContext context)
        {
            var tokenBlacklistService = context.HttpContext.RequestServices.GetRequiredService<ITokenBlacklistService>();

            var jti = context.Principal?.GetTokenId();
            if (!string.IsNullOrWhiteSpace(jti) && await tokenBlacklistService.IsTokenBlacklistedAsync(jti))
                context.Fail("Token is blacklisted");
        }

        public static string? GetTokenId(this ClaimsPrincipal principal)
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

        public static string? GetAuthTokenCookie(this HttpContext httpContext)
        {
            return httpContext != null
                ? httpContext.Request.Cookies["Abp.AuthToken"]
                : null;
        }
    }
}
