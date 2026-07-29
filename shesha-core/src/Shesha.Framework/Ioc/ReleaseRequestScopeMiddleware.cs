using Abp.Dependency;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace Shesha.Ioc
{
    /// <summary>
    /// Opens a <see cref="RequestReleaseScope"/> bucket for the duration of each HTTP request and, when the
    /// request completes, releases every component that <see cref="RequestScopedReleasePolicy"/> tracked during
    /// it. This is what bounds Castle Windsor's release-policy dictionary (fixing both the memory leak and the
    /// lock-contention slowdown) while keeping normal disposal semantics.
    ///
    /// Register as early as possible in the pipeline (see <c>UseSheshaRequestScopeRelease</c>) so its release
    /// runs after everything else in the request — including MVC authorization filters and ABP interceptors.
    /// </summary>
    public class ReleaseRequestScopeMiddleware : IMiddleware, ISingletonDependency
    {
        private readonly IIocManager _iocManager;

        public ReleaseRequestScopeMiddleware(IIocManager iocManager)
        {
            _iocManager = iocManager;
        }

        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            var bucket = RequestReleaseScope.Begin();
            try
            {
                await next(context);
            }
            finally
            {
                RequestReleaseScope.Clear();

                // Stop any detached/background work that inherited this bucket from enqueuing further
                // instances into it once we start releasing (the flag lives on the shared bucket object, so it
                // is visible across inherited ExecutionContexts — unlike the AsyncLocal reference cleared above).
                bucket.Drained = true;

                var container = _iocManager.IocContainer;
                while (bucket.Items.TryDequeue(out var instance))
                {
                    // Release removes the burden from the policy dictionary and runs decommission/disposal.
                    // It is idempotent (releasing an already-released or singleton instance is a safe no-op),
                    // so double-release with the ASP.NET request scope / unit of work is harmless.
                    try
                    {
                        container.Release(instance);
                    }
                    catch
                    {
                        // Best-effort cleanup: never let a release failure break the response.
                    }
                }
            }
        }
    }
}
