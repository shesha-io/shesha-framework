using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Configuration.MappingMetadata
{
    public interface IMappingMetadataProvider
    {
        EntityMappingMetadata GetEntityMappingMetadata(Type entityType);

        PropertyMappingMetadata GetPropertyMappingMetadata(Type entityType, string propertyName);

        Task UpdateClassNames(Type entityType, List<PropertyInfo> properties, string oldValue, string newValue, bool replace);
    }
}
