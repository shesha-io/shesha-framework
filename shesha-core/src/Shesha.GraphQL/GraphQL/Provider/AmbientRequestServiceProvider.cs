using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using System;

namespace Shesha.GraphQL.Provider
{
    /// <summary>
    /// An <see cref="IServiceProvider"/> that forwards every resolution to the CURRENT request's
    /// service provider, falling back to a supplied provider when there is no HttpContext.
    ///
    /// <para>
    /// Why this exists: <see cref="SchemaContainer"/> is a singleton that caches GraphQL schemas, and
    /// those schemas hand their <see cref="IServiceProvider"/> to <c>EntitySchema</c> /
    /// <c>EntityQuery</c>, whose field resolvers close over it. If that provider is a request-scoped
    /// <c>ScopedWindsorServiceProvider</c>, every component resolved through it is appended to that
    /// (long-dead) request's <c>MsLifetimeScope._resolvedInstances</c> and never released — an
    /// unbounded leak. Holding this ambient forwarder instead means resolutions land in whichever
    /// request scope is live at call time, so they are released when that request ends.
    /// </para>
    ///
    /// <para>
    /// Deliberately NOT registered in the IoC container. Registering a type that implements
    /// <see cref="IServiceProvider"/> risks Castle's <c>DefaultInterfaces()</c> convention matching
    /// <see cref="IServiceProvider"/> itself and hijacking every provider resolution in the app.
    /// <see cref="SchemaContainer"/> constructs it directly instead.
    /// </para>
    ///
    /// See docs/incidents/2026-09-15-graphql-schema-scope-capture-leak.md.
    /// </summary>
    public class AmbientRequestServiceProvider : IServiceProvider, ISupportRequiredService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IServiceProvider _fallback;

        public AmbientRequestServiceProvider(IHttpContextAccessor httpContextAccessor, IServiceProvider fallback)
        {
            _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
            _fallback = fallback ?? throw new ArgumentNullException(nameof(fallback));
        }

        /// <summary>
        /// The provider to resolve from right now: the live request's, else the fallback.
        /// </summary>
        private IServiceProvider Current => _httpContextAccessor.HttpContext?.RequestServices ?? _fallback;

        public object? GetService(Type serviceType) => Current.GetService(serviceType);

        public object GetRequiredService(Type serviceType)
        {
            var current = Current;

            // Forward to the underlying implementation when it supports it, so Windsor's own
            // resolution semantics and error messages are preserved.
            return current is ISupportRequiredService supportsRequired
                ? supportsRequired.GetRequiredService(serviceType)
                : current.GetService(serviceType)
                    ?? throw new InvalidOperationException($"No service for type '{serviceType}' has been registered.");
        }
    }
}
