using Abp.Runtime.Caching;
using System;

namespace Shesha.Cache
{
    public class CacheHolder<TKey, TValue> : ICacheHolder<TKey, TValue>, IDisposable
    {
        private readonly string _cacheName;
        private bool _disposed;

        private ITypedCache<TKey, TValue> _cache;

        public ITypedCache<TKey, TValue> Cache
        {
            get
            {
                ThrowIfDisposed();
                return _cache;
            }
        }

        public CacheHolder(string cacheName, ICacheManager cacheManager)
        {
            _cacheName = cacheName;
            _cache = cacheManager.GetCache<TKey, TValue>(_cacheName);
        }

        public virtual void Dispose()
        {
            if (_disposed)
                return;

            _disposed = true;
            _cache.Dispose();
        }

        private void ThrowIfDisposed()
        {
            if (_disposed)
                throw new ObjectDisposedException(GetType().FullName);
        }
    }
}
