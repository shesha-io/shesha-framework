using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Services
{
    /// <summary>
    /// Entity fetcher, is used for optimization purposes
    /// </summary>
    public interface IEntityFetcher
    {
        /// <summary>
        /// Fetch list of entities including specified properties in dot notation
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="queryable"></param>
        /// <param name="properties"></param>
        /// <returns></returns>
        Task<List<T>> ToListAsync<T>(IQueryable<T> queryable, List<string> properties) where T : class, new();

        /// <summary>
        /// Sets queryable as read only. Used for optimization
        /// </summary>
        IQueryable<T> SetReadOnly<T>(IQueryable<T> queryable);
    }
}
