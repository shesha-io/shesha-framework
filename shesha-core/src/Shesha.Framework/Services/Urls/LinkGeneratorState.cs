using Microsoft.AspNetCore.Http;

namespace Shesha.Services.Urls
{
    public class LinkGeneratorState
    {
        public string? Scheme { get; set; }
        public string? Host { get; set; }
        public int Port { get; set; }
        public string? PathBase { get; set; }

        public LinkGeneratorState(HttpRequest request)
        {
            Scheme = request?.Scheme;
            Host = request?.Host.Host;
            Port = request?.Host.Port ?? default;
            PathBase = request?.PathBase;
        }

        public LinkGeneratorState() 
        { 

        }
    }
}
