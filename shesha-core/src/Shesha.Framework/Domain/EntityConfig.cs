using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using Shesha.DynamicEntities.Dtos;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Threading.Tasks;

namespace Shesha.Domain
{
    /// <summary>
    /// Entity configuration
    /// </summary>
    [Entity(TypeShortAlias = "Shesha.Framework.EntityConfig", GenerateApplicationService = GenerateApplicationServiceState.DisableGenerateApplicationService)]
    [JoinedProperty("Frwk_EntityConfigs")]
    [DiscriminatorValue(ItemTypeName)]
    public class EntityConfig : ConfigurationItemBase
    {
        public const string ItemTypeName = "entity";

        [EntityDisplayName]
        [StringLength(255)]
        public virtual string FriendlyName { get; set; }
        [StringLength(100)]
        public virtual string TypeShortAlias { get; set; }
        [StringLength(255)]
        public virtual string TableName { get; set; }
        [StringLength(500)]
        public virtual string ClassName { get; set; }
        [StringLength(500)]
        public virtual string Namespace { get; set; }
        [StringLength(255)]
        public virtual string DiscriminatorValue { get; set; }

        public virtual EntityConfig Parent { get; set; }

        public virtual bool GenerateAppService { get; set; }

        /// <summary>
        /// Source of the entity (code/user)
        /// </summary>
        public virtual MetadataSourceType? Source { get; set; }

        public virtual EntityConfigTypes? EntityConfigType { get; set; }

        /// <summary>
        /// MD5 hash of the hardcoded properties, is used for performance optimization of the bootstrapper
        /// </summary>
        [StringLength(40)]
        public virtual string PropertiesMD5 { get; set; }

        public override string ItemType => ItemTypeName;

        [SaveAsJson]
        public virtual List<EntityViewConfigurationDto> ViewConfigurations { get; set; } = new List<EntityViewConfigurationDto>();

        public EntityConfig()
        {
            // set to user-defined by default, `ApplicationCode` is used in the bootstrapper only
            Source = MetadataSourceType.UserDefined;
            
            EntityConfigType = Enums.EntityConfigTypes.Class;
        }

        [NotMapped]
        public virtual string FullClassName => $"{Namespace}.{ClassName}";

        /// <summary>
        /// Code identifier that can be used in the client-side code to reference current module
        /// </summary>
        [StringLength(200)]
        public virtual string Accessor { get; set; }
    }
}
