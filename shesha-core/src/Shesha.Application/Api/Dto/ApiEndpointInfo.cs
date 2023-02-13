using System.Collections.Generic;

namespace Shesha.Api.Dto
{
    /// <summary>
    /// API endpoint info
    /// </summary>
    public class ApiEndpointInfo
    {
        //public List<string> HttpVerbs { get; set; } = new List<string>();
        public string HttpVerb { get; set; }
        public string Url { get; set; }
        public string Description { get; set; }


        public string ActionName { get; set; }
        public string ControllerName { get; set; }
    }
}