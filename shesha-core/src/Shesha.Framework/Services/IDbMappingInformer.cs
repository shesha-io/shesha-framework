using System;
using System.Reflection;

namespace Shesha.Services
{
    /// <summary>
    /// Database mapping informer. Provides information about mapping between the DB and objects
    /// </summary>
    public interface IDbMappingInformer
    {
        /// <summary>
        /// Check is entity mapped to the DB
        /// </summary>
        bool IsMappedEntity(Type entityType, PropertyInfo property);
    }
}
