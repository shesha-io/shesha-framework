using System.Threading.Tasks;
using Abp.Authorization;
using Shesha.AutoMapper.Dto;

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

        //
        // Summary:
        //     Checks if current user is granted for a permission.
        //
        // Parameters:
        //   permissionName:
        //     Name of the permission
        Task<bool> IsGrantedAsync(string permissionName, EntityReferenceDto<string> permissionedEntity);
        Task<bool> IsGrantedAsync(long userId, string permissionName, EntityReferenceDto<string> permissionedEntity);

        bool IsGranted(string permissionName, EntityReferenceDto<string> permissionedEntity);
        bool IsGranted(long userId, string permissionName, EntityReferenceDto<string> permissionedEntity);
    }
}
