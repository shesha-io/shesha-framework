using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Newtonsoft.Json.Linq;
using PluralizeService.Core;
using Shesha.Authorization.Users;
using Shesha.Configuration.Runtime.Exceptions;
using Shesha.Domain.Attributes;
using Shesha.Domain.Conventions;
using Shesha.Domain.Interfaces;
using Shesha.EntityReferences;
using Shesha.Extensions;
using Shesha.JsonEntities;
using Shesha.Metadata;
using Shesha.Reflection;
using System;
using System.Collections;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Reflection;

namespace Shesha.Domain
{
    public static class MappingHelper
    {
        public static readonly string AutoGeneratorSchema = "auto_gen";

        public static readonly ConcurrentDictionary<string, string> Prefixes = new ConcurrentDictionary<string, string>();

        public static void AddDatabasePrefixForAssembly(Assembly assembly, string databasePrefix)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(assembly.FullName);

            Prefixes[assembly.FullName] = databasePrefix;
        }

        /// <summary>
        /// Sorts entity types by inheritance (base classes first).
        /// NH doesn't sort entities itself and throws an exception when you try to map more than 2 levels hierarchy (using TPH)
        /// </summary>
        public static List<Type> SortEntityTypesByInheritance(List<Type> types)
        {
            var typesInfo = types.Select(t =>
            {
                var baseClasses = new List<Type>();
                GetBaseClasses(t, ref baseClasses);
                return new
                {
                    Type = t,
                    BaseClasses = baseClasses
                };
            }).ToList();

            var sorted = new List<Type>();
            while (typesInfo.Any())
            {
                var i = 0;
                while (i <= typesInfo.Count - 1)
                {
                    if (!typesInfo[i].BaseClasses.Any(bc => typesInfo.Any(t => t.Type == bc)))
                    {
                        sorted.Add(typesInfo[i].Type);
                        typesInfo.RemoveAt(i);
                    }
                    else
                        i++;
                }
            }

            return sorted;
        }

        private static void GetBaseClasses(Type type, ref List<Type> classes)
        {
            if (type == null)
                throw new Exception("Type is null");

            if (type.BaseType != null)
            {
                classes.Add(type.BaseType);
                GetBaseClasses(type.BaseType, ref classes);
            }
        }

        public static string GetTableName(Type entityType) 
        {
            return GetTableNameOrNull(entityType) ?? throw new EntityHasNoTableException(entityType);
        }

        /// <summary>
        /// Returns table name for the specified entity type
        /// </summary>
        /// <param name="entityType"></param>
        /// <returns></returns>
        public static string? GetTableNameOrNull(Type entityType)
        {
            if (IsRootEntity(entityType))
            {
                // If the `TableAttribute` exists - use it. Note: we search the attribute in base classes too, it allows to use it in the abstract classes
                var tableAttribute = entityType.Closest(t => t.BaseType, t => t.HasAttribute<TableAttribute>())?.GetAttributeOrNull<TableAttribute>();
                if (tableAttribute != null)
                    return tableAttribute.Name;

                var plural = PluralizationProvider.Pluralize(entityType.Name);
                var conventions = GetNamingConventions(entityType);
                var prefix = GetTablePrefix(entityType);
                var name = conventions.GetTableName(prefix, plural);

                return name;
            }
            else 
            {
                var root = GetRootEntity(entityType);
                return root != null
                    ? GetTableName(root)
                    : null;
            }                
        }
        
        public static (Type parentType, Type parentIdType, Type childType, Type childIdType) GetManyToManyTableData(MemberInfo property)
        {
            var parentType = property.DeclaringType.NotNull();
            var parentIdType = parentType.GetProperty("Id")?.PropertyType;
            if (parentIdType == null)
                throw new NullReferenceException($"'Id' property not found for '{parentType.FullName}'");

            if (!property.GetPropertyOrFieldType().IsGenericType)
                throw new NullReferenceException($"'{property.Name}' of '{parentType.FullName}' is not a generic list");

            var childType = property.GetPropertyOrFieldType().GetGenericArguments()[0];
            var childIdType = childType.GetProperty("Id")?.PropertyType;
            if (childIdType == null)
                throw new NullReferenceException($"'Id' property not found for '{childType.FullName}'");
            return (parentType, parentIdType, childType, childIdType);
        }

        /// <summary>
        /// Returns schema name for the specified entity type
        /// </summary>
        /// <param name="entityType"></param>
        /// <returns></returns>
        public static string? GetSchemaName(Type entityType)
        {
            if (IsRootEntity(entityType))
            {
                // If the `TableAttribute` exists - use it. Note: we search the attribute in base classes too, it allows to use it in the abstract classes
                var tableAttribute = entityType.Closest(t => t.BaseType, t => t.HasAttribute<TableAttribute>())?.GetAttributeOrNull<TableAttribute>();
                return tableAttribute?.Schema;
            }
            else
            {
                var root = GetRootEntity(entityType);
                return root != null
                    ? GetSchemaName(root)
                    : null;
            }
        }

        /// <summary>
        /// Returns column name for the specified property
        /// </summary>
        public static string GetColumnName(MemberInfo memberInfo)
        {
            var columnAttribute = memberInfo.GetAttributeOrNull<ColumnAttribute>(true);

            if (!string.IsNullOrWhiteSpace(columnAttribute?.Name))
                return columnAttribute.Name;

            // Handle overrided properties. Try to search the same property in the base class and if it declared on the upper level - use name from base class
            if (!IsRootEntity(memberInfo.DeclaringType.NotNull()) && memberInfo.DeclaringType.BaseType != null)
            {
                var upperLevelProperty = memberInfo.DeclaringType.BaseType.GetProperty(memberInfo.Name);
                if (upperLevelProperty != null)
                    return GetColumnName(upperLevelProperty);
            }

            var columnPrefix = GetColumnPrefix(memberInfo.DeclaringType);
            var propertyType = memberInfo.GetPropertyOrFieldType().GetUnderlyingTypeIfNullable();

            var suffix = propertyType.IsEntityType()
                ? "Id"
                :memberInfo.IsReferenceListProperty()
                    ? "Lkp"
                    : propertyType == typeof(TimeSpan) || propertyType == typeof(TimeSpan?)
                        ? "Ticks"
                        : null;

            return GetNameForMember(memberInfo, columnPrefix, memberInfo.Name, suffix);
        }

        public static string GetColumnName(EntityProperty propertyConfig, IModuleList moduleList)
        {
            // ToDo: AS V1 - use correct nameConventions

            var suffix = propertyConfig.DataType == DataTypes.EntityReference || propertyConfig.DataType == DataTypes.File
                ? "Id"
                : propertyConfig.DataType == DataTypes.ReferenceListItem 
                    || (propertyConfig.DataType == DataTypes.Array && propertyConfig.DataFormat == ArrayFormats.MultivalueReferenceList)
                    ? "Lkp"
                    : null;
            return $"{GetColumnPrefix(propertyConfig.EntityConfig, moduleList)}{propertyConfig.Name}{suffix}";

        }

        /// <summary>
        /// Get name of the ID column taking into account all attributes except prefix and postfix
        /// </summary>
        /// <param name="memberInfo"></param>
        /// <returns></returns>
        public static string GetIdColumnName(MemberInfo memberInfo)
        {
            var columnAttribute = memberInfo.GetAttributeOrNull<ColumnAttribute>(true);

            if (!string.IsNullOrWhiteSpace(columnAttribute?.Name))
                return columnAttribute.Name;

            return GetNameForMember(memberInfo, "", memberInfo.Name, "");
        }

        /// <summary>
        /// Get column name for the specified member (property/field) with explicitly specified prefix, name and suffix
        /// </summary>
        public static string GetNameForMember(MemberInfo memberInfo, string prefix, string name, string? suffix)
        {
            var conventions = GetNamingConventions(memberInfo);
            return conventions.GetColumnName(prefix, name, suffix);
        }

        /// <summary>
        /// Get column name for the specified entity type
        /// </summary>
        public static string GetNameForColumn(Type type, string prefix, string name, string? suffix)
        {
            var conventions = GetNamingConventions(type);
            return conventions.GetColumnName(prefix, name, suffix);
        }

        private static INamingConventions GetNamingConventions(MemberInfo memberInfo)
        {
            return GetNamingConventions(memberInfo.ReflectedType.NotNull());
        }

        private static INamingConventions GetNamingConventions(Type type)
        {
            var conventionsType = type.GetAttributeOrNull<NamingConventionsAttribute>(false)?.ConventionsType ?? typeof(DefaultNamingConventions);
            return ActivatorHelper.CreateNotNullObject(conventionsType).ForceCastAs<INamingConventions>();
        }

        public static string? GetDbNamesExpression(Type type) 
        {
            var conventions = GetNamingConventions(type);
            return conventions.DbNamesExpression;
        }

        public static Type GetPropertyOrFieldType(this MemberInfo propertyOrField)
        {
            if (propertyOrField.MemberType == MemberTypes.Property)
            {
                return ((PropertyInfo)propertyOrField).PropertyType;
            }

            if (propertyOrField.MemberType == MemberTypes.Field)
            {
                return ((FieldInfo)propertyOrField).FieldType;
            }

            throw new ArgumentOutOfRangeException("propertyOrField",
                                                  "Expected PropertyInfo or FieldInfo; found :" + propertyOrField.MemberType);
        }

        /// <summary>
        /// Returns prefix for the table columns of the specified type of entity
        /// </summary>
        /// <param name="type"></param>
        /// <returns></returns>
        public static string GetColumnPrefix(Type type)
        {
            var prefixAttribute = type.GetCustomAttribute<PrefixAttribute>();
            if (prefixAttribute != null)
            {
                return prefixAttribute.UsePrefixes && !string.IsNullOrWhiteSpace(prefixAttribute.Prefix)
                    ? prefixAttribute.Prefix
                    : string.Empty;
            }

            if (!IsRootEntity(type))
            {
                var rootType = GetRootEntity(type);
                
                if (rootType != null)
                {
                    var typeAssemblyName = type.GetAssemblyFullName();
                    var rootTypeAssemblyName = rootType.GetAssemblyFullName();
                    if (rootTypeAssemblyName != typeAssemblyName) 
                    {
                        // This column extends a table created in another module - we should add a prefix
                        if (!Prefixes.ContainsKey(rootTypeAssemblyName)
                            || Prefixes[rootTypeAssemblyName] != Prefixes[typeAssemblyName])
                            return GetTablePrefix(type);
                    }                    
                }
            }

            return "";
        }

        /// <summary>
        /// Returns prefix for the table columns of the specified type of entity
        /// </summary>
        /// <param name="config"></param>
        /// <param name="moduleList"></param>
        /// <returns></returns>
        public static string GetColumnPrefix(EntityConfig config, IModuleList moduleList)
        {
            if (config.InheritedFrom != null)
            {
                var rootConfig = config.InheritedFrom;
                // ToDo: AS - infinity loop should not be there but need to think how to be shure
                while (rootConfig.InheritedFrom != null)
                    rootConfig = rootConfig.InheritedFrom;
                
                var configAssemblyName = moduleList.Modules.FirstOrDefault(x => x.ModuleInfo.Name == config.Module.NotNull().Name)?.Assembly.FullName;
                var rootConfigAssemblyName = moduleList.Modules.FirstOrDefault(x => x.ModuleInfo.Name == rootConfig.Module.NotNull().Name)?.Assembly.FullName;
                if (rootConfigAssemblyName != configAssemblyName)
                {
                    // This column extends a table created in another module - we should add a prefix
                    if (!Prefixes.ContainsKey(rootConfigAssemblyName.NotNull())
                        || Prefixes[rootConfigAssemblyName] != Prefixes[configAssemblyName.NotNull()])
                        return Prefixes[configAssemblyName.NotNull()];
                }
            }
            return "";
        }

        /// <summary>
        /// Returns prefix for the table of the specified type of entity
        /// </summary>
        /// <param name="type"></param>
        /// <returns></returns>
        public static string GetTablePrefix(Type type)
        {
            return Prefixes.TryGetValue(type.GetAssemblyFullName(), out var prefix)
                ? prefix ?? string.Empty
                : string.Empty;
        }

        public static string GetTablePrefix(Assembly assembly)
        {
            return Prefixes.TryGetValue(assembly.FullName.NotNull(), out var prefix)
                ? prefix ?? string.Empty
                : string.Empty;
        }


        /// <summary>
        /// Returns root entity type for the specified entity type
        /// </summary>
        /// <param name="type"></param>
        /// <returns></returns>
        private static Type? GetRootEntity(Type? type)
        {
            if (type == null)
                return null;

            if (IsRootEntity(type.BaseType))
                return type.BaseType;
            return GetRootEntity(type.BaseType);
        }

        /// <summary>
        /// Returns tru if the specified type is a root entity type
        /// </summary>
        /// <param name="type"></param>
        /// <returns></returns>
        public static bool IsRootEntity(Type? type)
        {
            return (IsEntity(type)
                    && !type.HasAttribute<NotMappedAttribute>()
                    && typeof(Entity) != type
                    && GetRootEntity(type) == null);
        }

        /// <summary>
        /// Returns true if the specified type is a Proxy
        /// </summary>
        /// <returns></returns>
        public static bool IsProxy([NotNullWhen(true)] Type? type)
        {
            return type != null && type != type.StripCastleProxyType();
        }

        /// <summary>
        /// Returns true if the specified type is an entity type
        /// </summary>
        public static bool IsEntity([NotNullWhen(true)]Type? type)
        {
            // todo: use global helper
            return type != null &&
                   !type.IsAbstract &&
                   !type.IsGenericType &&
                   !type.HasAttribute<NotMappedAttribute>() &&
                   (type.GetInterfaces().Contains(typeof(IEntity))
                    || type.GetInterfaces().Any(x =>
                        x.IsGenericType &&
                        x.GetGenericTypeDefinition() == typeof(IEntity<>))
                    || type.GetInterfaces().Contains(typeof(IEntityWithoutId)));
        }

        /// <summary>
        /// Returns true if the specified type is an entity type
        /// </summary>
        public static bool IsEntityReferenceType(Type type)
        {
            return type == typeof(GenericEntityReference);
        }

        /// <summary>
        /// Returns true if the specified type is an Json entity type
        /// </summary>
        public static bool IsJsonEntity(Type? type)
        {
            // todo: use global helper
            return type != null &&
                !type.IsAbstract &&
                !type.HasAttribute<Newtonsoft.Json.JsonIgnoreAttribute>() &&
                !type.HasAttribute<System.Text.Json.Serialization.JsonIgnoreAttribute>() &&
                type.GetInterfaces().Contains(typeof(IJsonEntity));
        }

        /// <summary>
        /// Returns true if the specified object is a List
        /// </summary>
        public static bool IsList(object o)
        {
            return o != null && o is IList && IsListType(o.GetType());
        }

        /// <summary>
        /// Returns true if the specified object is a Dicitonary
        /// </summary>
        public static bool IsDictionary(object o)
        {
            return o != null && o is IDictionary && IsDictionaryType(o.GetType());
        }

        /// <summary>
        /// Returns true if the specified type is a List
        /// </summary>
        public static bool IsListType(Type type)
        {
            return type.IsGenericType
                && type != typeof(JObject)
                && (
                    type.GetGenericTypeDefinition().IsAssignableTo(typeof(IList<>))
                    || type.GetGenericTypeDefinition().IsAssignableTo(typeof(List<>))
                    || type.ImplementsGenericInterface(typeof(IList<>)) 
                    || type.ImplementsGenericInterface(typeof(ICollection<>)) 
                    || type.ImplementsGenericInterface(typeof(IEnumerable<>)) 
                    || type.GetInterface(nameof(IEnumerable)) != null
                    || type.GetInterface(nameof(ICollection)) != null
                    || type.GetInterface(nameof(IList)) != null
                );
        }

        /// <summary>
        /// Returns true if the specified type is a Dicitonary
        /// </summary>
        public static bool IsDictionaryType(Type type)
        {
            return type.IsGenericType && type.GetGenericTypeDefinition().IsAssignableTo(typeof(IDictionary<,>));
        }

        /// <summary>
        /// Returns name of the foreign key column for the specified Entity reference
        /// </summary>
        /// <param name="prop"></param>
        /// <returns></returns>
        public static string GetForeignKeyColumn(MemberInfo prop)
        {
            var foreignKeyAttribute = prop.GetAttributeOrNull<ForeignKeyAttribute>(true);
            if (foreignKeyAttribute != null) 
            {
                var skipFkAttribute = IsDeclaredInGenericType(prop, typeof(AuditedEntity<,>)) && prop.Name == nameof(AuditedEntity<Guid, User>.CreatorUser)
                    || IsDeclaredInGenericType(prop, typeof(AuditedEntity<,>)) && prop.Name == nameof(AuditedEntity<Guid, User>.LastModifierUser)
                    || IsDeclaredInGenericType(prop, typeof(FullAuditedEntity<,>)) && prop.Name == nameof(FullAuditedEntity<Guid, User>.DeleterUser);
                
                if (!skipFkAttribute)
                    return foreignKeyAttribute.Name;
            }                

            var columnPrefix = GetColumnPrefix(prop.DeclaringType.NotNull());

            var conventions = GetNamingConventions(prop);
            return conventions.GetColumnName(columnPrefix, prop.Name, "Id");
        }

        private static bool IsDeclaredInGenericType(MemberInfo prop, Type type) 
        {
            return prop.DeclaringType != null &&
                prop.DeclaringType.IsGenericType &&
                prop.DeclaringType.GetGenericTypeDefinition() == type;
        }

        /// <summary>
        /// Returns discriminator value for the specified entity type
        /// </summary>
        /// <param name="type"></param>
        /// <returns></returns>
        public static object GetDiscriminatorValue(Type type)
        {
            var discriminatorValueAttribute = type.GetAttributeOrNull<DiscriminatorValueAttribute>();

            if (discriminatorValueAttribute != null)
                return discriminatorValueAttribute.Value;

            var prefix = Prefixes[type.Assembly.FullName.NotNull()]?.TrimEnd('_', '.');

            var discriminatorValue = !string.IsNullOrWhiteSpace(prefix)
                ? prefix + "." + type.Name
                : type.Name;

            // todo: throw exception instead of truncation after checking of existing entities 
            if (discriminatorValue.Length > SheshaDatabaseConsts.DiscriminatorMaxSize)
                discriminatorValue = discriminatorValue.Substring(0, SheshaDatabaseConsts.DiscriminatorMaxSize);

            return discriminatorValue;
        }

        /// <summary>
        /// Returns name of the discriminator column
        /// </summary>
        /// <param name="type"></param>
        /// <returns></returns>
        public static string? GetDiscriminatorColumn(Type type)
        {
            var attribute = type.GetCustomAttributes(true)
                .Where(a => a is DiscriminatorAttribute)
                .Cast<DiscriminatorAttribute>().FirstOrDefault();

            if (attribute == null || !attribute.UseDiscriminator)
                return null;

            return !string.IsNullOrWhiteSpace(attribute.DiscriminatorColumn)
                ? attribute.DiscriminatorColumn
                : GetNameForColumn(type, DiscriminatorAttribute.DefaultPrefix, DiscriminatorAttribute.DefaultName, null);
        }

        /// <summary>
        /// Returns true if NH should filter out unknown discriminators
        /// </summary>
        /// <param name="type"></param>
        /// <returns></returns>
        public static bool GetFilterUnknownDiscriminatorsFlag(Type type)
        {
            var attribute = type.GetCustomAttributes(true)
                .Where(a => a is DiscriminatorAttribute)
                .Cast<DiscriminatorAttribute>().FirstOrDefault();

            // filter unknown discriminators by default
            return attribute != null
                ? attribute.FilterUnknownDiscriminators
                : true;
        }

        /// <summary>
        /// Returns true if the property is persisted to the DB. Note: this method performs only base check, it may be overrided on the ORM mapping level
        /// </summary>
        public static bool IsPersistentProperty(MemberInfo prop)
        {
            return !prop.HasAttribute<NotMappedAttribute>();
        }
    }
}
