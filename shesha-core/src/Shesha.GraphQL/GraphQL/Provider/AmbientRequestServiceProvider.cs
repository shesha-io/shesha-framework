using Abp.Dependency;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using System;

namespace Shesha.GraphQL.Provider
{
    /// <summary>
    /// An <see cref="IServiceProvider"/> that forwards every resolution to the CURRENT request's
    /// service provider, falling back to the IoC container directly when there is no HttpContext.
    ///
    /// <para>
    /// Why this exists: <see cref="SchemaContainer"/> is a singleton that caches GraphQL schemas, and
    /// those schemas hand their <see cref="IServiceProvider"/> to <c>EntitySchema</c> /
    /// <c>EntityQuery</c>, whose field resolvers close over it. If that provider were a request-scoped
    /// <c>ScopedWindsorServiceProvider</c>, every component resolved through it would be appended to
    /// that (long-dead) request's <c>MsLifetimeScope._resolvedInstances</c> and never released — an
    /// unbounded leak. Holding this ambient forwarder instead means resolutions land in whichever
    /// request scope is live at call time, so they are released when that request ends.
    /// </para>
    ///
    /// <para>
    /// The no-HttpContext fallback deliberately uses <see cref="IIocResolver"/> rather than any
    /// captured <see cref="IServiceProvider"/>: resolving straight from the container bypasses the
    /// Castle&lt;-&gt;MS DI scope machinery altogether, so a background/job-initiated query can never
    /// resolve through a stale or already-disposed request scope. Note those resolutions are not
    /// released (the instance escapes to the caller), so they do create container burdens — the same
    /// trade-off every other <c>IIocResolver.Resolve</c> call site in the framework makes, and far
    /// cheaper than pinning a dead request scope.
    /// </para>
    ///
    /// <para>
    /// Deliberately NOT registered in the IoC container. Registering a type that implements
    /// <see cref="IServiceProvider"/> risks Castle's <c>DefaultInterfaces()</c> convention matching
    /// <see cref="IServiceProvider"/> itself and hijacking every provider resolution in the app.
    /// <see cref="SchemaContainer"/> constructs it directly instead.
    /// </para>
    /// </summary>
    public class AmbientRequestServiceProvider : IServiceProvider, ISupportRequiredService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IIocResolver _iocResolver;

        public AmbientRequestServiceProvider(IHttpContextAccessor httpContextAccessor, IIocResolver iocResolver)
        {
            _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
            _iocResolver = iocResolver ?? throw new ArgumentNullException(nameof(iocResolver));
        }

        /// <summary>
        /// The live request's provider, or null when running outside a request.
        /// </summary>
        private IServiceProvider? RequestServices => _httpContextAccessor.HttpContext?.RequestServices;

        public object? GetService(Type serviceType)
        {
            var requestServices = RequestServices;
            if (requestServices != null)
                return requestServices.GetService(serviceType);

            return _iocResolver.IsRegistered(serviceType)
                ? _iocResolver.Resolve(serviceType)
                : null;
        }

        public object GetRequiredService(Type serviceType)
        {
            var requestServices = RequestServices;
            if (requestServices == null)
                return _iocResolver.Resolve(serviceType);

            // Forward to the underlying implementation when it supports it, so Windsor's own
            // resolution semantics and error messages are preserved.
            return requestServices is ISupportRequiredService supportsRequired
                ? supportsRequired.GetRequiredService(serviceType)
                : requestServices.GetService(serviceType)
                    ?? throw new InvalidOperationException($"No service for type '{serviceType}' has been registered.");
        }
    }
}
