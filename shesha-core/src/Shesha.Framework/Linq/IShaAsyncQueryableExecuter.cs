using Abp.Linq;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Shesha.Linq
{
    /// <summary>
    /// Extended version of IAsyncQueryableExecuter
    /// </summary>
    public interface IShaAsyncQueryableExecuter: IAsyncQueryableExecuter
    {
        Task<T> FirstAsync<T>(IQueryable<T> queryable, CancellationToken cancellationToken = default);
    }
}
