using JetBrains.Annotations;
using Shesha.Metadata.Dtos;
using System;
using System.Collections.Generic;
using System.Reflection;

namespace Shesha.Metadata
{
    /// <summary>
    /// Metadata provider
    /// </summary>
    public interface IHardcodeMetadataProvider
    {
        /// <summary>
        /// Get metadata of specified property
        /// </summary>
        /// <param name="property">Property to get metadata for</param>
        /// <param name="context">Metadata context</param>
        /// <returns></returns>
        PropertyMetadataDto GetPropertyMetadata(PropertyInfo property, MetadataContext context);

        /// <summary>
        /// Get properties metadata of the specified <paramref name="type"/>
        /// </summary>
        /// <param name="type">Type</param>
        /// <param name="context">Metadata context</param>
        /// <returns></returns>
        List<PropertyMetadataDto> GetProperties(Type type, MetadataContext? context = null);

        /// <summary>
        /// Get data type of the specified property
        /// </summary>
        /// <returns></returns>
        DataTypeInfo GetDataType(PropertyInfo propInfo, Type entityType);

        /// <summary>
        /// Get data type by property type
        /// </summary>
        /// <param name="propType"></param>
        /// <param name="propInfo"></param>
        /// <param name="entityType"></param>
        /// <returns></returns>
        DataTypeInfo? GetDataTypeByPropertyType(Type propType, [CanBeNull] MemberInfo? propInfo, Type entityType);

        /// <summary>
        /// Returns true if the property is a framework related one
        /// </summary>
        /// <param name="property"></param>
        /// <returns></returns>
        bool IsFrameworkRelatedProperty(PropertyInfo property);
    }
}
