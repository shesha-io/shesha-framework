using System;

namespace Shesha.Domain
{
    /// <summary>
    /// Role identifier (stores module+name reference to a ShaRole configuration item)
    /// </summary>
    [Serializable]
    public class RoleIdentifier : ConfigurationItemIdentifier<ConfigurationItem>, IIdentifierFactory<RoleIdentifier>
    {
        public RoleIdentifier(string? module, string name) : base(module, name)
        {
        }

        // ShaRole is defined in Shesha.Core, which Shesha.Framework cannot reference.
        // ConfigurationItem (the common base) is used as the generic parameter instead,
        // and ItemTypeName is overridden explicitly so equality checks via NormalizedFullName remain correct.
        public override string ItemTypeName => "ShaRole";

        public static RoleIdentifier New(string? module, string name)
        {
            return new RoleIdentifier(module, name);
        }
    }
}
