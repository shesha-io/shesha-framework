using Abp.Domain.Entities;
using System.Collections.Generic;

namespace Shesha.Orm
{
    /// <summary>
    /// Entity persister informer. Provides basic information about entity perststance
    /// </summary>
    public interface IEntityPersistanceInformer
    {
        /// <summary>
        /// Get dirty properties of the specified <paramref name="entity"/>
        /// </summary>
        List<DirtyPropertyInfo> GetDirtyProperties<T>(IEntity<T> entity);

        /// <summary>
        /// Returns true if the specified <paramref name="entity"/> is dirty (has any of changed properties)
        /// </summary>
        bool IsDirty<T>(IEntity<T> entity);
    }
}