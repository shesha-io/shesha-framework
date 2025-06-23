using Shesha.Domain.Attributes;
using System;

namespace Shesha.Domain
{
    [SnakeCaseNaming]
    public abstract class EntityConfigBase : ConfigurationItem<EntityConfigRevision> 
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
    //[JoinedProperty("entity_configs", Schema = "frwk")]
    [SnakeCaseNaming]
    [DiscriminatorValue(ItemTypeName)]
    public class EntityConfig : EntityConfigBase, IConfigurationItemFactory<EntityConfig, EntityConfigRevision>
    {
        public const string ItemTypeName = "entity";

        public override string ItemType => ItemTypeName;

        public EntityConfig()
        {
        }

        public static EntityConfig New(Action<EntityConfigRevision> revisionInit)
        {
            EntityConfig? ec = null;
            return (ec = new EntityConfig
            {
                LatestRevision = new EntityConfigRevision { ConfigurationItem = ec! }
            });
        }
    }
}
