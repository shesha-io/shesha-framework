using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Threading.RateLimiting;

namespace Shesha.RateLimiting
{
    public static class RateLimitingServiceCollectionExtensions
    {
        public static IServiceCollection AddSheshaRateLimiting(this IServiceCollection services, Action<SheshaRateLimitingOptions>? configure = null)
        {
            var settings = new SheshaRateLimitingOptions();
            configure?.Invoke(settings);

            var defaults = new SheshaRateLimitingOptions();
            if (settings.GlobalPermitLimit <= 0) settings.GlobalPermitLimit = defaults.GlobalPermitLimit;
            if (settings.GlobalWindowSeconds <= 0) settings.GlobalWindowSeconds = defaults.GlobalWindowSeconds;
            if (settings.AuthPermitLimit <= 0) settings.AuthPermitLimit = defaults.AuthPermitLimit;
            if (settings.AuthWindowSeconds <= 0) settings.AuthWindowSeconds = defaults.AuthWindowSeconds;
            if (settings.OtpPermitLimit <= 0) settings.OtpPermitLimit = defaults.OtpPermitLimit;
            if (settings.OtpWindowSeconds <= 0) settings.OtpWindowSeconds = defaults.OtpWindowSeconds;
            if (settings.RetryAfterSeconds <= 0) settings.RetryAfterSeconds = defaults.RetryAfterSeconds;

            services.AddRateLimiter(options =>
            {
                options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
                    RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                        factory: _ => new FixedWindowRateLimiterOptions
                        {
                            PermitLimit = settings.GlobalPermitLimit,
                            Window = TimeSpan.FromSeconds(settings.GlobalWindowSeconds),
                            QueueLimit = 0
                        }));

                options.AddFixedWindowLimiter(SheshaRateLimitingPolicies.Auth, opt =>
                {
                    opt.PermitLimit = settings.AuthPermitLimit;
                    opt.Window = TimeSpan.FromSeconds(settings.AuthWindowSeconds);
                    opt.QueueLimit = 0;
                });

                options.AddFixedWindowLimiter(SheshaRateLimitingPolicies.Otp, opt =>
                {
                    opt.PermitLimit = settings.OtpPermitLimit;
                    opt.Window = TimeSpan.FromSeconds(settings.OtpWindowSeconds);
                    opt.QueueLimit = 0;
                });

                options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
                options.OnRejected = async (context, cancellationToken) =>
                {
                    context.HttpContext.Response.Headers["Retry-After"] = settings.RetryAfterSeconds.ToString();
                    await context.HttpContext.Response.WriteAsync("Too many requests. Please try again later.", cancellationToken);
                };
            });

            return services;
        }
    }
}
