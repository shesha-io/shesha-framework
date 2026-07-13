using Abp.Dependency;
using NHibernate.Linq;
using Shesha.Linq;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Shesha.NHibernate
{
    /// <summary>
    /// Nhibernate queryable async executer. Is used to abstract from NHibernate dependencies
    /// </summary>
    public class NhAsyncQueryableExecuter : IShaAsyncQueryableExecuter, ISingletonDependency
    {
        public Task<int> CountAsync<T>(IQueryable<T> queryable, CancellationToken cancellationToken = default)
        {
            if ((queryable.Provider is INhQueryProvider nhQueryProvider))
                return LinqExtensionMethods.CountAsync(queryable, cancellationToken);

            return Task.FromResult(queryable.Count());
        }

        public Task<List<T>> ToListAsync<T>(IQueryable<T> queryable, CancellationToken cancellationToken = default)
        {
            if ((queryable.Provider is INhQueryProvider nhQueryProvider))
                return LinqExtensionMethods.ToListAsync(queryable, cancellationToken);

            return Task.FromResult(queryable.ToList());
        }

        public async Task<T?> FirstOrDefaultAsync<T>(IQueryable<T> queryable, CancellationToken cancellationToken = default)
        {
            if (queryable.Provider is INhQueryProvider nhQueryProvider)
                return await LinqExtensionMethods.FirstOrDefaultAsync(queryable, cancellationToken);

            return queryable.FirstOrDefault();
        }

        public Task<bool> AnyAsync<T>(IQueryable<T> queryable, CancellationToken cancellationToken = default)
        {
            if ((queryable.Provider is INhQueryProvider nhQueryProvider))
                return LinqExtensionMethods.AnyAsync(queryable, cancellationToken);

            return Task.FromResult(queryable.Any());
        }

        public async Task<T> FirstAsync<T>(IQueryable<T> queryable, CancellationToken cancellationToken = default)
        {
            if (queryable.Provider is INhQueryProvider nhQueryProvider)
                return await LinqExtensionMethods.FirstAsync(queryable, cancellationToken);

            return queryable.First();
        }
    }
}
