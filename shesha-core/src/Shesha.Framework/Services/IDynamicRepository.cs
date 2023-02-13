using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Shesha.Configuration.Runtime;

namespace Shesha.Services
{
    /// <summary>
    /// Dynamic repository, allows to manipulate entities of different types using type reference or <see cref="EntityConfiguration.TypeShortAlias"/>
    /// </summary>
    public interface IDynamicRepository
    {
        /// <summary>
        /// Returns entity of the specified type (by <paramref name="entityTypeShortAlias"/>) with the specified Id
        /// </summary>
        /// <param name="entityTypeShortAlias">TypeShortAlias of the entity</param>
        /// <param name="id">Id of the entity</param>
        Task<object> GetAsync(string entityTypeShortAlias, string id);

        /// <summary>
        /// Returns entity of the specified type (by <paramref name="entityTypeShortAlias"/>) with the specified Id
        /// </summary>
        /// <param name="entityTypeShortAlias">TypeShortAlias of the entity</param>
        /// <param name="id">Id of the entity</param>
        object Get(string entityTypeShortAlias, string id);

        /// <summary>
        /// Returns entity of the specified type (<paramref name="entityType"/>) with the specified Id
        /// </summary>
        /// <param name="entityType">Type of the entity</param>
        /// <param name="id">Id of the entity</param>
        Task<object> GetAsync(Type entityType, string id);

        /// <summary>
        /// Returns entity of the specified type (<paramref name="entityType"/>) with the specified Id
        /// </summary>
        /// <param name="entityType">Type of the entity</param>
        /// <param name="id">Id of the entity</param>
        object Get(Type entityType, string id);

        /// <summary>
        /// Saves or update specified entity
        /// </summary>
        Task SaveOrUpdateAsync(object entity);

        /// <summary>
        /// Delete specified entity
        /// </summary>
        Task DeleteAsync(object entity);

        /// <summary>
        /// Returns queryable source (<see cref="IQueryable"/>) with entities of the specified type
        /// </summary>
        IQueryable<T> Query<T>();
    }
}
