using Abp.Domain.Entities;
using Shesha.Domain.Attributes;
using Shesha.Domain.Constants;
using Shesha.EntityHistory;

namespace Shesha.Domain
{
    [SnakeCaseNaming]
    public abstract class ShaRoleBase : ConfigurationItem<ShaRoleRevision> 
    { 
    }

    /// <summary>
    /// Role
    /// </summary>
    [Entity(FriendlyName = "Role", TypeShortAlias = "Shesha.Core.ShaRole")]
    [FixedView(ConfigurationItemsViews.Create, SheshaFrameworkModule.ModuleName, "cs-role-create")]
    [FixedView(ConfigurationItemsViews.Rename, SheshaFrameworkModule.ModuleName, "cs-item-rename")]
    [DisplayManyToManyAuditTrail(typeof(ShaRoleAppointedPerson), "Person", DisplayName = "Member")]
    //[JoinedProperty("roles", Schema = "frwk")]
    [Prefix(UsePrefixes = false)]
    [DiscriminatorValue(ItemTypeName)]
    [SnakeCaseNaming]
    public class ShaRole : ShaRoleBase
    {
        public const string ItemTypeName = "role";

        public override string ToString()
        {
            return Name;
        }
    }
}