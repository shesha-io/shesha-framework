using Abp.Application.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.Sessions
{
    public interface ISessionAppService : IApplicationService
    {
        Task<List<string>> GetGrantedShaRolesAsync();
    }
}
