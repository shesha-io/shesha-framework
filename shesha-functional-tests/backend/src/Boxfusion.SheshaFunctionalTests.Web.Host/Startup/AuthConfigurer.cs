using Abp.Runtime.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Shesha;
using Shesha.Authentication.JwtBearer;
using Shesha.Configuration;
using System;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Boxfusion.SheshaFunctionalTests.Web.Host.Startup
{
    public static class AuthConfigurer
    {
        public static void Configure(IServiceCollection services, IConfiguration configuration)
        {
            if (bool.TryParse(configuration["Authentication:JwtBearer:IsEnabled"], out var isEnabled) && isEnabled)
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
                        OnMessageReceived = QueryStringTokenResolver,
                        OnTokenValidated = context => context.EnsureTokenIsNotkBlacklistedAsync(),
                    };
                });
            }
        }

        /* This method is needed to authorize SignalR javascript client.
         * SignalR can not send authorization header. So, we are getting it from query string as an encrypted text. */
        private static Task QueryStringTokenResolver(MessageReceivedContext context)
        {
            if (!context.HttpContext.Request.Path.HasValue ||
                !context.HttpContext.Request.Path.Value.StartsWith("/signalr"))
            {
                // We are just looking for signalr clients
                return Task.CompletedTask;
            }

            var qsAuthToken = context.HttpContext.Request.Query["enc_auth_token"].FirstOrDefault();
            if (qsAuthToken == null)
            {
                // Cookie value does not matches to querystring value
                return Task.CompletedTask;
            }

            // Set auth token from cookie
            context.Token = SimpleStringCipher.Instance.Decrypt(qsAuthToken, AppConsts.DefaultPassPhrase);
            return Task.CompletedTask;
        }
    }
}
