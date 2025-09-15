using Abp.Domain.Entities;
using Abp.Linq;
using Newtonsoft.Json.Linq;
using Shesha.JsonLogic;
using Shesha.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace Shesha.Extensions
{
    /// <summary>
    /// Queryable extensions (https://stackoverflow.com/a/44071949)
    /// </summary>
    public static class IQueryableExtensions
    {
        public static IOrderedQueryable<T> OrderBy<T>(this IQueryable<T> query, string propertyName, IComparer<object>? comparer = null)
        {
            return CallOrderedQueryable(query, "OrderBy", propertyName, comparer);
        }

        public static IOrderedQueryable<T> OrderByDescending<T>(this IQueryable<T> query, string propertyName, IComparer<object>? comparer = null)
        {
            return CallOrderedQueryable(query, "OrderByDescending", propertyName, comparer);
        }

        public static IOrderedQueryable<T> ThenBy<T>(this IOrderedQueryable<T> query, string propertyName, IComparer<object>? comparer = null)
        {
            return CallOrderedQueryable(query, "ThenBy", propertyName, comparer);
        }

        public static IOrderedQueryable<T> ThenByDescending<T>(this IOrderedQueryable<T> query, string propertyName, IComparer<object>? comparer = null)
        {
            return CallOrderedQueryable(query, "ThenByDescending", propertyName, comparer);
        }

        /// <summary>
        /// Builds the Queryable functions using a TSource property name.
        /// </summary>
        public static IOrderedQueryable<T> CallOrderedQueryable<T>(this IQueryable<T> query, string methodName, string propertyName,
                IComparer<object>? comparer = null)
        {
            var param = Expression.Parameter(typeof(T), "x");

            var body = propertyName.Split('.').Aggregate<string, Expression>(param, Expression.PropertyOrField);

            return comparer != null
                ? (IOrderedQueryable<T>)query.Provider.CreateQuery(
                    Expression.Call(
                        typeof(Queryable),
                        methodName,
                        [typeof(T), body.Type],
                        query.Expression,
                        Expression.Lambda(body, param),
                        Expression.Constant(comparer)
                    )
                )
                : (IOrderedQueryable<T>)query.Provider.CreateQuery(
                    Expression.Call(
                        typeof(Queryable),
                        methodName,
                        [typeof(T), body.Type],
                        query.Expression,
                        Expression.Lambda(body, param)
                    )
                );
        }

        /// <summary>
        /// Apply JsonLogic filter to a queryable. Note: it uses default <see cref="IJsonLogic2LinqConverter"/> registered in the IoCManager
        /// </summary>
        /// <param name="query">Queryable to be filtered</param>
        /// <param name="filter">String representation of JsonLogic filter</param>
        /// <returns></returns>
        public static IQueryable<TEntity> ApplyFilter<TEntity, TId>(this IQueryable<TEntity> query, string? filter) where TEntity : class, IEntity<TId>
        {
            if (string.IsNullOrWhiteSpace(filter))
                return query;

            var jsonLogic = JObject.Parse(filter);

            var jsonLogicConverter = StaticContext.IocManager.Resolve<IJsonLogic2LinqConverter>();
            var expression = jsonLogicConverter.ParseExpressionOf<TEntity>(jsonLogic);

            return expression != null
                ? query.Where(expression)
                : query;
        }

        public static List<Dt> Map<Dt, St>(this IEnumerable<St> source, Func<St, Dt> func)
        {
            var destination = new List<Dt>();
            foreach (var item in source)
                destination.Add(func(item));
            return destination;
        }

        #region IAsyncQueryableExecuter extensions

        /// <summary>
        /// Call `ToListAsync` using current <see cref="IAsyncQueryableExecuter"/>
        /// </summary>
        /// <typeparam name="T">Type of entity</typeparam>
        /// <param name="queryable">Query</param>
        /// <returns></returns>
        public static Task<List<T>> ToListAsync<T>(this IQueryable<T> queryable) 
        {
            var asyncExecuter = StaticContext.IocManager.Resolve<IAsyncQueryableExecuter>();
            return asyncExecuter.ToListAsync(queryable);
        }

        /// <summary>
        /// Call `FirstOrDefaultAsync` using current <see cref="IAsyncQueryableExecuter"/>
        /// </summary>
        /// <typeparam name="T">Type of entity</typeparam>
        /// <param name="queryable">Query</param>
        /// <returns></returns>
        public static Task<T> FirstOrDefaultAsync<T>(this IQueryable<T> queryable)
        {
            var asyncExecuter = StaticContext.IocManager.Resolve<IAsyncQueryableExecuter>();
            return asyncExecuter.FirstOrDefaultAsync(queryable);
        }

        /// <summary>
        /// Call `FirstOrDefaultAsync` using current <see cref="IAsyncQueryableExecuter"/>
        /// </summary>
        /// <typeparam name="T">Type of entity</typeparam>
        /// <param name="queryable">Query</param>
        /// <param name="predicate">A function to test each element for a condition</param>
        /// <returns></returns>
        public static Task<T> FirstOrDefaultAsync<T>(this IQueryable<T> queryable, Expression<Func<T, bool>> predicate)
        {
            return queryable.Where(predicate).FirstOrDefaultAsync();
        }

        /// <summary>
        /// Call `CountAsync` using current <see cref="IAsyncQueryableExecuter"/>
        /// </summary>
        /// <typeparam name="T">Type of entity</typeparam>
        /// <param name="queryable">Query</param>
        /// <returns></returns>
        public static Task<int> CountAsync<T>(this IQueryable<T> queryable)
        {
            var asyncExecuter = StaticContext.IocManager.Resolve<IAsyncQueryableExecuter>();
            return asyncExecuter.CountAsync(queryable);
        }

        /// <summary>
        /// Call `AnyAsync` using current <see cref="IAsyncQueryableExecuter"/>
        /// </summary>
        /// <typeparam name="T">Type of entity</typeparam>
        /// <param name="queryable">Query</param>
        /// <returns></returns>
        public static Task<bool> AnyAsync<T>(this IQueryable<T> queryable)
        {
            var asyncExecuter = StaticContext.IocManager.Resolve<IAsyncQueryableExecuter>();
            return asyncExecuter.AnyAsync(queryable);
        }

        /// <summary>
        /// Call `AnyAsync` using current <see cref="IAsyncQueryableExecuter"/>
        /// </summary>
        /// <typeparam name="T">Type of entity</typeparam>
        /// <param name="queryable">Query</param>
        /// <param name="predicate">A function to test each element for a condition</param>
        /// <returns></returns>
        public static Task<bool> AnyAsync<T>(this IQueryable<T> queryable, Expression<Func<T, bool>> predicate)
        {
            return queryable.Where(predicate).AnyAsync();
        }

        #endregion
    }
}
