namespace Shesha.Domain
{
    /// <summary>
    /// Identifier of the <see cref="ReferenceList"/> (Module, Namespace and Name)
    /// </summary>
    public class ReferenceListIdentifier
    {
        public string Module { get; set; }
        public string Name { get; set; }

        public ReferenceListIdentifier()
        {

        }

        public ReferenceListIdentifier(string module, string @namespace, string name)
        {
            Module = module;
            //Namespace = @namespace;
            Name = !string.IsNullOrWhiteSpace(@namespace)
                ? $"{@namespace}.{name}"
                : name;
        }

        public ReferenceListIdentifier(string module, string name)
        {
            Module = module;
            Name = name;
        }
    }
}