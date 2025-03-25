using Newtonsoft.Json;
using System;

namespace Shesha.Domain
{
    /// <summary>
    /// Identifier of the <see cref="ReferenceList"/> (Module, Namespace and Name)
    /// </summary>
    [Serializable]
    public class ReferenceListIdentifier : ConfigurationItemIdentifier<ReferenceList>, IIdentifierFactory<ReferenceListIdentifier>
    {
        [JsonConstructor]
        public ReferenceListIdentifier(string? module, string name) : base(module, name)
        {
        }

        public ReferenceListIdentifier(string? module, string? @namespace, string name): base(
                module, 
                !string.IsNullOrWhiteSpace(@namespace)
                    ? $"{@namespace}.{name}"
                    : name)
        {
        }

        public static ReferenceListIdentifier New(string? module, string name)
        {
            return new ReferenceListIdentifier(module, name);
        }
    }
}