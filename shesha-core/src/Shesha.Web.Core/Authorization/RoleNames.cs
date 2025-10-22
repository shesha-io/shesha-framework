using System;

namespace Boxfusion.Authorization
{
    /// <summary>
    /// SheshaWebCore Role Names
    /// </summary>
    [Obsolete("Use Shesha.Authorization.Roles.StaticRoleNames instead to avoid circular dependencies")]
    public static class RoleNames
    {
        /// <summary>
        /// Data Administrator
        /// </summary>
        [Obsolete("Use Shesha.Authorization.Roles.StaticRoleNames.SystemAdministrator instead")]
        public const string SystemAdministrator = "System Administrator";
    }
}
