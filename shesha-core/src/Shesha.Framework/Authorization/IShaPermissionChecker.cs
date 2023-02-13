using System.Threading.Tasks;
using Abp.Authorization;

namespace Shesha.Authorization
{
    /// <summary>
    /// Shesha permission checker
    /// </summary>
    public interface IShaPermissionChecker: IPermissionChecker
    {
        /// <summary>
        /// Clears permissions cache for the specified user
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <param name="tenantId">Tenant Id</param>
        /// <returns></returns>
        Task ClearPermissionsCacheForUserAsync(long userId, int? tenantId);

        /// <summary>
        /// Clears permissions cache
        /// </summary>
        Task ClearPermissionsCacheAsync();
    }
}
