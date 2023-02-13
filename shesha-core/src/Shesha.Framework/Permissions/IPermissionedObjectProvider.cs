using System;
using System.Collections.Generic;

namespace Shesha.Permissions
{
    public interface IPermissionedObjectProvider
    {
        List<string> GetObjectTypes();
        string GetObjectType(Type type);
        List<PermissionedObjectDto> GetAll(string objectType = null);
    }
}