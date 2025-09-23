namespace Shesha.ConfigurationItems.Dtos
{
    /// <summary>
    /// Response of the <see cref="ConfigurationItemAppService.GetCurrentAsync"/> endpoint
    /// </summary>
    public class GetCurrentResponse
    {
        /// <summary>
        /// Item configuration
        /// </summary>
        public required object Configuration { get; set; }

        /// <summary>
        /// Cache MD5, is used for client-side caching
        /// </summary>
        public required string CacheMd5 { get; set; }
    }
}