using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Configuration;

namespace Shesha.Configuration
{
    /// <summary>
    /// IConfiguration extensions
    /// </summary>
    public static class ConfigurationExtensions
    {
        /// <summary>
        /// Get required configuration parameter. Throw exception if parameter is unavailable
        /// </summary>
        /// <exception cref="Exception"></exception>
        public static T GetRequiredValue<T>(this IConfiguration configuration, string key) 
        {
            var value = configuration.GetValue<T>(key);
            return value ?? throw new ConfigurationErrorsException($"Value with key '{key}' is missing in the configuration");
        }

        /// <summary>
        /// Get required configuration parameter. Throw exception if parameter is unavailable
        /// </summary>
        /// <exception cref="Exception"></exception>
        public static string GetRequired(this IConfiguration configuration, string key) 
        {
            return configuration.GetRequiredValue<string>(key);
        }        
    }
}
