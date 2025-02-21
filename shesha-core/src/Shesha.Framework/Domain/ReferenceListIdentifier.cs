namespace Shesha.Domain
{
    /// <summary>
    /// Identifier of the <see cref="ReferenceList"/> (Module, Namespace and Name)
    /// </summary>
    public class ReferenceListIdentifier : ConfigurationItemIdentifier<ReferenceList>
    {
        public ReferenceListIdentifier(string module, string name) : base(module, name)
        {
        }

        public ReferenceListIdentifier(string module, string @namespace, string name): base(
                module, 
                !string.IsNullOrWhiteSpace(@namespace)
                    ? $"{@namespace}.{name}"
                    : name)
        {
        }
    }
}