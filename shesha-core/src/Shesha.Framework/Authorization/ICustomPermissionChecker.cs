using System.Threading.Tasks;

namespace Shesha.Authorization
{
    public interface ICustomPermissionChecker
    {
        Task<bool> IsGrantedAsync(long userId, string permissionName);
        bool IsGranted(long userId, string permissionName);        
    }
}
