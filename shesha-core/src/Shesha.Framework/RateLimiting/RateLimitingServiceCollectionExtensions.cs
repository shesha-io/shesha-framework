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

            services.AddRateLimiter(options =>
            {
                options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
                    RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                        factory: _ => new FixedWindowRateLimiterOptions
                        {
                            PermitLimit = settings.GlobalPermitLimit,
                            Window = settings.GlobalWindow,
                            QueueLimit = 0
                        }));

                options.AddFixedWindowLimiter(SheshaRateLimitingPolicies.Auth, opt =>
                {
                    opt.PermitLimit = settings.AuthPermitLimit;
                    opt.Window = settings.AuthWindow;
                    opt.QueueLimit = 0;
                });

                options.AddFixedWindowLimiter(SheshaRateLimitingPolicies.Otp, opt =>
                {
                    opt.PermitLimit = settings.OtpPermitLimit;
                    opt.Window = settings.OtpWindow;
                    opt.QueueLimit = 0;
                });

                options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
                options.OnRejected = async (context, cancellationToken) =>
                {
                    context.HttpContext.Response.Headers["Retry-After"] = ((int)settings.RetryAfter.TotalSeconds).ToString();
                    await context.HttpContext.Response.WriteAsync("Too many requests. Please try again later.", cancellationToken);
                };
            });

            return services;
        }
    }
}
