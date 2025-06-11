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
        public virtual EntityConfig PermissionedEntity1Type { get; set; }
        public virtual RefListPermissionedEntityIsRequired PermissionedEntity1IsRequired { get; set; }
        public virtual EntityConfig PermissionedEntity2Type { get; set; }
        public virtual RefListPermissionedEntityIsRequired PermissionedEntity2IsRequired { get; set; }
        public virtual EntityConfig PermissionedEntity3Type { get; set; }
        public virtual RefListPermissionedEntityIsRequired PermissionedEntity3IsRequired { get; set; }
        public virtual FormConfiguration RoleAppointmentCreateForm { get; set; }
        public virtual FormConfiguration RoleAppointmentDetailsForm { get; set; }
        public virtual FormConfiguration RoleAppointmentListItemForm { get; set; }
    }
}
