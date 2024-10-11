using System;
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
    }
}
