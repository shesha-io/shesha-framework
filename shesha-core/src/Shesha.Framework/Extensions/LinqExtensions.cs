﻿using JetBrains.Annotations;
using Shesha.Reflection;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Threading.Tasks;

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
        /// <typeparam name="TSource">The type of the elements of <paramref name="source" />.</typeparam>
        /// <typeparam name="TResult">The type of the value returned by the function represented by <paramref name="selector" />.</typeparam>
        /// <returns>The maximum value in the sequence.</returns>
        /// <exception cref="T:System.ArgumentNullException"><paramref name="source" /> or <paramref name="selector" /> is <see langword="null" />.</exception>
        public static async Task<TResult> MaxOrDefaultAsync<TSource, TResult>(this IQueryable<TSource> source,
            Expression<Func<TSource, TResult>> selector, TResult defaultValue)
        {
            return await source.AnyAsync()
                ? source.Max(selector) ?? defaultValue
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
            var property = typeof(T).GetProperties().First(x => x.Name.ToCamelCase() == propertyName.ToCamelCase());

            var result = typeof(LinqExtensions)
                .GetRequiredMethod(nameof(OrderByDynamic_Private), BindingFlags.NonPublic | BindingFlags.Static)
                .MakeGenericMethod(typeof(T), property.PropertyType)
                .Invoke<IOrderedEnumerable<T>>(null, [items, propertyName, direction])
                .NotNull();

            return result;
        }

        [UsedImplicitly]
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
    }
}
