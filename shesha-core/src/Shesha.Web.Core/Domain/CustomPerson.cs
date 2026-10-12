using Shesha.Domain.Attributes;

namespace Shesha.Domain
{
    [DiscriminatorValue("CustomPerson")]
    [Entity(CrudActions = Enums.CrudActions.All, IsConfigurable = false)]
    [EntityAuthorize(Enums.CrudAction.Read, Enums.CrudActionsAccess.AllowAnonymous)]
    [EntityAuthorize(Enums.CrudAction.Update, Enums.CrudActionsAccess.AnyAuthenticated)]
    [EntityAuthorize(Enums.CrudAction.Delete, ["delete-permission-1", "delete-permission-2"])]
    public class CustomPerson: Person
    {
    }
}
