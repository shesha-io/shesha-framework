using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;

namespace Abp
{
    /// <summary>
    /// Extension methods for Collections.
    /// </summary>
    public static class CollectionExtensions
    {
        /// <summary>
        /// Checks whatever given collection object is null or has no item.
        /// </summary>
        public static bool IsNullOrEmpty<T>([NotNullWhen(false)] this ICollection<T>? source)
        {
            return source == null || source.Count <= 0;
        }

        public static bool IsNullOrEmpty([NotNullWhen(false)] this IEnumerable? @this)
        {
            return @this == null || @this.GetEnumerator().MoveNext() == false;
        }
    }
}
