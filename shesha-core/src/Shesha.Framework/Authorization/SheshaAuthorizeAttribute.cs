using Shesha.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Authorization
{
    [AttributeUsage(AttributeTargets.Property | AttributeTargets.Method | AttributeTargets.Class)]
    public class SheshaAuthorizeAttribute: Attribute
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
