namespace Shesha.Metadata.Dtos
{
    /// <summary>
    /// API endpoint DTO
    /// </summary>
    public class ApiEndpointDto
    {
        /// <summary>
        /// Http verb (get/post/put etc)
        /// </summary>
        public required string HttpVerb { get; init; }

        /// <summary>
        /// Url
        /// </summary>
        public required string Url { get; init; }
    }
}
