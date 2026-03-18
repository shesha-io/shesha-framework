using Abp.Runtime.Caching;
using Abp.Runtime.Caching.Memory;
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

        /// <summary>
        /// Created cache based on the current cache manager
        /// </summary>
        /// <param name="cacheName"></param>
        /// <param name="cacheManager"></param>
        public CacheHolder(string cacheName, ICacheManager cacheManager)
        {
            _cacheName = cacheName;
            _cache = cacheManager.GetCache<TKey, TValue>(_cacheName);
        }

        /// <summary>
        /// Created in-memory cache irrespectively of the current cache manager
        /// </summary>
        /// <param name="cacheName"></param>
        /// <param name="cacheManager"></param>
        public CacheHolder(string cacheName, AbpMemoryCacheManager cacheManager) 
        {
            _cacheName = cacheName;
            _cache = cacheManager.GetCache<TKey, TValue>(cacheName);
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
