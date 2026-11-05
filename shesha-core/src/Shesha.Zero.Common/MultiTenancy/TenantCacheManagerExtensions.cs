using Abp.Runtime.Caching;
using System.Diagnostics.CodeAnalysis;

namespace Abp.MultiTenancy
{
    public static class TenantCacheManagerExtensions
    {
        [SuppressMessage("IDisposableAnalyzers.Correctness",
                 "IDISP004:Don't ignore created IDisposable",
                 Justification = "Returned instance is owned by the DI container / factory.")]
        public static ITypedCache<int, TenantCacheItem?> GetTenantCache(this ICacheManager cacheManager)
        {
            return cacheManager.GetCache<int, TenantCacheItem?>(TenantCacheItem.CacheName);
        }

        [SuppressMessage("IDisposableAnalyzers.Correctness",
                 "IDISP004:Don't ignore created IDisposable",
                 Justification = "Returned instance is owned by the DI container / factory.")]
        public static ITypedCache<string, int?> GetTenantByNameCache(this ICacheManager cacheManager)
        {
            return cacheManager.GetCache<string, int?>(TenantCacheItem.ByNameCacheName);
        }
    }
}