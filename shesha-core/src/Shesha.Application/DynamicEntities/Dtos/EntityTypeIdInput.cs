using Abp.Collections.Extensions;
using Abp.Extensions;
using DocumentFormat.OpenXml.Wordprocessing;
using Newtonsoft.Json;
using Shesha.Domain;
using Shesha.Reflection;
using System;

namespace Shesha.DynamicEntities.Dtos
{
    /// <summary>
    /// Identifier of the <see cref="EntityConfig"/> (Module, Name)
    /// </summary>
    [Serializable]
    public class EntityTypeIdInput
    {
        public string? FullClassName { get; set; }

        public string? Module { get; set; }

        public string? Name { get; set; }

        public EntityTypeIdInput()
        {
        }

        public EntityTypeIdInput(string? module, string? name, string? fullClassName)
        {
            Module = module;
            Name = name;
            FullClassName = fullClassName;
        }

        public static EntityTypeIdInput New(string? module, string? name, string? fullClassName)
        {
            return new EntityTypeIdInput(module, name, fullClassName);
        }

        public static EntityTypeIdInput New(string entityType)
        {
            if (entityType.IsNullOrWhiteSpace())
                throw new ArgumentException("entityType can not be empty");

            if (entityType.Contains(":"))
                return GetIdFromTextId(entityType);

            if (entityType.Contains("{"))
                return JsonConvert.DeserializeObject<EntityTypeIdInput>(entityType)
                    .NotNull("Parsing identifier Error. Format of data should be {module: string | null, name: string}");

            return new EntityTypeIdInput(null, null, entityType);
        }

        public static string GetTextId(string? module, string name) => module.IsNullOrWhiteSpace() ? name : $"{module}: {name}";
        public static EntityTypeIdInput GetIdFromTextId(string identifier)
        {
            var parts = identifier.Split(':');
            if (parts.Length < 1 || parts.Length > 2)
                throw new ArgumentException("Input parameter should be in 'module: name' format");

            return parts.Length > 1
                ? New(parts[0].Trim(), parts[1].Trim(), null)
                : New(null, parts[0].Trim(), null);
        }

        public static implicit operator EntityTypeIdInput(string entityType) => New(entityType);

        public override string ToString()
        {
            return FullClassName.IsNullOrEmpty()
                ? Module.IsNullOrEmpty()
                    ? Name ?? "empty"
                    : $"{Module}.{Name}"
                : FullClassName ?? "empty";
        }
    }

    public static class EntityTypeIdInputExtensions
    {
        public static bool IsEmpty(this EntityTypeIdInput? id)
        {
            return id == null || id.FullClassName.IsNullOrEmpty() && id.Name.IsNullOrEmpty();
        }
    }
}