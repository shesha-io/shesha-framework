using Microsoft.IdentityModel.Tokens;
using System;

namespace Shesha.Authentication.JwtBearer
{
    public class TokenAuthConfiguration
    {
        public required SymmetricSecurityKey SecurityKey { get; set; }

        public required string Issuer { get; set; }

        public required string Audience { get; set; }

        public required SigningCredentials SigningCredentials { get; set; }

        public TimeSpan Expiration { get; set; }
    }
}
