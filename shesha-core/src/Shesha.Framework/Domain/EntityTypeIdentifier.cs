using Abp.Extensions;
using Newtonsoft.Json;
using Shesha.Reflection;
using System;

namespace Shesha.Domain
{
    /// <summary>
    /// Identifier of the <see cref="EntityConfig"/> (Module, Name)
    /// </summary>
    [Serializable]
    public class EntityTypeIdentifier : ConfigurationItemIdentifier<EntityConfig>, IIdentifierFactory<EntityTypeIdentifier>
    {
        public string? FullClassName { get; set; }

        public EntityTypeIdentifier() : base(null, "")
        {

        }

        public EntityTypeIdentifier(string? module, string name, string? fullClassName) : base(module, name)
        {
            FullClassName = fullClassName;
        }

        public static EntityTypeIdentifier New(string? module, string name)
        {
            return new EntityTypeIdentifier(module, name, null);
        }

        public static EntityTypeIdentifier New(string entityType)
        {
            if (entityType.IsNullOrWhiteSpace())
                throw new ArgumentException("entityType can not be empty");

            if (entityType.Contains(":"))
                return GetIdFromTextId(entityType);

            if (entityType.Contains("{"))
                return JsonConvert.DeserializeObject<EntityTypeIdentifier>(entityType)
                    .NotNull("Parsing identifier Error. Format of data should be {module: string | null, name: string}");

            return new EntityTypeIdentifier(null, "", entityType);
        }

        public static string GetTextId(string? module, string name) => module.IsNullOrWhiteSpace() ? name : $"{module}:{name}";
        public static EntityTypeIdentifier GetIdFromTextId(string identifier) 
        {
            var parts = identifier.Split(':');
            if (parts.Length > 2)
                throw new ArgumentException("Input parameter should be in 'module: name' format");

            return parts.Length > 1
                ? New(parts[0].Trim(), parts[1].Trim())
                : New(null, parts[0].Trim());
        }

        public static implicit operator EntityTypeIdentifier(string entityType) => New(entityType);
    }
}