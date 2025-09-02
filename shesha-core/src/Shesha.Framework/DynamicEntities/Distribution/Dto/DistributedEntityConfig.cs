using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain.Enums;
using Shesha.DynamicEntities.Dtos;
using Shesha.Permissions;
using System.Collections.Generic;

namespace Shesha.DynamicEntities.Distribution.Dto
{
    /// <summary>
    /// Distributed entity config
    /// </summary>
    public class DistributedEntityConfig: DistributedConfigurableItemBase
    {
        public string? FriendlyName { get; set; }
        public string? TypeShortAlias { get; set; }
        
        public string? SchemaName { get; set; }
        public string? TableName { get; set; }
        public string ClassName { get; set; }
        public string? Namespace { get; set; }
        public string? DiscriminatorValue { get; set; }

        public bool GenerateAppService { get; set; }

        public MetadataSourceType? Source { get; set; }

        public EntityConfigTypes? EntityConfigType { get; set; }

        /// <summary>
        /// MD5 hash of the hardcoded properties, is used for performance optimization of the bootstrapper
        /// </summary>
        public string? PropertiesMD5 { get; set; }

        public List<EntityViewConfigurationDto> ViewConfigurations { get; set; } = new List<EntityViewConfigurationDto>();

        public List<DistributedEntityConfigProperty> Properties { get; set; } = new List<DistributedEntityConfigProperty>();

        public PermissionedObjectDto Permission { get; set; }
        public PermissionedObjectDto PermissionGet { get; set; }
        public PermissionedObjectDto PermissionCreate { get; set; }
        public PermissionedObjectDto PermissionUpdate { get; set; }
        public PermissionedObjectDto PermissionDelete { get; set; }
    }
}
