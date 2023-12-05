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
        Task<List<T>> ToListAsync<T>(IQueryable<T> queryable, List<string> properties);
    }
}
