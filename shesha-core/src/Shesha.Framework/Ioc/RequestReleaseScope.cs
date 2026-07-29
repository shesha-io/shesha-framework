using System.Collections.Concurrent;
using System.Threading;

namespace Shesha.Ioc
{
    /// <summary>
    /// Per-request bucket of component instances tracked by <see cref="RequestScopedReleasePolicy"/>, drained
    /// (released) by <see cref="ReleaseRequestScopeMiddleware"/> at the end of the request. Exposed as a class
    /// (rather than a bare queue) so its <see cref="Drained"/> flag lives on the shared instance: fire-and-forget
    /// work that inherits the request's <see cref="ExecutionContext"/> sees the same object and therefore stops
    /// enqueuing once the request has drained (see <see cref="RequestReleaseScope"/>).
    /// </summary>
    public sealed class RequestReleaseBucket
    {
        internal readonly ConcurrentQueue<object> Items = new ConcurrentQueue<object>();

        /// <summary>
        /// Set once the request has finished and its instances have been (are being) released. After this is set,
        /// no further instances are accepted — this is the guard that stops detached/background work (which
        /// inherited this bucket via ExecutionContext) from mutating it after the request is gone.
        /// </summary>
        public volatile bool Drained;
    }

    /// <summary>
    /// Holds, per logical request (async flow), the set of component instances that were tracked by
    /// <see cref="RequestScopedReleasePolicy"/> so they can be released at the end of the request.
    ///
    /// Background: components resolved via the root container (ABP <c>IIocResolver</c>/<c>IIocManager</c> and
    /// ABP's own authorization / unit-of-work / session interceptors) are tracked by Castle Windsor's release
    /// policy and are never <c>Release()</c>d — they accumulate in the policy's internal dictionary forever.
    /// That is both a memory leak and (because the dictionary is lock-guarded and grows unbounded) a
    /// performance problem. Draining this per-request bucket at request end keeps the dictionary bounded to the
    /// in-flight working set while preserving normal disposal semantics (unlike a global NoTrackingReleasePolicy).
    ///
    /// Fire-and-forget safety: a detached task started during the request inherits this AsyncLocal (and thus the
    /// bucket reference). <see cref="Track"/> only enqueues while the bucket is live and not yet drained, so once
    /// the request ends such work no longer accumulates into an abandoned bucket — those resolves simply fall
    /// back to the container's default tracking (same as any resolve with no active request), rather than being
    /// silently lost.
    /// </summary>
    public static class RequestReleaseScope
    {
        private static readonly AsyncLocal<RequestReleaseBucket> _bucket = new AsyncLocal<RequestReleaseBucket>();

        /// <summary>
        /// Starts a new per-request bucket on the current async flow and returns it so the caller
        /// (the request middleware) can drain it when the request ends.
        /// </summary>
        public static RequestReleaseBucket Begin()
        {
            var bucket = new RequestReleaseBucket();
            _bucket.Value = bucket;
            return bucket;
        }

        /// <summary>
        /// Clears the current async flow's bucket reference (called once the request has been drained).
        /// </summary>
        public static void Clear()
        {
            _bucket.Value = null;
        }

        /// <summary>
        /// Records an instance for release at the end of the current request. No-op when there is no active
        /// request bucket (e.g. resolves during app startup or on background/scheduler threads) or when the
        /// bucket has already been drained (e.g. a detached task that outlived its request), which safely leaves
        /// those on the default tracking behaviour.
        /// </summary>
        public static void Track(object instance)
        {
            var bucket = _bucket.Value;
            if (bucket != null && !bucket.Drained)
            {
                bucket.Items.Enqueue(instance);
            }
        }
    }
}
