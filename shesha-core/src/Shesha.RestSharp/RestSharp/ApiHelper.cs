using Newtonsoft.Json;
using RestSharp;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.RestSharp
{
    /// <summary>
    /// Generic Api Helper built using RestSharp
    /// </summary>
    /// <typeparam name="RT"></typeparam>
    /// <typeparam name="PT"></typeparam>
    public class ApiHelper<RT, PT> where PT : class
    {
        public async Task<RT?> PostOrPutMethodAsync(Method httpMethod, PT postObj, List<HttpHeader> headers, string apiMethod)
        {
            using var client = new RestClient(apiMethod);
            var request = new RestRequest() { Method = httpMethod };

            foreach (var header in headers)
            {
                request.AddHeader(header.Name, header.Value);
            }
            request.AddHeader("Cache-Control", "no-cache");
            request.AddHeader("ContentType", "application/json");
            request.RequestFormat = DataFormat.Json;
            request.AddJsonBody(postObj);
            var response = await client.ExecuteAsync(request);
            if (response.StatusCode == System.Net.HttpStatusCode.OK && !string.IsNullOrWhiteSpace(response.Content))
            {
                return JsonConvert.DeserializeObject<RT>(response.Content);
            }
            return default;
        }

        public async Task<RT?> GetApiMethodAsync(string apiMethod, List<HttpHeader> headers)
        {
            using var client = new RestClient(apiMethod);
            var request = new RestRequest() { Method = Method.Get };

            foreach (var header in headers)
            {
                request.AddHeader(header.Name, header.Value);
            }
            request.AddHeader("Cache-Control", "no-cache");
            request.AddHeader("ContentType", "application/json");
            var response = await client.ExecuteAsync(request);
            if (response.StatusCode == System.Net.HttpStatusCode.OK && !string.IsNullOrWhiteSpace(response.Content))
            {
                return JsonConvert.DeserializeObject<RT>(response.Content);
            }
            return default;
        }
    }
}
