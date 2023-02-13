using System.Threading.Tasks;
using Abp.Application.Services;
using Shesha.Authorization.Accounts.Dto;

namespace Shesha.Authorization.Accounts
{
    public interface IAccountAppService : IApplicationService
    {
        Task<IsTenantAvailableOutput> IsTenantAvailable(IsTenantAvailableInput input);

        Task<RegisterOutput> Register(RegisterInput input);
    }
}
