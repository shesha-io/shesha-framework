using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace Shesha.Authorization
{
    public static class JwtTokenHelper
    {
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
