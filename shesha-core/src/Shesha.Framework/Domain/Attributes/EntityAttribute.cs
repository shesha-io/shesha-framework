using Shesha.Domain.Enums;
using System;

namespace Shesha.Domain.Attributes
{
    /// <summary>
    /// Provides metadata to a domain entity
    /// </summary>
    [AttributeUsage(AttributeTargets.Class, Inherited = true)]
    public class EntityAttribute : Attribute
    {
        /// <summary>
        /// Specifies friendly name of the entity that should be shown to user when required
        /// </summary>
        public string? FriendlyName { get; set; }

        /// <summary>
        /// This is a short version of the Type name of the entity class that is unique within 
        /// all the entities in the current solution. 
        /// The Alias must be 100 characters long or less. This is also typically match
        /// the Discriminator value defined for the entity on NHibernate mapping if the entity
        /// is a subclass of another entity.
        /// </summary>
        public string? TypeShortAlias { get; set; }

        /// <summary>
        /// Name of the auto-generated applicaiton service, applicable only when <see cref="CrudActions"/> != <see cref="CrudActions.None"/>. Leave empty to use `{class name}Crud` as a name of the applicaiton service
        /// </summary>
        public string? ApplicationServiceName { get; set; }

        public EntityAttribute()
        {
            IsConfigurable = true;
            CrudActions = CrudActions.None;
        }

        /// <summary>
        /// List of CRUD actions exposed by default application service
        /// </summary>
        public CrudActions CrudActions { get; set; }

        /// <summary>
        /// Default CRUD actions access 
        /// </summary>
        public CrudActionsAccess CrudActionsAccess { get; set; } = CrudActionsAccess.AnyAuthenticated;

        /// <summary>
        /// Permissions required to access CRUD actions
        /// </summary>
        public string[] CrudActionsPermissions { get; set; } = [];

        /// <summary>
        /// Indicates that the entity is configurable
        /// </summary>
        public bool IsConfigurable { get; set; }

        public EntityCrudConfig GetCrudConfig() => new EntityCrudConfig(this);
    }
}
