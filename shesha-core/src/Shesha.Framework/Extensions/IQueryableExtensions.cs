using Abp.Authorization;
using Abp.Domain.Entities;
using Abp.Linq;
using Newtonsoft.Json.Linq;
using NUglify;
using Shesha.JsonLogic;
using Shesha.Permissions.Entity;
using Shesha.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;

namespace Shesha.Extensions
{
    /// <summary>
    /// Queryable extensions (https://stackoverflow.com/a/44071949)
    /// </summary>
    public static class IQueryableExtensions
    {
        public static IOrderedQueryable<T> OrderBy<T>(this IQueryable<T> query, string propertyName, bool checkPropertiesPermissions)
        {
            return CallOrderedQueryable(query, "OrderBy", propertyName, null, checkPropertiesPermissions);
        }

        public static IOrderedQueryable<T> OrderByDescending<T>(this IQueryable<T> query, string propertyName, bool checkPropertiesPermissions)
        {
            return CallOrderedQueryable(query, "OrderByDescending", propertyName, null, checkPropertiesPermissions);
        }

        public static IOrderedQueryable<T> ThenBy<T>(this IOrderedQueryable<T> query, string propertyName, bool checkPropertiesPermissions)
        {
            return CallOrderedQueryable(query, "ThenBy", propertyName, null, checkPropertiesPermissions);
        }

        public static IOrderedQueryable<T> ThenByDescending<T>(this IOrderedQueryable<T> query, string propertyName, bool checkPropertiesPermissions)
        {
            return CallOrderedQueryable(query, "ThenByDescending", propertyName, null, checkPropertiesPermissions);
        }

        public static IOrderedQueryable<T> OrderBy<T>(this IQueryable<T> query, string propertyName, IComparer<object> comparer = null, bool checkPropertiesPermissions = false)
        {
            return CallOrderedQueryable(query, "OrderBy", propertyName, comparer, checkPropertiesPermissions);
        }

        public static IOrderedQueryable<T> OrderByDescending<T>(this IQueryable<T> query, string propertyName, IComparer<object> comparer = null, bool checkPropertiesPermissions = false)
        {
            return CallOrderedQueryable(query, "OrderByDescending", propertyName, comparer, checkPropertiesPermissions);
        }

        public static IOrderedQueryable<T> ThenBy<T>(this IOrderedQueryable<T> query, string propertyName, IComparer<object> comparer = null, bool checkPropertiesPermissions = false)
        {
            return CallOrderedQueryable(query, "ThenBy", propertyName, comparer, checkPropertiesPermissions);
        }

        public static IOrderedQueryable<T> ThenByDescending<T>(this IOrderedQueryable<T> query, string propertyName, IComparer<object> comparer = null, bool checkPropertiesPermissions = false)
        {
            return CallOrderedQueryable(query, "ThenByDescending", propertyName, comparer, checkPropertiesPermissions);
        }

        /// <summary>
        /// Builds the Queryable functions using a TSource property name.
        /// </summary>
        public static IOrderedQueryable<T> CallOrderedQueryable<T>(this IQueryable<T> query, string methodName, string propertyName,
                IComparer<object> comparer = null, bool checkPropertiesPermissions = false)
        {
            var param = Expression.Parameter(typeof(T), "x");

            Func<Expression, string, Expression> func = Expression.PropertyOrField;
            if (checkPropertiesPermissions) {
                var permissionedEntityProvider = StaticContext.IocManager.Resolve<IPermissionedEntityProvider>();
                func = (expression, propertyName) =>
                {
                    var propInfo = (expression as Expression)?.Type.GetProperty(propertyName, BindingFlags.Instance | BindingFlags.Public | BindingFlags.IgnoreCase | BindingFlags.FlattenHierarchy);
                    if (propInfo != null && !permissionedEntityProvider.IsPropertyGranted(propInfo))
                        throw new AbpAuthorizationException($"You don't have permission to order by '{propertyName}' property.");
                    return Expression.PropertyOrField(expression, propertyName);
                };
            }

            var body = propertyName.Split('.').Aggregate<string, Expression>(param, func);

            return comparer != null
                ? (IOrderedQueryable<T>)query.Provider.CreateQuery(
                    Expression.Call(
                        typeof(Queryable),
                        methodName,
                        new[] { typeof(T), body.Type },
                        query.Expression,
                        Expression.Lambda(body, param),
                        Expression.Constant(comparer)
                    )
                )
                : (IOrderedQueryable<T>)query.Provider.CreateQuery(
                    Expression.Call(
                        typeof(Queryable),
                        methodName,
                        new[] { typeof(T), body.Type },
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
        /// <param name="checkPropertiesPermissions">Check permissions for filtered properties</param>
        /// <returns></returns>
        public static IQueryable<TEntity> ApplyFilter<TEntity, TId>(this IQueryable<TEntity> query, string filter, bool checkPropertiesPermissions = false) where TEntity : class, IEntity<TId>
        {
            if (string.IsNullOrWhiteSpace(filter))
                return query;

            var jsonLogic = JObject.Parse(filter);

            var jsonLogicConverter = StaticContext.IocManager.Resolve<IJsonLogic2LinqConverter>();
            jsonLogicConverter.CheckPropertiesPermissions = checkPropertiesPermissions;
            var expression = jsonLogicConverter.ParseExpressionOf<TEntity>(jsonLogic);

            return query.Where(expression);
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

        /// <summary>
        /// Sets queryable as read-only. Is used for optimization. It disabled additional logic that is applied to mutable entities (e.g. dirty checking)
        /// </summary>
        public static IQueryable<T> SetReadOnly<T>(this IQueryable<T> queryable) 
        {
            var fetcher = StaticContext.IocManager.Resolve<IEntityFetcher>();
            return fetcher.SetReadOnly(queryable);
        }
    }
}
