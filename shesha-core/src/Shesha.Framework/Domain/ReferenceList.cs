using Abp.Domain.Entities;
using Shesha.Domain.Attributes;
using Shesha.Domain.Constants;

namespace Shesha.Domain
{
    [SnakeCaseNaming]
    public abstract class ReferenceListBase : ConfigurationItem<ReferenceListRevision> 
    { 
    }

    [Entity(
        FriendlyName = "List of Values",
        TypeShortAlias = "Shesha.Framework.ReferenceList", 
        GenerateApplicationService = GenerateApplicationServiceState.DisableGenerateApplicationService
    )]
    [FixedView(ConfigurationItemsViews.Create, SheshaFrameworkModule.ModuleName, "cs-reflist-create")]
    [FixedView(ConfigurationItemsViews.Rename, SheshaFrameworkModule.ModuleName, "cs-item-rename")]
    //[JoinedProperty("reference_lists", Schema = "frwk")]
    [DiscriminatorValue(ItemTypeName)]
    [SnakeCaseNaming]
    public class ReferenceList : ReferenceListBase
    {
        public const string ItemTypeName = "reference-list";

        public ReferenceList()
        {
        }

        public override string ItemType => ItemTypeName;

        /// <summary>
        /// Get reference list identifier
        /// </summary>
        /// <returns></returns>
        public virtual ReferenceListIdentifier GetReferenceListIdentifier()
        {
            return new ReferenceListIdentifier(Module?.Name, Name);
        }        
    }
}