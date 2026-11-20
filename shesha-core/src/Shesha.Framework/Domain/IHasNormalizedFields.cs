using System.Collections.Generic;

namespace Shesha.Domain
{
    /// <summary>
    /// Implemented by entities that have fields derived from other fields (e.g. normalized copies of a value).
    /// The NHibernate interceptor calls <see cref="Normalize"/> when a new entity is saved and when a changed (dirty)
    /// entity is flushed, so the derived fields stay consistent even when the entity is saved without its dedicated
    /// domain service (e.g. via dynamic CRUD).
    /// An entity that is saved without any changes is not normalized: NHibernate skips unchanged entities on flush.
    /// Existing rows with stale derived fields are therefore corrected the next time the entity is changed.
    /// </summary>
    public interface IHasNormalizedFields
    {
        /// <summary>
        /// Names of the properties that <see cref="Normalize"/> writes. Only these properties are synced into the
        /// NHibernate state, so other (e.g. lazy-loaded) properties are never touched during a flush.
        /// </summary>
        IReadOnlyCollection<string> GetNormalizedFieldNames();

        /// <summary>
        /// Recalculates normalized fields from the current state of the entity. Must be idempotent.
        /// </summary>
        void Normalize();
    }
}
