using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Globalization;
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
            if (settings.AuthPermitLimit <= 0) settings.AuthPermitLimit = defaults.AuthPermitLimit;
            if (settings.AuthWindowSeconds <= 0) settings.AuthWindowSeconds = defaults.AuthWindowSeconds;
            if (settings.OtpPermitLimit <= 0) settings.OtpPermitLimit = defaults.OtpPermitLimit;
            if (settings.OtpWindowSeconds <= 0) settings.OtpWindowSeconds = defaults.OtpWindowSeconds;
            if (settings.RetryAfterSeconds <= 0) settings.RetryAfterSeconds = defaults.RetryAfterSeconds;

            services.AddRateLimiter(options =>
            {
                // Rate limiting is applied only to sensitive endpoints (login/OTP) via the named
                // policies below and their [EnableRateLimiting] attributes. No global limiter is
                // registered so that normal application traffic (e.g. configuration work, form
                // loading) is never throttled. See issue #4771.
                options.AddPolicy<string>(SheshaRateLimitingPolicies.Auth, context =>
                    RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                        factory: _ => new FixedWindowRateLimiterOptions
                        {
                            PermitLimit = settings.AuthPermitLimit,
                            Window = TimeSpan.FromSeconds(settings.AuthWindowSeconds),
                            QueueLimit = 0
                        }));

                options.AddPolicy<string>(SheshaRateLimitingPolicies.Otp, context =>
                    RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                        factory: _ => new FixedWindowRateLimiterOptions
                        {
                            PermitLimit = settings.OtpPermitLimit,
                            Window = TimeSpan.FromSeconds(settings.OtpWindowSeconds),
                            QueueLimit = 0
                        }));

                options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
                options.OnRejected = async (context, cancellationToken) =>
                {
                    var retryAfter = context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var leaseRetryAfter)
                        ? ((int)Math.Ceiling(leaseRetryAfter.TotalSeconds)).ToString(CultureInfo.InvariantCulture)
                        : settings.RetryAfterSeconds.ToString(CultureInfo.InvariantCulture);
                    context.HttpContext.Response.Headers["Retry-After"] = retryAfter;
                    await context.HttpContext.Response.WriteAsync("Too many requests. Please try again later.", cancellationToken);
                };
            });

            return services;
        }
    }
}
