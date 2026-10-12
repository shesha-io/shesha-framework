namespace Shesha.Domain.Enums
{
    /// <summary>
    /// CRUD actions access type
    /// </summary>
    public enum CrudActionsAccess
    {
        Inherited = 2,
        AnyAuthenticated = 2,
        RequiresPermissions = 4,
        AllowAnonymous = 5
    }
}
