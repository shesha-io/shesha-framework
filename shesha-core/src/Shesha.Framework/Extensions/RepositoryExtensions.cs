using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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

        /// <summary>
        /// Get list of items by Id in batch mode
        /// </summary>
        /// <typeparam name="TEntity">Entity type</typeparam>
        /// <typeparam name="TPrimaryKey">Propary key type</typeparam>
        /// <param name="repository">Repository</param>
        /// <param name="ids">List of Ids to fetch</param>
        /// <param name="batchSize">Optional batch size (500 by default)</param>
        /// <returns></returns>
        public static async Task<List<TEntity>> GetListInBatchesAsync<TEntity, TPrimaryKey>(this IRepository<TEntity, TPrimaryKey> repository, List<TPrimaryKey> ids, int batchSize = 500) where TEntity : class, IEntity<TPrimaryKey>
        {
            if (ids == null || !ids.Any())
                return new List<TEntity>();

            var result = new List<TEntity>();

            var distinctIds = ids.Distinct().ToList();
            var batches = distinctIds.SplitList(batchSize);
            foreach (var batch in batches) 
            {
                var batchItems = await repository.GetAll()
                    .Where(x => batch.Contains(x.Id))
                    .ToListAsync();
                result.AddRange(batchItems);
            }
            
            return result;
        }
    }
}
