namespace Shesha.Api.Dto
{
    /// <summary>
    /// API endpoint info
    /// </summary>
    public class ApiEndpointInfo
    {
        public required string HttpVerb { get; set; }
        public required string Url { get; set; }
        public string? Description { get; set; }
        public required string ActionName { get; set; }
        public required string ControllerName { get; set; }
    }
}