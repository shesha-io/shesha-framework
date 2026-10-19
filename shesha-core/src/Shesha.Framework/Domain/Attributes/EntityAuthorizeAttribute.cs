using Shesha.Domain.Enums;
using Shesha.Domain.Interfaces;
using System;

namespace Shesha.Domain.Attributes
{
    [AttributeUsage(AttributeTargets.Class, Inherited = true, AllowMultiple = true)]
    public class EntityAuthorizeAttribute: Attribute, ICrudActionConfig
    {
        /// <summary>
        /// CRUD action
        /// </summary>
        public CrudAction Action { get; init; }
        
        /// <summary>
        /// Actions access 
        /// </summary>
        public CrudActionsAccess CrudActionsAccess { get; init; }

        /// <summary>
        /// Permissions required to access action
        /// </summary>
        public string[] CrudActionsPermissions { get; set; } = [];

        /// <summary>
        /// Anonymous or any authenticated access
        /// </summary>
        public EntityAuthorizeAttribute(CrudAction action, CrudActionsAccess crudActionsAccess)
        {
            Action = action;
            CrudActionsAccess = crudActionsAccess;
        }

        /// <summary>
        /// CRUD action requires permissions
        /// </summary>
        public EntityAuthorizeAttribute(CrudAction action, string[] permissions)
        {
            Action = action;
            CrudActionsAccess = CrudActionsAccess.RequiresPermissions;
            CrudActionsPermissions = permissions;
        }
    }
}
