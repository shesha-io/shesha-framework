using Abp.Application.Services;
using Shesha.Sessions.Dto;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.Sessions
{
    public interface ISessionAppService : IApplicationService
    {
        Task<GetCurrentLoginInfoOutput> GetCurrentLoginInformationsAsync();

        Task<List<string>> GetGrantedShaRolesAsync();
    }
}
