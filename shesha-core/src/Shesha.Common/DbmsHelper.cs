using Microsoft.Extensions.Configuration;
using System.Configuration;

namespace Shesha
{
    /// <summary>
    /// Dbms configuration helper
    /// </summary>
    public static class DbmsHelper
    {
        /// <summary>
        /// Get current Dbms type
        /// </summary>
        public static DbmsType GetDbmsType(this IConfiguration config)
        {
            return config.GetValue("DbmsType", DbmsType.SQLServer);
        }

        /// <summary>
        /// Get default connection string
        /// </summary>
        /// <param name="config"></param>
        /// <returns></returns>
        public static string GetDefaultConnectionString(this IConfiguration config)
        {
            return config.GetRequiredConnectionString("Default");
        }

        /// <summary>
        /// Get conneciton string by name. Throw exception if conneciton string is unavailable
        /// </summary>
        /// <param name="configuration"></param>
        /// <param name="name"></param>
        /// <returns></returns>
        /// <exception cref="ConfigurationErrorsException"></exception>
        public static string GetRequiredConnectionString(this IConfiguration configuration, string name)
        {
            var connectionString = configuration.GetConnectionString(name);
            return !string.IsNullOrWhiteSpace(connectionString)
                ? connectionString
                : throw new ConfigurationErrorsException($"Connection string '{name}' is unavailable");
        }
    }
}
