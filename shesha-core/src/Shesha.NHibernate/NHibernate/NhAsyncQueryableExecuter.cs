using Abp.Dependency;
using Abp.Linq;
using NHibernate.Linq;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.NHibernate
{
    /// <summary>
    /// Nhibernate queryable async executer. Is used to abstract from NHibernate dependencies
    /// </summary>
    public class NhAsyncQueryableExecuter : IAsyncQueryableExecuter, ISingletonDependency
    {
        public Task<int> CountAsync<T>(IQueryable<T> queryable)
        {
            if ((queryable.Provider is INhQueryProvider nhQueryProvider))
                return LinqExtensionMethods.CountAsync(queryable);

            return Task.FromResult(queryable.Count());
        }

        public Task<List<T>> ToListAsync<T>(IQueryable<T> queryable)
        {
            if ((queryable.Provider is INhQueryProvider nhQueryProvider))
                return LinqExtensionMethods.ToListAsync(queryable);

            return Task.FromResult(queryable.ToList());
        }

        public Task<T> FirstOrDefaultAsync<T>(IQueryable<T> queryable)
        {
            if ((queryable.Provider is INhQueryProvider nhQueryProvider))
                return LinqExtensionMethods.FirstOrDefaultAsync(queryable);

            return Task.FromResult(queryable.FirstOrDefault());
        }

        public Task<bool> AnyAsync<T>(IQueryable<T> queryable)
        {
            if ((queryable.Provider is INhQueryProvider nhQueryProvider))
                return LinqExtensionMethods.AnyAsync(queryable);

            return Task.FromResult(queryable.Any());
        }
    }
}
