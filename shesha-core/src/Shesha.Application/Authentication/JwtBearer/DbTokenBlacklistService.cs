using Abp.Dependency;
using NHibernate;
using System;
using System.Linq.Dynamic.Core.Tokenizer;
using System.Threading.Tasks;

namespace Shesha.Authentication.JwtBearer
{
    /// <summary>
    /// JWT tokens blacklist service with database storage
    /// </summary>
    public class DbTokenBlacklistService : ITokenBlacklistService, ITransientDependency
    {
        private readonly ITokenBlacklistCacheHolder _cacheHolder;
        private readonly ISessionFactory _sessionFactory;

        public DbTokenBlacklistService(ITokenBlacklistCacheHolder cacheHolder, ISessionFactory sessionFactory)
        {
            _cacheHolder = cacheHolder;
            _sessionFactory = sessionFactory;
        }

        public async Task BlacklistTokenAsync(string tokenId, DateTime? expirationDate)
        {
            await BlacklistTokenInCacheAsync(tokenId, true);
            await BlacklistTokenInDbAsync(tokenId, expirationDate);
        }

        public async Task CleanupExpiredTokensAsync()
        {
            using (var session = _sessionFactory.OpenSession())
            {
                var query = session.CreateSQLQuery("delete from frwk.blacklist_tokens where expires_on < :date");
                query.SetDateTime("date", DateTime.UtcNow.AddDays(-1));
                await query.ExecuteUpdateAsync();
            }
        }

        public async Task<bool> IsTokenBlacklistedAsync(string tokenId)
        {
            var cacheItem = await _cacheHolder.Cache.TryGetValueAsync(tokenId);
            if (cacheItem.HasValue)
                return cacheItem.Value;

            var isBlacklisted = await IsTokenBlacklistedInDbAsync(tokenId);
            await BlacklistTokenInCacheAsync(tokenId, isBlacklisted);

            return isBlacklisted;
        }

        private async Task BlacklistTokenInCacheAsync(string tokenId, bool isBlacklisted) 
        {
            await _cacheHolder.Cache.SetAsync(tokenId, isBlacklisted, TimeSpan.FromMinutes(30));
        }

        private async Task BlacklistTokenInDbAsync(string tokenId, DateTime? expirationDate)
        {
            using (var session = _sessionFactory.OpenSession()) 
            {
                var query = session.CreateSQLQuery("insert into frwk.blacklist_tokens (token, blacklisted_on, expires_on) values (:token, :blacklisted_on, :expires_on)");
                query.SetString("token", tokenId);
                query.SetDateTime("blacklisted_on", DateTime.UtcNow);
                if (expirationDate.HasValue)
                    query.SetDateTime("expires_on", expirationDate.Value);
                await query.ExecuteUpdateAsync();
            }
        }

        private async Task<bool> IsTokenBlacklistedInDbAsync(string tokenId)
        {
            using (var session = _sessionFactory.OpenSession()) 
            {
                var query = session.CreateSQLQuery("select 1 from frwk.blacklist_tokens where token = :token");
                query.SetString("token", tokenId);
                var result = await query.UniqueResultAsync();
                return result != null;
            }
        }
    }
}
