using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Shesha.Authentication.JwtBearer;
using Shesha.Configuration;
using Shesha.Services;
using System;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Authentication
{
    public static class AuthConfigurer
    {
        public static void Configure(IServiceCollection services, IConfiguration configuration)
        {
            if (bool.TryParse(configuration["Authentication:JwtBearer:IsEnabled"], out var jwtEnabled) && jwtEnabled)
            {
                services.AddAuthentication(options => {
                    options.DefaultAuthenticateScheme = "JwtBearer";
                    options.DefaultChallengeScheme = "JwtBearer";
                }).AddJwtBearer("JwtBearer", options =>
                {
                    options.Audience = configuration["Authentication:JwtBearer:Audience"];

                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        // The signing key must match!
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(configuration.GetRequired("Authentication:JwtBearer:SecurityKey"))),

                        // Validate the JWT Issuer (iss) claim
                        ValidateIssuer = true,
                        ValidIssuer = configuration.GetRequired("Authentication:JwtBearer:Issuer"),

                        // Validate the JWT Audience (aud) claim
                        ValidateAudience = true,
                        ValidAudience = configuration.GetRequired("Authentication:JwtBearer:Audience"),

                        // Validate the token expiry
                        ValidateLifetime = true,

                        // If you want to allow a certain amount of clock drift, set that here
                        ClockSkew = TimeSpan.Zero
                    };

                    options.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = OnMessageReceivedAsync,
                        OnTokenValidated = context => context.EnsureTokenIsNotBlacklistedAsync(),
                    };
                });
            }
        }

        /* This method is needed to authorize custom clients like SignalR */
        private static async Task OnMessageReceivedAsync(MessageReceivedContext context)
        {
            var iocManager = StaticContext.IocManager;
            var handlers = iocManager.ResolveAll<IJwtBearerOnMessageReceivedHandler>();
            try {
                foreach (var handler in handlers)
                {
                    await handler.OnMessageReceivedAsync(context);
                }
            }
            finally
            {
                foreach (var handler in handlers)
                    iocManager.Release(handler);
            }            
        }
    }
}
