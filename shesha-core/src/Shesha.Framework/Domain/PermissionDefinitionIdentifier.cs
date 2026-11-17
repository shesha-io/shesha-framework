using System;

namespace Shesha.Domain
{
#nullable enable
    /// <summary>
    /// Identifier of the <see cref="PermissionDefinition"/> (Module and Name)
    /// </summary>
    [Serializable]
    public class PermissionDefinitionIdentifier : ConfigurationItemIdentifier<PermissionDefinition>, IIdentifierFactory<PermissionDefinitionIdentifier>
    {
        public PermissionDefinitionIdentifier(string? module, string name) : base(module, name)
        {
        }

        public static PermissionDefinitionIdentifier New(string? module, string name)
        {
            return new PermissionDefinitionIdentifier(module, name);
        }
    }
#nullable restore
}
