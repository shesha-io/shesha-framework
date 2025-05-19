using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.Extensions
{
    /// <summary>
    /// Dictionary extensions
    /// </summary>
    public static class DictionaryExtensions
    {
        /// <summary>
        /// Gets an item from the dictionary. Uses the factory method to get the object if key is missing in the dictionary.
        /// </summary>
        /// <typeparam name="TKey"></typeparam>
        /// <typeparam name="TValue"></typeparam>
        /// <param name="dictionary">Dictionary</param>
        /// <param name="key">Key to search for</param>
        /// <param name="factory">Factory method to create item if not exists</param>
        /// <returns>Existing item or item created by <paramref name="factory"/></returns>
        public static async Task<TValue> GetAsync<TKey, TValue>(this IDictionary<TKey, TValue> dictionary, TKey key, Func<TKey, Task<TValue>> factory) 
        {
            if (dictionary.TryGetValue(key, out var value))
                return value;

            value = await factory(key);
            dictionary.Add(key, value);
            return value;
        }

        /// <summary>
        /// Gets an item from the dictionary. Uses the factory method to get the object if key is missing in the dictionary.
        /// </summary>
        /// <typeparam name="TKey"></typeparam>
        /// <typeparam name="TValue"></typeparam>
        /// <param name="dictionary">Dictionary</param>
        /// <param name="key">Key to search for</param>
        /// <param name="factory">Factory method to create item if not exists</param>
        /// <returns>Existing item or item created by <paramref name="factory"/></returns>
        public static TValue Get<TKey, TValue>(this IDictionary<TKey, TValue> dictionary, TKey key, Func<TKey, TValue> factory)
        {
            if (dictionary.TryGetValue(key, out var value))
                return value;

            value = factory(key);
            dictionary.Add(key, value);
            return value;
        }
    }
}
