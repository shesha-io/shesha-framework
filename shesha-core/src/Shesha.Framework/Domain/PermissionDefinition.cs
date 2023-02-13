using System;
using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Framework.PermissionDefinition", GenerateApplicationService = GenerateApplicationServiceState.DisableGenerateApplicationService)]
    public class PermissionDefinition : FullAuditedEntity<Guid>
    {
        /// <summary>
        /// Parent of this permission if one exists.
        /// </summary>
        public virtual string Parent { get; set; }

        /// <summary>
        /// Unique name of the permission. This is the key name to grant permissions.
        /// </summary>
        public virtual string Name { get; set; }

        /// <summary>
        /// Display name of the permission. This can be used to show permission to the user.
        /// </summary>
        public virtual string DisplayName { get; set; }

        /// <summary>
        /// A brief description for this permission.
        /// </summary>
        public virtual string Description { get; set; }
    }
}