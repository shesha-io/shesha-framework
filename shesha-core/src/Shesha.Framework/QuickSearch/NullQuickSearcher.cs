using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace Shesha.QuickSearch
{
    /// <summary>
    /// Empty implementation of <see cref="IQuickSearcher"/>
    /// </summary>
    public class NullQuickSearcher : IQuickSearcher
    {
        public IQueryable<TEntity> ApplyQuickSearch<TEntity>(IQueryable<TEntity> queryable, string quickSearch, List<string> properties)
        {
            return queryable;
        }

        public IQueryable<TEntity> ApplyQuickSearch<TEntity>(IQueryable<TEntity> queryable, string quickSearch)
        {
            return queryable;
        }

        public Expression<Func<T, bool>> GetQuickSearchExpression<T>(string quickSearch, List<string> properties)
        {
            var parameter = Expression.Parameter(typeof(T), "ent");
            return Expression.Lambda<Func<T, bool>>(Expression.IsTrue(Expression.Constant(false)), parameter);
        }

        public Expression<Func<T, bool>> GetQuickSearchExpression<T>(string quickSearch)
        {
            var parameter = Expression.Parameter(typeof(T), "ent");
            return Expression.Lambda<Func<T, bool>>(Expression.IsTrue(Expression.Constant(false)), parameter);

        }
    }
}
