using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain.Enums;
using Shesha.DynamicEntities.Dtos;
using System.Collections.Generic;

namespace Shesha.DynamicEntities.Distribution.Dto
{
    /// <summary>
    /// Distributed entity config
    /// </summary>
    public class DistributedEntityConfig: DistributedConfigurableItemBase
    {
        public virtual string FriendlyName { get; set; }
        public virtual string TypeShortAlias { get; set; }
        public virtual string TableName { get; set; }
        public virtual string ClassName { get; set; }
        public virtual string Namespace { get; set; }
        public virtual string DiscriminatorValue { get; set; }

        public virtual bool GenerateAppService { get; set; }

        public virtual MetadataSourceType? Source { get; set; }

        public virtual EntityConfigTypes? EntityConfigType { get; set; }

        /// <summary>
        /// MD5 hash of the hardcoded properties, is used for performance optimization of the bootstrapper
        /// </summary>
        public virtual string PropertiesMD5 { get; set; }

        public virtual List<EntityViewConfigurationDto> ViewConfigurations { get; set; } = new List<EntityViewConfigurationDto>();

        public List<DistributedEntityConfigProperty> Properties { get; set; } = new List<DistributedEntityConfigProperty>();
    }
}
