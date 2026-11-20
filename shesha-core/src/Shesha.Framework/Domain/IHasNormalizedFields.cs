using System.Collections.Generic;

namespace Shesha.Domain
{
    /// <summary>
    /// Implemented by entities that have fields derived from other fields (e.g. normalized copies of a value).
    /// The NHibernate interceptor calls <see cref="Normalize"/> on every save/flush, so the derived fields stay
    /// consistent even when the entity is saved without its dedicated domain service (e.g. via dynamic CRUD).
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
