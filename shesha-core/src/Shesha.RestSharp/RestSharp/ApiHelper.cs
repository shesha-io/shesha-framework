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
    public class ApiHelper<RT, PT>
    {
        public async Task<RT> PostOrPutMethod(Method hTTPMethod, PT postObj, List<HttpHeader> headers, string apiMethod)
        {
            RestClient client = new RestClient(apiMethod);
            RestRequest request = new RestRequest(hTTPMethod); // or Method.POST

            foreach (var header in headers)
            {
                request.AddHeader(header.Name, header.Value);
            }
            request.AddHeader("Cache-Control", "no-cache");
            request.AddHeader("ContentType", "application/json");
            request.RequestFormat = DataFormat.Json;
            request.AddJsonBody(postObj);
            IRestResponse response = await client.ExecuteAsync(request);
            if (response.StatusCode == System.Net.HttpStatusCode.OK)
            {
                return JsonConvert.DeserializeObject<RT>(response.Content);
            }
            return default;
        }

        public async Task<RT> GetApiMethod(string apiMethod, List<HttpHeader> headers)
        {
            RestClient client = new RestClient(apiMethod);
            RestRequest request = new RestRequest(Method.GET);

            foreach (var header in headers)
            {
                request.AddHeader(header.Name, header.Value);
            }
            request.AddHeader("Cache-Control", "no-cache");
            request.AddHeader("ContentType", "application/json");
            IRestResponse response = await client.ExecuteAsync(request);
            if (response.StatusCode == System.Net.HttpStatusCode.OK)
            {
                return JsonConvert.DeserializeObject<RT>(response.Content);
            }
            return default;
        }
    }
}
