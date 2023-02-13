using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Shesha.Configuration;
using Shesha.Services;

namespace Shesha.MongoRepository.Utils
{
    public class MongoUtil
    {
        /// <summary>
        /// Connection string with password
        /// </summary>
        public static string ConnectionString { get => _connectionString ?? GetConnectionString("MongoDBConnection"); set => _connectionString = value; }
        private static string _connectionString;

        /// <summary>
        /// Returns connection string. Note: for the Azure environment - uses standard environment variable
        /// </summary>
        public static string GetConnectionString(string name)
        {
            var env = StaticContext.IocManager.IocContainer.Resolve<IWebHostEnvironment>();
            var configuration = AppConfigurations.Get(env.ContentRootPath, env.EnvironmentName, env.IsDevelopment());
            return configuration.GetConnectionString(name);
        }
    }
}