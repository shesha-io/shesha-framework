using Shesha.Domain.Enums;
using System;

namespace Shesha.Authorization
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
    public class SheshaAuthorizeAttribute: Attribute
    {

        /// <summary>
        /// A list of permissions to authorize. 
        /// </summary>
        public string[] Permissions { get; }

        public bool IsConfigurable { get; set; }

        public RefListPermissionedAccess Access { get; set; }

        public SheshaAuthorizeAttribute(RefListPermissionedAccess access, params string[] permissions)
        {
            Access = access;
            Permissions = permissions;
        }
    }
}
