using Shesha.Domain.Enums;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.Authorization
{
    public interface IObjectPermissionChecker
    {
        Task AuthorizeAsync(
            bool requireAll, 
            string permissionedObject, 
            string method, 
            string objectType, 
            bool IsAuthenticated, 
            RefListPermissionedAccess? replaceInherited = null,
            List<string> defaultPermissions = null);
    }
}
