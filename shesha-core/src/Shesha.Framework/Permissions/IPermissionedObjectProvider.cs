using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.Permissions
{
    public interface IPermissionedObjectProvider
    {
        List<string> GetObjectTypes();
        string GetObjectType(Type type);
        Task<List<PermissionedObjectDto>> GetAllAsync(string objectType = null, bool skipUnchangedAssembly = false);
    }
}