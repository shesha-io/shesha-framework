using Abp.Authorization.Roles;
using Shesha.Authorization.Users;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Authorization.Roles
{
    [Entity(CrudActions = CrudActions.None, IsConfigurable = false)]
    public class Role : AbpRole<User>
    {
        public const int MaxDescriptionLength = 5000;

        public Role()
        {
            Claims = new List<RoleClaim>();
            Permissions = new List<RolePermissionSetting>();
        }

        public Role(int? tenantId, string displayName)
            : base(tenantId, displayName)
        {
        }

        public Role(int? tenantId, string name, string displayName)
            : base(tenantId, name, displayName)
        {
        }

        [MaxLength(MaxDescriptionLength)]
        public virtual string? Description {get; set;}
    }
}
