using Castle.MicroKernel;
using Castle.MicroKernel.Releasers;

namespace Shesha.Ioc
{
    /// <summary>
    /// Castle Windsor release policy that behaves exactly like the default
    /// <see cref="LifecycledComponentsReleasePolicy"/> (so normal tracking, decommission and disposal are all
    /// preserved) but ALSO records every tracked instance in the current request's <see cref="RequestReleaseScope"/>
    /// bucket. The request middleware then releases that bucket when the request completes, which keeps the
    /// policy's internal <c>instance2Burden</c> dictionary bounded to the in-flight working set instead of
    /// growing without limit.
    ///
    /// This is the broad fix for the root-container resolve leak: it catches EVERY component resolved during a
    /// request (ABP interceptors, <c>IIocResolver</c>, and any <c>ResolveAll</c> sites) without editing ABP and
    /// without a blanket non-tracking policy.
    /// </summary>
    public class RequestScopedReleasePolicy : LifecycledComponentsReleasePolicy
    {
        public RequestScopedReleasePolicy(IKernel kernel)
            : base(kernel)
        {
        }

        public override void Track(object instance, Burden burden)
        {
            // Preserve the default behaviour (needed so Release() later runs decommission/disposal correctly).
            base.Track(instance, burden);

            // Remember it for release at the end of the current request (no-op outside a request).
            RequestReleaseScope.Track(instance);
        }
    }
}
