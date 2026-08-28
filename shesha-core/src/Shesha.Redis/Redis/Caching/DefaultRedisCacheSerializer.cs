using Abp.Dependency;
using Abp.Json;
using Abp.Runtime.Caching;
using Newtonsoft.Json;
using StackExchange.Redis;
using System.Collections.Concurrent;

namespace Shesha.Redis.Caching
{
    /// <summary>
    ///     Default implementation uses JSON as the underlying persistence mechanism.
    /// </summary>
    public class DefaultRedisCacheSerializer : IRedisCacheSerializer, ITransientDependency
    {
        /// <summary>
        /// Built once rather than per call. Newtonsoft falls back to a shared contract resolver when
        /// none is set, so the contract cache was never the problem; the waste was allocating a
        /// settings object and a converter on every single cache read.
        /// </summary>
        private static readonly JsonSerializerSettings SerializerSettings = CreateSerializerSettings();

        /// <summary>
        /// Assembly-qualified type name -> resolved type.
        ///
        /// Every deserialize used to re-resolve the type name through <see cref="System.Type.GetType(string, bool, bool)"/>
        /// with <c>ignoreCase: true</c>, which forces the runtime down a slower case-insensitive
        /// lookup. Names come from <see cref="AbpCacheData.Type"/> and are written by
        /// <see cref="System.Type.AssemblyQualifiedName"/>, so they are already correctly cased.
        /// </summary>
        private static readonly ConcurrentDictionary<string, Type> TypeCache = new();

        private static JsonSerializerSettings CreateSerializerSettings()
        {
            var settings = new JsonSerializerSettings();
            settings.Converters.Insert(0, new AbpDateTimeConverter());
            return settings;
        }

        /// <summary>
        /// Resolves (and memoizes) a type from its assembly-qualified name.
        /// </summary>
        /// <exception cref="TypeLoadException">The type could not be resolved.</exception>
        protected static Type ResolveType(string typeName)
        {
            return TypeCache.GetOrAdd(typeName, static name => Type.GetType(name, throwOnError: true, ignoreCase: false)
                ?? throw new TypeLoadException($"Failed to resolve cached type '{name}'."));
        }

        /// <summary>
        ///     Creates an instance of the object from its serialized string representation.
        /// </summary>
        /// <param name="objbyte">String representation of the object from the Redis server.</param>
        /// <returns>Returns a newly constructed object.</returns>
        /// <seealso cref="IRedisCacheSerializer{TSource, TDestination}.Serialize" />
        public virtual object Deserialize(RedisValue objbyte)
        {
            var cacheData = AbpCacheData.Deserialize(objbyte);

            return cacheData.Payload.FromJsonString(
                ResolveType(cacheData.Type),
                SerializerSettings);
        }

        /// <summary>
        ///     Produce a string representation of the supplied object.
        /// </summary>
        /// <param name="value">Instance to serialize.</param>
        /// <param name="type">Type of the object.</param>
        /// <returns>Returns a string representing the object instance that can be placed into the Redis cache.</returns>
        /// <seealso cref="IRedisCacheSerializer{TSource, TDestination}.Deserialize" />
        public virtual RedisValue Serialize(object value, Type type)
        {
            var json = AbpCacheData.Serialize(value);
            return JsonConvert.SerializeObject(json);
        }
    }
}
