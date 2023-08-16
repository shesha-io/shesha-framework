using System;
using System.Collections;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Reflection;
using System.Text.Json.Serialization;
using Abp.Domain.Entities;
using Newtonsoft.Json;
using PluralizeService.Core;
using Shesha.Domain.Attributes;
using Shesha.Domain.Conventions;
using Shesha.Domain.Interfaces;
using Shesha.EntityReferences;
using Shesha.Extensions;
using Shesha.JsonEntities;
using Shesha.Reflection;

namespace Shesha.Domain
{
    public static class MappingHelper
    {
        public static readonly ConcurrentDictionary<string, string> Prefixes = new ConcurrentDictionary<string, string>();

        public static void AddDatabasePrefixForAssembly(Assembly assembly, string databasePrefix)
        {
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

        /// <summary>
        /// Returns table name for the specified entity type
        /// </summary>
        /// <param name="entityType"></param>
        /// <returns></returns>
        public static string GetTableName(Type entityType)
        {
            if (IsRootEntity(entityType))
            {
                // If the `TableAttribute` exists - use it. Note: we search the attribute in base classes too, it allows to use it in the abstract classes
                var tableAttribute = entityType.Closest(t => t.BaseType, t => t.HasAttribute<TableAttribute>())?.GetAttribute<TableAttribute>();
                if (tableAttribute != null)
                    return tableAttribute.Name;

                var name = PluralizationProvider.Pluralize(entityType.Name);
                var prefix = GetTablePrefix(entityType);
                if (!string.IsNullOrWhiteSpace(prefix))
                    name = $"{prefix}{name}";

                return name;
            }
            else
                return GetTableName(GetRootEntity(entityType));
        }

        /// <summary>
        /// Returns schema name for the specified entity type
        /// </summary>
        /// <param name="entityType"></param>
        /// <returns></returns>
        public static string GetSchemaName(Type entityType) 
        {
            if (IsRootEntity(entityType))
            {
                // If the `TableAttribute` exists - use it. Note: we search the attribute in base classes too, it allows to use it in the abstract classes
                var tableAttribute = entityType.Closest(t => t.BaseType, t => t.HasAttribute<TableAttribute>())?.GetAttribute<TableAttribute>();
                return tableAttribute?.Schema;
            }
            else
                return GetSchemaName(GetRootEntity(entityType));
        }

        /// <summary>
        /// Returns column name for the specified property
        /// </summary>
        public static string GetColumnName(MemberInfo memberInfo)
        {
            var columnAttribute = memberInfo.GetAttribute<ColumnAttribute>(true);

            if (!string.IsNullOrWhiteSpace(columnAttribute?.Name))
                return columnAttribute.Name;

            // Handle overrided properties. Try to search the same property in the base class and if it declared on the upper level - use name from base class
            if (!IsRootEntity(memberInfo.DeclaringType) && memberInfo.DeclaringType.BaseType != null)
            {
                var upperLevelProperty = memberInfo.DeclaringType.BaseType.GetProperty(memberInfo.Name);
                if (upperLevelProperty != null)
                    return GetColumnName(upperLevelProperty);
            }

            var columnPrefix = GetColumnPrefix(memberInfo.DeclaringType);
            var propertyType = memberInfo.GetPropertyOrFieldType().GetUnderlyingTypeIfNullable();

            var conventions = GetNamingConventions(memberInfo);

            var suffix = memberInfo.IsReferenceListProperty()
                ? "Lkp"
                : propertyType == typeof(TimeSpan) || propertyType == typeof(TimeSpan?)
                    ? "Ticks"
                    : null;

            return conventions.GetColumnName(columnPrefix, memberInfo.Name, suffix);
        }

        private static INamingConventions GetNamingConventions(MemberInfo memberInfo) 
        {
            var conventionsType = memberInfo.ReflectedType.GetAttribute<NamingConventionsAttribute>()?.ConventionsType ?? typeof(DefaultNamingConventions);
            return Activator.CreateInstance(conventionsType) as INamingConventions;
        }

        private static Type GetPropertyOrFieldType(this MemberInfo propertyOrField)
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
                return !prefixAttribute.UsePrefixes
                    ? ""
                    : prefixAttribute.Prefix;
            }

            if (!IsRootEntity(type))
            {
                Type rootType = GetRootEntity(type);
                if (rootType != null && rootType.Assembly.FullName != type.Assembly.FullName)
                {
                    if (!Prefixes.ContainsKey(rootType.Assembly.FullName)
                        || Prefixes[rootType.Assembly.FullName] != Prefixes[type.Assembly.FullName])
                        return GetTablePrefix(type);
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
            return Prefixes.ContainsKey(type.Assembly.FullName)
                ? Prefixes[type.Assembly.FullName] ?? ""
                : "";
        }


        /// <summary>
        /// Returns root entity type for the specified entity type
        /// </summary>
        /// <param name="type"></param>
        /// <returns></returns>
        private static Type GetRootEntity(Type type)
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
        public static bool IsRootEntity(Type type)
        {
            return (IsEntity(type)
                    && !type.HasAttribute<NotMappedAttribute>()
                    && typeof(Entity) != type
                    && GetRootEntity(type) == null);
        }

        /// <summary>
        /// Returns true if the specified type is an entity type
        /// </summary>
        public static bool IsEntity(Type type)
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
        public static bool IsJsonEntity(Type type)
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
            return type.IsGenericType && type.GetGenericTypeDefinition().IsAssignableTo(typeof(IList<>));
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
        public static string GetForeignKeyColumn(PropertyInfo prop)
        {
            var foreignKeyAttribute = prop.GetAttribute<ForeignKeyAttribute>(true);

            var columnPrefix = GetColumnPrefix(prop.DeclaringType);

            return foreignKeyAttribute != null
                ? foreignKeyAttribute.Name
                : columnPrefix + prop.Name + "Id";
        }

        /// <summary>
        /// Returns discriminator value for the specified entity type
        /// </summary>
        /// <param name="type"></param>
        /// <returns></returns>
        public static object GetDiscriminatorValue(Type type)
        {
            var discriminatorValueAttribute = type.GetAttribute<DiscriminatorValueAttribute>();

            if (discriminatorValueAttribute != null)
                return discriminatorValueAttribute.Value;

            var prefix = Prefixes[type.Assembly.FullName]?.TrimEnd('_', '.');

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
        public static string GetDiscriminatorColumn(Type type)
        {
            var attribute = type.GetCustomAttributes(true)
                .Where(a => a is DiscriminatorAttribute)
                .Cast<DiscriminatorAttribute>().FirstOrDefault();

            return attribute?.UseDiscriminator == true
                ? attribute.DiscriminatorColumn
                : null;
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
