using System;

namespace Shesha.DynamicEntities.Exceptions
{
    public class ModelConfigurationNotFoundException : Exception
    {
        public string? Namespace { get; private set; }
        public string Name { get; private set; }

        public ModelConfigurationNotFoundException(string? @namespace, string name): base($"Model configuration '{@namespace}.{name}' not found")
        {
            Namespace = @namespace;
            Name = name;
        }
    }
}
