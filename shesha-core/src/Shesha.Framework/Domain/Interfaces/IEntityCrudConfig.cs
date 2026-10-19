using Shesha.Domain.Enums;

namespace Shesha.Domain.Interfaces
{
    /// <summary>
    /// Entity CRUD configuration
    /// </summary>
    public interface IEntityCrudConfig
    {
        /// <summary>
        /// List of CRUD actions exposed by default application service
        /// </summary>
        CrudActions CrudActions { get; }

        /// <summary>
        /// Default CRUD actions access 
        /// </summary>
        CrudActionsAccess CrudActionsAccess { get; }

        /// <summary>
        /// Permissions required to access CRUD actions
        /// </summary>
        string[] CrudActionsPermissions { get; }

        /// <summary>
        /// Indicates that the entity is configurable
        /// </summary>
        public bool IsConfigurable { get; }

        /// <summary>
        /// Indicates that the entity is immutable
        /// </summary>
        public bool IsImmutable { get; }

        void MakeImmutable();
    }
}
