using Abp.Application.Services;
using Shesha.Authorization.Accounts.Dto;
using System.Threading.Tasks;

namespace Shesha.Authorization.Accounts
{
    public interface IAccountAppService : IApplicationService
    {
        Task<IsTenantAvailableOutput> IsTenantAvailableAsync(IsTenantAvailableInput input);

        Task<RegisterOutput> RegisterAsync(RegisterInput input);
    }
}
