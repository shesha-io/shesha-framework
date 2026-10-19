using Shesha.Domain.Enums;

namespace Shesha.Domain.Interfaces
{
    /// <summary>
    /// Entity CRUD action configuration
    /// </summary>
    public interface ICrudActionConfig
    {
        /// <summary>
        /// Default CRUD actions access 
        /// </summary>
        CrudActionsAccess CrudActionsAccess { get; }

        /// <summary>
        /// Permissions required to access CRUD actions
        /// </summary>
        string[] CrudActionsPermissions { get; }
    }
}
