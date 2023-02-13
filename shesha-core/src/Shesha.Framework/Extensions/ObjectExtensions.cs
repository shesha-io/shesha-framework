using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using Abp.Domain.Entities;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.Reflection;

namespace Shesha.Extensions
{
    public static class ObjectExtensions
    {

        public static string GetClassName(this object obj)
        {
            return obj == null ? null : obj.GetType().FullName;
        }

        /// <summary>
        /// Indicates is an entity
        /// </summary>
        /// <param name="obj"></param>
        /// <returns></returns>
        public static bool IsEntity(this object obj)
        {
            return obj?.GetType().IsEntityType() ?? false;
        }

        /// <summary>
        /// Indicates is the specified type is {System.} type (include some standard type se like string, etc...)
        /// </summary>
        public static bool IsSystemType(this Type type)
        {
            return type.FullName.StartsWith("System.");
        }

        /// <summary>
        /// Indicates is the specified type is class but not an entity type
        /// </summary>
        public static bool IsNotAnyEntityAndSystemType(this Type type)
        {
            return type.IsClass
                && !type.IsEntityType()
                && !type.IsJsonEntityType()
                && !type.IsSystemType()
                && !type.IsEntityReferenceType();
        }

        /// <summary>
        /// Indicates is the specified type a type of entity
        /// </summary>
        public static bool IsEntityType(this Type type)
        {
            return MappingHelper.IsEntity(type);
        }

        /// <summary>
        /// Indicates is the specified type a type of entity reference
        /// </summary>
        public static bool IsEntityReferenceType(this Type type)
        {
            return MappingHelper.IsEntityReferenceType(type);
        }

        /// <summary>
        /// Indicates is the specified type a type of Json entity
        /// </summary>
        public static bool IsJsonEntityType(this Type type)
        {
            return MappingHelper.IsJsonEntity(type);
        }

        /// <summary>
        /// Returns true if the specified object is a List
        /// </summary>
        public static bool IsListType(this Type type)
        {
            return MappingHelper.IsListType(type);
        }
        /// <summary>
        /// Returns true if the specified type is a Dictionary
        /// </summary>
        public static bool IsDictionaryType(this Type type)
        {
            return MappingHelper.IsDictionaryType(type);
        }

        /// <summary>
        /// Returns true if the specified type is a List
        /// </summary>
        public static bool IsList(this object obj)
        {
            return MappingHelper.IsList(obj);
        }
        /// <summary>
        /// Returns true if the specified object is a Dictionary
        /// </summary>
        public static bool IsDictionary(this object obj)
        {
            return MappingHelper.IsDictionary(obj);
        }

        /// <summary>
        /// Indicates is the specified type a reference list type
        /// </summary>
        public static bool IsReferenceListType(this Type type)
        {
            return type != null && type.IsPublic && type.IsEnum && type.HasAttribute<ReferenceListAttribute>();
        }

        /// <summary>
        /// Get type of the `Id` property. Applicable for entity types
        /// </summary>
        /// <param name="type"></param>
        /// <returns></returns>
        public static Type GetEntityIdType(this Type type) 
        {
            return type?.GetProperty(SheshaDatabaseConsts.IdColumn)?.PropertyType;
        }
    }
}
