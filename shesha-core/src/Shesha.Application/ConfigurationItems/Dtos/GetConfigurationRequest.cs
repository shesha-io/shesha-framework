using Shesha.Domain;
using System;

namespace Shesha.ConfigurationItems.Dtos
{
    /// <summary>
    /// Request of the <see cref="ConfigurationItemAppService.GetAsync"/> endpoint
    /// </summary>
    public class GetConfigurationRequest
    {
        /// <summary>
        /// Type of the <see cref="ConfigurationItem"/>
        /// </summary>
        public required string ItemType { get; set; }

        /// <summary>
        /// Id of the configuration
        /// </summary>
        public required Guid Id { get; set; }

        /// <summary>
        /// MD5 of the item. Is used for the client side caching.
        /// If specified, the application should compare the value received from the client with a local cache and return http response with code 304 (not changed)
        /// </summary>
        public string? Md5 { get; set; }
    }
}
