using Microsoft.Extensions.Configuration;

namespace Shesha.Configuration
{
    /// <summary>
    /// IConfiguration extensions
    /// </summary>
    public static class ConfigurationExtensions
    {
        public static T GetRequiredValue<T>(this IConfiguration configuration, string key) 
        {
            var value = configuration.GetValue<T>(key);
            return value ?? throw new System.Exception($"Value with key '{key}' is missing in the configuration");
        }

        public static string GetRequired(this IConfiguration configuration, string key) 
        {
            return configuration.GetRequiredValue<string>(key);
        }
    }
}
