using Shesha.Domain.Enums;
using System;

namespace Shesha.Authorization
{
    [AttributeUsage(AttributeTargets.Property | AttributeTargets.Method | AttributeTargets.Class)]
    public class SheshaAuthorizeAttribute : Attribute
    {

        /// <summary>
        /// A list of permissions to authorize. 
        /// </summary>
        public string[] Permissions { get; }

        /// <summary>
        /// Access type
        /// </summary>
        public RefListPermissionedAccess Access { get; }

        /// <summary>
        /// Allows to configure permissions using the Configurator
        /// </summary>
        public bool IsConfigurable { get; set; }

        public SheshaAuthorizeAttribute(RefListPermissionedAccess access, params string[] permissions)
        {
            Access = access;
            Permissions = permissions;
            IsConfigurable = true;
        }
    }
}
