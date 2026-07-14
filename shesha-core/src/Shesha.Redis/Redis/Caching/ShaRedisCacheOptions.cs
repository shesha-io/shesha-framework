using Abp.Configuration.Startup;

namespace Shesha.Redis.Caching
{
    public class ShaRedisCacheOptions
    {
        public IAbpStartupConfiguration AbpStartupConfiguration { get; } = default!;

        public string ConnectionString { get; set; } = default!;

        public int DatabaseId { get; set; }

        public string OnlineClientsStoreKey = "Abp.RealTime.OnlineClients";

        public string KeyPrefix { get; set; } = default!;

        public bool TenantKeyEnabled { get; set; }

        /// <summary>
        /// Required for serialization
        /// </summary>
        public ShaRedisCacheOptions()
        {
            
        }
        
        public ShaRedisCacheOptions(IAbpStartupConfiguration abpStartupConfiguration)
        {
            AbpStartupConfiguration = abpStartupConfiguration;

            ConnectionString = "";
            DatabaseId = 0;
            KeyPrefix = "";
            TenantKeyEnabled = false;
        }
    }
}