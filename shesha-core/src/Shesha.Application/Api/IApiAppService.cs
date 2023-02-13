using Shesha.Api.Dto;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.Api
{
    /// <summary>
    /// API application service
    /// </summary>
    public interface IApiAppService
    {
        /// <summary>
        /// Get list of API endpoints
        /// </summary>
        /// <returns></returns>
        Task<List<ApiEndpointInfo>> GetEndpointsAsync();
    }
}
