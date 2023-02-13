using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using System.Linq;

namespace Shesha.Extensions
{
    /// <summary>
    /// <see cref="IRepository"/> extensions
    /// </summary>
    public static class RepositoryExtensions
    {
        /// <summary>
        /// Query all entities filtered using <paramref name="filter"/> (filter in JsonLogic format)
        /// </summary>
        /// <typeparam name="TEntity"></typeparam>
        /// <typeparam name="TPrimaryKey"></typeparam>
        /// <param name="repository">Repository</param>
        /// <param name="filter">Filter in JsonLogic format</param>
        /// <returns></returns>
        public static IQueryable<TEntity> GetAllFiltered<TEntity, TPrimaryKey>(this IRepository<TEntity, TPrimaryKey> repository, string filter) where TEntity : class, IEntity<TPrimaryKey>
        {
            return repository.GetAll().ApplyFilter<TEntity, TPrimaryKey>(filter);
        }
    }
}
