using Abp.Domain.Entities;
using Shesha.Authorization;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using System.Collections.Generic;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Core.Organisation", CrudActions = CrudActions.All, CrudActionsAccess = CrudActionsAccess.RequiresPermissions)]
    [EntityAuthorize(CrudAction.Create, [PermissionNames.Organisation_Create])]
    [EntityAuthorize(CrudAction.Read, [PermissionNames.Organisation_View])]
    [EntityAuthorize(CrudAction.Update, [PermissionNames.Organisation_Update])]
    [EntityAuthorize(CrudAction.Delete, [PermissionNames.Organisation_Delete])]
    public class Organisation : OrganisationBase<Organisation, Address, Person>
    {
        public virtual IList<OrganisationPerson> Persons { get; set; }
    }
}