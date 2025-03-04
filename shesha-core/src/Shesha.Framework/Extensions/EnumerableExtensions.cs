﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Threading;

namespace Shesha.Extensions
{
    /// <summary>
    /// Enumerable extensions
    /// </summary>
    public static class IEnumerableExtensions
    {
        /// <summary>
        /// Splits a List into smaller lists of N size
        /// </summary>
        public static IEnumerable<List<T>> SplitList<T>(this List<T> items, int nSize)
        {
            for (int i = 0; i < items.Count; i += nSize)
            {
                yield return items.GetRange(i, Math.Min(nSize, items.Count - i));
            }
        }

        /// <summary>
        /// Projects each element of an enumerable sequence into a List by applying an asynchronous selector function to each member of the source sequence and awaiting the result.
        /// </summary>
        /// <typeparam name="TSource">The type of the elements in the source sequence.</typeparam>
        /// <typeparam name="TResult">The type of the elements in the result sequence, obtained by running the selector function for each element in the source sequence and awaiting the result.</typeparam>
        /// <param name="source">A sequence of elements to invoke a transform function on.</param>
        /// <param name="selector">An asynchronous transform function to apply to each source element.</param>
        /// <param name="cancellationToken">The optional cancellation token to be used for cancelling the sequence at any time.</param>
        /// <returns>A list whose elements are the result of invoking the transform function on each element of the source sequence and awaiting the result.</returns>
        /// <exception cref="ArgumentNullException"><paramref name="source"/> or <paramref name="selector"/> is null.</exception>
        public static async Task<IEnumerable<TResult>> SelectAsync<TSource, TResult>(
            this IEnumerable<TSource> source,
            Func<TSource, Task<TResult>> selector,
            CancellationToken cancellationToken = default
        )
        {
            return await source
                .ToAsyncEnumerable()
                .SelectAwait(async x => await selector(x))
                .ToListAsync(cancellationToken);
        }

        public static async Task<IEnumerable<TResult>> SelectManyAsync<TSource, TResult>(
            this IEnumerable<TSource> source,
            Func<TSource, Task<IEnumerable<TResult>>> selector,
            CancellationToken cancellationToken = default
        )
        {
            return await source
                .ToAsyncEnumerable()
                .SelectManyAwait(async x => (await selector(x)).ToAsyncEnumerable())
                .ToListAsync(cancellationToken);
        }

        /// <summary>
        /// Invokes a transform function on each element of a sequence and returns the minimum value 
        /// if the sequence is not empty; otherwise returns the specified default value. 
        /// </summary>
        /// <typeparam name="TSource">The type of the elements of source.</typeparam>
        /// <typeparam name="TResult">The type of the result.</typeparam>
        /// <param name="source">A sequence of values to determine the minimum value of.</param>
        /// <param name="selector">A transform function to apply to each element.</param>
        /// <param name="defaultValue">The default value.</param>
        /// <returns>The minimum value in the sequence or default value if sequence is empty.</returns>
        public static TResult MinOrDefault<TSource, TResult>(this IEnumerable<TSource> source, Func<TSource, TResult> selector, TResult defaultValue)
        {
            return source.Any()
                ? source.Min(selector) ?? defaultValue
                : defaultValue;
        }

        /// <summary>
        /// Invokes a transform function on each element of a sequence and returns the maximum value 
        /// if the sequence is not empty; otherwise returns the specified default value. 
        /// </summary>
        /// <typeparam name="TSource">The type of the elements of source.</typeparam>
        /// <typeparam name="TResult">The type of the result.</typeparam>
        /// <param name="source">A sequence of values to determine the maximum value of.</param>
        /// <param name="selector">A transform function to apply to each element.</param>
        /// <param name="defaultValue">The default value.</param>
        /// <returns>The maximum value in the sequence or default value if sequence is empty.</returns>
        public static TResult MaxOrDefault<TSource, TResult>(this IEnumerable<TSource> source, Func<TSource, TResult> selector, TResult defaultValue)
        {
            return source.Any()
                ? source.Max(selector) ?? defaultValue
                : defaultValue;
        }

        /// <summary>
        /// Returns the maximum value of the sequence or default if empty
        /// </summary>
        public static TSource MaxOrDefault<TSource>(this IEnumerable<TSource> source, TSource defaultValue) 
        {
            return source.Any()
                ? source.Max() ?? defaultValue
                : defaultValue;
        }


        /// <summary>
        /// Return added values and removed values from difference of two IEnumerable
        /// </summary>
        /// <typeparam name="Tt"></typeparam>
        /// <param name="oldValue"></param>
        /// <param name="newValue"></param>
        /// <returns></returns>
        public static (IEnumerable<Tt> addedValues, IEnumerable<Tt> removedValues) GetListNewAndRemoved<Tt>(this object? oldValue, object? newValue)
        {
            // TODO: Alex, please review and simplify
            if (newValue == null)
                return (new List<Tt>(), oldValue != null ? ((IEnumerable<object>)oldValue).Cast<Tt>() : new List<Tt>());
            if (oldValue == null)
                return (((IEnumerable<object>)newValue).Cast<Tt>(), new List<Tt>());

            var newV = (IEnumerable<object>)newValue;
            var oldV = (IEnumerable<object>)oldValue;

            var addedValues = newV.Where(x => !oldV.Contains(x)).ToList<object>();
            var removedValues = oldV.Where(x => !newV.Contains(x)).ToList();

            return (addedValues.Cast<Tt>(), removedValues.Cast<Tt>());
        }

        /// <summary>
        /// Returns a sequence with the `null` instances removed.
        /// </summary>
        public static IEnumerable<T> WhereNotNull<T>(this IEnumerable<T?> source) where T : class
        {
            return source.Where(x => x != null).OfType<T>();
        }

        /// <summary>
        /// Returns a sequence of strings without nulls and empty strings
        /// </summary>
        /// <param name="source"></param>
        /// <returns></returns>
        public static IEnumerable<string> WhereNotNullOrWhiteSpace(this IEnumerable<string?> source) 
        {
            return source.Where(x => !string.IsNullOrWhiteSpace(x)).OfType<string>();
        }
    }
}
