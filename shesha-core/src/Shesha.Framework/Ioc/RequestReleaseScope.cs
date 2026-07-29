using System.Collections.Concurrent;
using System.Threading;

namespace Shesha.Ioc
{
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
    /// </summary>
    public static class RequestReleaseScope
    {
        private static readonly AsyncLocal<ConcurrentQueue<object>> _bucket = new AsyncLocal<ConcurrentQueue<object>>();

        /// <summary>
        /// Starts a new per-request bucket on the current async flow and returns it so the caller
        /// (the request middleware) can drain it when the request ends.
        /// </summary>
        public static ConcurrentQueue<object> Begin()
        {
            var bucket = new ConcurrentQueue<object>();
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
        /// request bucket (e.g. resolves during app startup or on background/scheduler threads), which safely
        /// leaves those on the default tracking behaviour.
        /// </summary>
        public static void Track(object instance)
        {
            _bucket.Value?.Enqueue(instance);
        }
    }
}
