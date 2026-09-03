using System;

namespace Shesha.Domain
{
    /// <summary>
    /// Role identifier
    /// </summary>
    [Serializable]
    public class ShaRoleIdentifier : ConfigurationItemIdentifier<ShaRole>, IIdentifierFactory<ShaRoleIdentifier>
    {
        public ShaRoleIdentifier(string? module, string name) : base(module, name)
        {
        }

        public static ShaRoleIdentifier New(string? module, string name)
        {
            return new ShaRoleIdentifier(module, name);
        }
    }
}