using System;
using System.Collections.Generic;

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
    }
}
