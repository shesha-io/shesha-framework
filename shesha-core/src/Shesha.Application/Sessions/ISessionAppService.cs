using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Application.Services;
using Shesha.Sessions.Dto;

namespace Shesha.Sessions
{
    public interface ISessionAppService : IApplicationService
    {
        Task<GetCurrentLoginInfoOutput> GetCurrentLoginInformations();

        Task<List<string>> GetGrantedShaRoles();
    }
}
