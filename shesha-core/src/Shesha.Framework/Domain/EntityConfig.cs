using Shesha.Domain.Attributes;
using Shesha.Domain.Constants;
using Shesha.Domain.Enums;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Domain
{
    //[JoinedProperty("configuration_items", Schema = "frwk")]
    [SnakeCaseNaming]
    public class EntityConfigBase : ConfigurationItem<EntityConfigRevision> 
    {        
    }

    /// <summary>
    /// Entity configuration
    /// </summary>
    [Entity(
        FriendlyName = "Entity",
        TypeShortAlias = "Shesha.Framework.EntityConfig", 
        GenerateApplicationService = GenerateApplicationServiceState.DisableGenerateApplicationService
    )]
    [JoinedProperty("entity_configs", Schema = "frwk")]
    [FixedView(ConfigurationItemsViews.Create, SheshaFrameworkModule.ModuleName, "cs-entity-create")]
    [SnakeCaseNaming]
    [DiscriminatorValue(ItemTypeName)]
    public class EntityConfig : EntityConfigBase, IConfigurationItemFactory<EntityConfig, EntityConfigRevision>
    {
        public const string ItemTypeName = "entity";
        public override string ItemType => ItemTypeName;

        public EntityConfig()
        {
        }

        public virtual EntityConfig? InheritedFrom { get; set; }

        public virtual bool CreatedInDb { get; set; }

        public virtual string? IdColumn { get; set; }

        [MaxLength(255)]
        public virtual string? SchemaName { get; set; }

        [MaxLength(255)]
        public virtual string? TableName { get; set; }

        [MaxLength(500)]
        public virtual string ClassName { get; set; }
        [MaxLength(500)]
        public virtual string? Namespace { get; set; }
        [MaxLength(255)]
        public virtual string? DiscriminatorValue { get; set; }

        public virtual EntityConfigTypes? EntityConfigType { get; set; } = EntityConfigTypes.Class;

        [NotMapped]
        public virtual string FullClassName => $"{Namespace}.{ClassName}";


        public static EntityConfig New(Action<EntityConfigRevision> revisionInit)
        {
            EntityConfig? ec = null;
            return (ec = new EntityConfig
            {
                LatestRevision = new EntityConfigRevision { ConfigurationItem = ec! }
            });
        }

        public override string ToString()
        {
            return FullClassName;
        }
    }
}
