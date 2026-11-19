using System.Collections.Generic;

namespace Shesha.Domain
{
    /// <summary>
    /// Implemented by entities that have fields derived from other fields (e.g. normalized copies of a value)
    /// which must be recalculated before the entity is validated and persisted.
    /// It is called by every generic save path (dynamic CRUD model binding and the NHibernate interceptor),
    /// so derived fields stay consistent even when the entity is saved without its dedicated domain service.
    /// </summary>
    public interface IHasCalculatedFields
    {
        /// <summary>
        /// Names of the properties that <see cref="CalculateFields"/> writes. Incoming values for these properties are
        /// ignored by the model binder (they would be overwritten anyway), and only these properties are synced
        /// into the NHibernate state, so unrelated (e.g. lazy) properties are never touched during a flush.
        /// </summary>
        IReadOnlyCollection<string> GetCalculatedFieldNames();

        /// <summary>
        /// Recalculates derived fields from the current state of the entity. Must be idempotent.
        /// </summary>
        void CalculateFields();
    }
}
