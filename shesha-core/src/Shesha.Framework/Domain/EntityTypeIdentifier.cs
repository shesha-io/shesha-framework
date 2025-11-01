using Abp.Extensions;
using System;

namespace Shesha.Domain
{
    /// <summary>
    /// Identifier of the <see cref="EntityConfig"/> (Module, Name)
    /// </summary>
    [Serializable]
    public class EntityTypeIdentifier : ConfigurationItemIdentifier<EntityConfig>, IIdentifierFactory<EntityTypeIdentifier>
    {
        public EntityTypeIdentifier(string? module, string name) : base(module, name)
        {
        }

        public static EntityTypeIdentifier New(string? module, string name)
        {
            return new EntityTypeIdentifier(module, name);
        }

        public static string GetTextId(string? module, string name) => module.IsNullOrWhiteSpace() ? name : $"{module}: {name}";
        public static EntityTypeIdentifier GetIdFromTextId(string identifier) 
        {
            var parts = identifier.Split(':');
            if (parts.Length > 2)
                throw new ArgumentException("Input parameter should be in 'module: name' format");

            return parts.Length > 1
                ? New(parts[0].Trim(), parts[1].Trim())
                : New(null, parts[0].Trim());


        }
    }
}