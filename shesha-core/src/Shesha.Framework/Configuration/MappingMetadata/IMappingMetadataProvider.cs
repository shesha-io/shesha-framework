using System;
using System.Collections.Generic;
using System.Reflection;
using System.Threading.Tasks;

namespace Shesha.Configuration.MappingMetadata
{
    public interface IMappingMetadataProvider
    {
        EntityMappingMetadata GetEntityMappingMetadata(Type entityType);

        PropertyMappingMetadata? GetPropertyMappingMetadata(Type entityType, string propertyName);

        Task UpdateClassNamesAsync(Type entityType, List<PropertyInfo> properties, string oldValue, string newValue, bool replace);

        void ResetMapping();
    }
}
