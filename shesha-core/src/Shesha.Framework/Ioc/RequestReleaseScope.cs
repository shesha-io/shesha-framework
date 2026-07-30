using System;
using System.Collections.Generic;
using System.Threading;

namespace Shesha.Ioc
{
    /// <summary>
    /// Per-request bucket of component instances tracked by <see cref="RequestScopedReleasePolicy"/>, drained
    /// (released) by <see cref="ReleaseRequestScopeMiddleware"/> at the end of the request.
    ///
    /// All access is guarded by a per-bucket lock so that closing the bucket is atomic with tracking: an
    /// instance is either fully tracked before the request closes (and therefore released) or rejected after
    /// (and left to the container's default tracking). This closes the race where a detached/fire-and-forget
    /// task — which inherited this bucket via <see cref="ExecutionContext"/> — enqueues an instance in the
    /// window between the drain-guard check and the enqueue. The lock is per request (one bucket per request),
    /// so it only ever serialises a request against its own detached children, never across requests.
    /// </summary>
    public sealed class RequestReleaseBucket
    {
        private readonly object _gate = new object();
        private readonly Queue<object> _items = new Queue<object>();
        private bool _drained;

        /// <summary>
        /// Records an instance for release, atomically with respect to <see cref="Close"/>. Returns
        /// <c>false</c> (and tracks nothing) if the bucket has already been closed by the request — the caller
        /// then leaves the instance on the container's default tracking.
        /// </summary>
        public bool TryTrack(object instance)
        {
            lock (_gate)
            {
                if (_drained)
                {
                    return false;
                }

                _items.Enqueue(instance);
                return true;
            }
        }

        /// <summary>
        /// Atomically closes the bucket (rejecting any further <see cref="TryTrack"/> calls) and returns its
        /// contents. Callers must <c>Release</c> the returned instances OUTSIDE any lock (disposal/decommission
        /// can be slow or re-entrant).
        /// </summary>
        public object[] Close()
        {
            lock (_gate)
            {
                _drained = true;
                if (_items.Count == 0)
                {
                    return Array.Empty<object>();
                }

                var items = _items.ToArray();
                _items.Clear();
                return items;
            }
        }
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
    /// Fire-and-forget note: a detached task started during the request inherits this AsyncLocal (and thus the
    /// bucket reference). Tracking is closed atomically at request end (see <see cref="RequestReleaseBucket"/>),
    /// so such work cannot enqueue into an abandoned bucket. Detached work must still not USE request-scoped
    /// resolutions after the request completes — the same rule as ASP.NET Core request-scoped services; it
    /// should open its own IoC scope (or capture the values it needs) instead.
    /// </summary>
    public static class RequestReleaseScope
    {
        private static readonly AsyncLocal<RequestReleaseBucket?> _bucket = new AsyncLocal<RequestReleaseBucket?>();

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
        /// bucket has already been closed (e.g. a detached task that outlived its request), which safely leaves
        /// those on the default tracking behaviour.
        /// </summary>
        public static void Track(object instance)
        {
            _bucket.Value?.TryTrack(instance);
        }
    }
}
