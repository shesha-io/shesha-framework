using Shesha.Domain;

namespace Shesha.ConfigurationItems.Dtos
{
    /// <summary>
    /// Request of the <see cref="ConfigurationItemAppService.GetCurrentAsync"/> endpoint
    /// </summary>
    public class GetCurrentRequest
    {
        /// <summary>
        /// Type of the <see cref="ConfigurationItem"/>
        /// </summary>
        public required string ItemType { get; set; }

        /// <summary>
        /// Module name
        /// </summary>
        public required string Module { get; set; }

        /// <summary>
        /// Form name
        /// </summary>
        public required string Name { get; set; }

        /// <summary>
        /// MD5 of the item. Is used for the client side caching.
        /// If specified, the application should compare the value received from the client with a local cache and return http response with code 304 (not changed)
        /// </summary>
        public string? Md5 { get; set; }

        /// <summary>
        /// If true, indicates that the module hierarchy should be skipped
        /// </summary>
        public bool SkipHierarchy { get; set; }
    }
}
