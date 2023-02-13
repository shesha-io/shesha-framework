using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using Abp.Specifications;
using NHibernate.Linq;

namespace Shesha.Extensions
{
    public static class LinqExtensions
    {
        /// <summary>
        /// Invokes a projection function on each element of a generic <see cref="T:System.Linq.IQueryable`1" /> and returns the maximum resulting value or <paramref name="defaultValue"/> if the sequence contains no elements.
        /// </summary>
        /// <param name="source">A sequence of values to determine the maximum of.</param>
        /// <param name="selector">A projection function to apply to each element.</param>
        /// <param name="defaultValue"></param>
        /// <param name="cancellationToken">A cancellation token that can be used to cancel the work.</param>
        /// <typeparam name="TSource">The type of the elements of <paramref name="source" />.</typeparam>
        /// <typeparam name="TResult">The type of the value returned by the function represented by <paramref name="selector" />.</typeparam>
        /// <returns>The maximum value in the sequence.</returns>
        /// <exception cref="T:System.ArgumentNullException"><paramref name="source" /> or <paramref name="selector" /> is <see langword="null" />.</exception>
        public static async Task<TResult> MaxOrDefaultAsync<TSource, TResult>(this IQueryable<TSource> source,
            Expression<Func<TSource, TResult>> selector, TResult defaultValue,
            CancellationToken cancellationToken = default)
        {
            return await source.AnyAsync(cancellationToken)
                ? await source.MaxAsync(selector, cancellationToken)
                : defaultValue;
        }

        /// <summary>
        /// Order by property name
        /// </summary>
        /// <param name="items">A sequence of values to order</param>
        /// <param name="propertyName">name of property</param>
        /// <param name="direction">Direction: "asc"/"desc"</param>
        /// <returns></returns>
        public static IOrderedEnumerable<T> OrderByDynamic<T>(this IEnumerable<T> items, string propertyName, string direction = "asc")
        {
            var property = typeof(T).GetProperty(propertyName);

            var result = typeof(LinqExtensions)
                .GetMethod("OrderByDynamic_Private", BindingFlags.NonPublic | BindingFlags.Static)
                .MakeGenericMethod(typeof(T), property.PropertyType)
                .Invoke(null, new object[] { items, propertyName, direction });

            return (IOrderedEnumerable<T>)result;
        }

        private static IOrderedEnumerable<T> OrderByDynamic_Private<T, TKey>(IEnumerable<T> items, string propertyName, string direction)
        {
            var parameter = Expression.Parameter(typeof(T), "x");

            Expression<Func<T, TKey>> property_access_expression =
                Expression.Lambda<Func<T, TKey>>(Expression.Property(parameter, propertyName),parameter);

            if (direction == "asc")
                return items.OrderBy(property_access_expression.Compile());

            if (direction == "desc")
                return items.OrderByDescending(property_access_expression.Compile());

            throw new Exception("Invalid Sort Direction");
        }

        /// <summary>
        /// Order by property name
        /// </summary>
        /// <param name="items">A sequence of values to order</param>
        /// <param name="propertyName">name of property</param>
        /// <param name="direction">Direction: "asc"/"desc"</param>
        /// <returns></returns>
        public static IEnumerable<T> LikeDynamic<T>(this IEnumerable<T> items, string[] propertyNames, string filterValue)
        {
            if (!propertyNames.Any()) return items;

            var result = typeof(LinqExtensions)
                .GetMethod("LikeDynamic_Private", BindingFlags.NonPublic | BindingFlags.Static)
                .MakeGenericMethod(typeof(T))
                .Invoke(null, new object[] { items, propertyNames, filterValue });

            return (IEnumerable<T>)result;
        }

        private static IEnumerable<T> LikeDynamic_Private<T>(IEnumerable<T> items, string[] propertyNames, string filterValue)
        {
            Expression<Func<T, bool>> fullExpression = null;

            foreach (var propertyName in propertyNames)
            {
                // Necessarily create a new string variable to use in different expressions
                var tPropName = propertyName;
                Expression<Func<T, bool>> expr = x =>
                    (x.GetType().InvokeMember(
                         tPropName,
                         BindingFlags.GetProperty,
                         null,
                         x, null)
                     ?? string.Empty).ToString().IndexOf(filterValue, StringComparison.InvariantCultureIgnoreCase) >= 0;
                
                // add expressions to OR condition
                fullExpression = fullExpression == null ? expr : fullExpression.Or(expr);
            }

            return fullExpression == null ? items : items.Where(fullExpression.Compile());
        }

    }
}
