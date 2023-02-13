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
        public string HttpVerb { get; set; }

        /// <summary>
        /// Url
        /// </summary>
        public string Url { get; set; }
    }
}
