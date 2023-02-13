using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.QuickSearch
{
    /// <summary>
    /// Entity quick searcher
    /// </summary>
    public interface IQuickSearcher
    {
        /// <summary>
        /// Get quick search linq expression
        /// </summary>
        /// <typeparam name="T">Type of entity</typeparam>
        /// <param name="quickSearch">Quick search text</param>
        /// <param name="properties">List of properties to search. Supports dot notation (e.g. User.Username)</param>
        /// <returns></returns>
        Expression<Func<T, bool>> GetQuickSearchExpression<T>(string quickSearch, List<string> properties);

        /// <summary>
        /// Get quick search linq expression. Uses root level properties of the specified entity
        /// </summary>
        /// <typeparam name="T">Type of entity</typeparam>
        /// <param name="quickSearch">Quick search text</param>
        /// <returns></returns>
        Expression<Func<T, bool>> GetQuickSearchExpression<T>(string quickSearch);

        /// <summary>
        /// Apply quick search to a specified <paramref name="queryable"/>
        /// </summary>
        /// <typeparam name="TEntity">Type of entity</typeparam>
        /// <param name="queryable">Queryable to be filtered</param>
        /// <param name="quickSearch">Quick search text</param>
        /// <param name="properties">List of properties to search. Supports dot notation (e.g. User.Username)</param>
        /// <returns></returns>
        IQueryable<TEntity> ApplyQuickSearch<TEntity>(IQueryable<TEntity> queryable, string quickSearch, List<string> properties);

        /// <summary>
        /// Apply quick search to a specified <paramref name="queryable"/>. Searches by root level properties of the specified entity
        /// </summary>
        /// <typeparam name="TEntity">Type of entity</typeparam>
        /// <param name="queryable">Queryable to be filtered</param>
        /// <param name="quickSearch">Quick search text</param>
        /// <returns></returns>
        IQueryable<TEntity> ApplyQuickSearch<TEntity>(IQueryable<TEntity> queryable, string quickSearch);
    }
}
