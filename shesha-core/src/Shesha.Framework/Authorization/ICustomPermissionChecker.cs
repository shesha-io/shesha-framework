using Shesha.AutoMapper.Dto;
using System.Threading.Tasks;

namespace Shesha.Authorization
{
    public interface ICustomPermissionChecker
    {
        Task<bool> IsGrantedAsync(long userId, string permissionName);
        bool IsGranted(long userId, string permissionName);

        Task<bool> IsGrantedAsync(long userId, string permissionName, EntityReferenceDto<string> permissionedEntity);
        bool IsGranted(long userId, string permissionName, EntityReferenceDto<string> permissionedEntity);
    }
}
