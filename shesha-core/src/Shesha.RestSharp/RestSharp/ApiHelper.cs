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
    public class ApiHelper<RT, PT> where PT: class
    {
        public async Task<RT> PostOrPutMethod(Method httpMethod, PT postObj, List<HttpHeader> headers, string apiMethod)
        {
            var client = new RestClient(apiMethod);
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
            if (response.StatusCode == System.Net.HttpStatusCode.OK)
            {
                return JsonConvert.DeserializeObject<RT>(response.Content);
            }
            return default;
        }

        public async Task<RT> GetApiMethod(string apiMethod, List<HttpHeader> headers)
        {
            var client = new RestClient(apiMethod);
            var request = new RestRequest() { Method = Method.Get };

            foreach (var header in headers)
            {
                request.AddHeader(header.Name, header.Value);
            }
            request.AddHeader("Cache-Control", "no-cache");
            request.AddHeader("ContentType", "application/json");
            var response = await client.ExecuteAsync(request);
            if (response.StatusCode == System.Net.HttpStatusCode.OK)
            {
                return JsonConvert.DeserializeObject<RT>(response.Content);
            }
            return default;
        }
    }
}
