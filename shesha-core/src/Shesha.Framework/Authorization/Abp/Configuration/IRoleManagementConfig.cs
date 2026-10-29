using System.Collections.Generic;

namespace Shesha.Authorization.Abp.Configuration
{
    public interface IRoleManagementConfig
    {
        List<StaticRoleDefinition> StaticRoles { get; }
    }
}
