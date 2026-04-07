using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
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
                var batchItems = await repository.GetAllListAsync(x => batch.Contains(x.Id));
                result.AddRange(batchItems);
            }
            
            return result;
        }

        /// <summary>
        /// Determines whether a sequence contains any elements matching the specified predicate.
        /// </summary>
        /// <typeparam name="TEntity">Entity type</typeparam>
        /// <typeparam name="TPrimaryKey">Propary key type</typeparam>
        /// <param name="repository">Repository</param>
        /// <param name="predicate">Predicate to check</param>
        /// <returns></returns>
        public static async Task<bool> AnyAsync<TEntity, TPrimaryKey>(this IRepository<TEntity, TPrimaryKey> repository, Expression<Func<TEntity, bool>> predicate) where TEntity : class, IEntity<TPrimaryKey> 
        {
            var query = await repository.GetAllAsync();
            return await query.Where(predicate).AnyAsync();
        }

        /// <summary>
        /// Returns the first element of a sequence that satisfies a condition or a default value if no such element is found.
        /// </summary>
        /// <typeparam name="TEntity">Entity type</typeparam>
        /// <typeparam name="TPrimaryKey">Propary key type</typeparam>
        /// <param name="repository">Repository</param>
        /// <param name="predicate">Predicate to check</param>
        /// <returns></returns>
        public static async Task<TEntity?> FirstOrDefaultAsync<TEntity, TPrimaryKey>(this IRepository<TEntity, TPrimaryKey> repository, Expression<Func<TEntity, bool>> predicate) where TEntity : class, IEntity<TPrimaryKey>
        {
            var query = await repository.GetAllAsync();
            return await query.Where(predicate).FirstOrDefaultAsync();
        }

        /// <summary>
        /// Returns the first element of a sequence, or a default value if the sequence contains no elements.
        /// </summary>
        /// <typeparam name="TEntity">Entity type</typeparam>
        /// <typeparam name="TPrimaryKey">Propary key type</typeparam>
        /// <param name="repository">Repository</param>
        /// <returns></returns>
        public static async Task<TEntity?> FirstOrDefaultAsync<TEntity, TPrimaryKey>(this IRepository<TEntity, TPrimaryKey> repository) where TEntity : class, IEntity<TPrimaryKey> 
        {
            var query = await repository.GetAllAsync();
            return await query.FirstOrDefaultAsync();
        }

        /// <summary>
        /// Returns the first element of a sequence that satisfies a condition
        /// </summary>
        /// <typeparam name="TEntity">Entity type</typeparam>
        /// <typeparam name="TPrimaryKey">Propary key type</typeparam>
        /// <param name="repository">Repository</param>
        /// <param name="predicate">Predicate to check</param>
        /// <returns></returns>
        public static async Task<TEntity> FirstAsync<TEntity, TPrimaryKey>(this IRepository<TEntity, TPrimaryKey> repository, Expression<Func<TEntity, bool>> predicate) where TEntity : class, IEntity<TPrimaryKey>
        {
            var query = await repository.GetAllAsync();
            return await query.Where(predicate).FirstAsync();
        }

        /// <summary>
        /// Returns the first element of a sequence
        /// </summary>
        /// <typeparam name="TEntity">Entity type</typeparam>
        /// <typeparam name="TPrimaryKey">Propary key type</typeparam>
        /// <param name="repository">Repository</param>
        /// <returns></returns>
        public static async Task<TEntity> FirstAsync<TEntity, TPrimaryKey>(this IRepository<TEntity, TPrimaryKey> repository) where TEntity : class, IEntity<TPrimaryKey>
        {
            var query = await repository.GetAllAsync();
            return await query.FirstAsync();
        }
    }
}
