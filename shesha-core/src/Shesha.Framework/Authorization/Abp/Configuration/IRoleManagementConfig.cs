using System.Collections.Generic;

namespace Shesha.Authorization.Configuration
{
    public interface IRoleManagementConfig
    {
        List<StaticRoleDefinition> StaticRoles { get; }
    }
}
