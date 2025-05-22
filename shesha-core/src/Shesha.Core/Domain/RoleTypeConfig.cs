using Shesha.Domain.Attributes;
using Shesha.Domain.ConfigurationItems;
using Shesha.Domain.Enums;

namespace Shesha.Domain
{
    [DiscriminatorValue(RoleAppointmentTypeName)]
    [JoinedProperty("Core_RoleTypeConfigs")]
    [Entity(TypeShortAlias = "Shesha.Core.RoleTypeConfig")]
    [Prefix(UsePrefixes = false)]
    public class RoleTypeConfig : ConfigurationItemBase
    {
        public RoleTypeConfig()
        {
            Init();
        }

        private void Init()
        {
            VersionStatus = ConfigurationItemVersionStatus.Draft;
        }

        public const string RoleAppointmentTypeName = "role-type";
        public override string ItemType => RoleAppointmentTypeName;
        public EntityConfig PermissionedEntity1Type { get; set; }
        public RefListPermissionedEntity1IsRequired PermissionedEntity1IsRequired { get; set; }
        public EntityConfig PermissionedEntity2Type { get; set; }
        public RefListPermissionedEntity2IsRequired PermissionedEntity2IsRequired { get; set; }
        public EntityConfig PermissionedEntity3Type { get; set; }
        public RefListPermissionedEntity3IsRequired PermissionedEntity3IsRequired { get; set; }
        public FormConfiguration RoleAppointmentCreateForm { get; set; }
        public FormConfiguration RoleAppointmentDetailsForm { get; set; }
        public FormConfiguration RoleAppointmentListItemForm { get; set; }
    }
}
