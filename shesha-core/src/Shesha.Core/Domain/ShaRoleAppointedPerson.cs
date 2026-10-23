using Shesha.Authorization;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Core.ShaRoleAppointedPerson", 
        FriendlyName = "Appointed Person", 
        CrudActions = CrudActions.Read, 
        CrudActionsAccess = CrudActionsAccess.RequiresPermissions, 
        CrudActionsPermissions = [PermissionNames.Role_Manage],
        IsConfigurable = false
    )]     
    [DiscriminatorValue((int)ShaRoleAppointmentType.Person)]
    public class ShaRoleAppointedPerson : ShaRoleAppointment
    {
        public virtual Person Person { get; set; }
    }
}