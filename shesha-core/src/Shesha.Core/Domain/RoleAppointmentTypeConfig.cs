using Shesha.Domain.Attributes;
using Shesha.Domain.ConfigurationItems;
using Shesha.Domain.Enums;

namespace Shesha.Domain
{
    [DiscriminatorValue(RoleAppointmentTypeName)]
    [JoinedProperty("Core_RoleAppointmentTypeConfigs")]
    [Entity(TypeShortAlias = "Shesha.Core.RoleAppointmentTypeConfig")]
    [Prefix(UsePrefixes = false)]
    public class RoleAppointmentTypeConfig : ConfigurationItemBase
    {
        public RoleAppointmentTypeConfig()
        {
            Init();
        }

        private void Init()
        {
            VersionStatus = ConfigurationItemVersionStatus.Draft;
        }

        public const string RoleAppointmentTypeName = "role-appointment-type";
        public override string ItemType => RoleAppointmentTypeName;
        public EntityConfig PermissionedEntity1Type { get; set; }
        public RefListPermissionedEntityIsRequired PermissionedEntity1IsRequired { get; set; }
        public EntityConfig PermissionedEntity2Type { get; set; }
        public RefListPermissionedEntityIsRequired PermissionedEntity2IsRequired { get; set; }
        public EntityConfig PermissionedEntity3Type { get; set; }
        public RefListPermissionedEntityIsRequired PermissionedEntity3IsRequired { get; set; }
        public FormConfiguration RoleAppointmentCreateForm { get; set; }
        public FormConfiguration RoleAppointmentDetailsForm { get; set; }
        public FormConfiguration RoleAppointmentListItemForm { get; set; }
    }
}
