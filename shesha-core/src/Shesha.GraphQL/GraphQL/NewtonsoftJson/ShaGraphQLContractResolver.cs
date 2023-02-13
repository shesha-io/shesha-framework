using GraphQL;
using GraphQL.Execution;
using GraphQL.NewtonsoftJson;
using GraphQL.Transport;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Generic;
using System.Reflection;

namespace Shesha.GraphQL.NewtonsoftJson
{
    /// <summary>
    /// An <see cref="IContractResolver"/> for GraphQL.NET.
    /// </summary>
    public class ShaGraphQLContractResolver : DefaultContractResolver
    {
        private readonly CamelCaseNamingStrategy _camelCase = new CamelCaseNamingStrategy();
        private readonly IErrorInfoProvider _errorInfoProvider;

        /// <summary>
        /// Initializes an instance with the specified <see cref="IErrorInfoProvider"/>.
        /// </summary>
        public ShaGraphQLContractResolver(IErrorInfoProvider errorInfoProvider)
        {
            _errorInfoProvider = errorInfoProvider ?? throw new ArgumentNullException(nameof(errorInfoProvider));
        }

        /// <inheritdoc/>
        protected override JsonConverter? ResolveContractConverter(Type objectType)
        {
            if (typeof(ExecutionResult).IsAssignableFrom(objectType))
                return new ExecutionResultJsonConverter(NamingStrategy);

            if (typeof(ExecutionError).IsAssignableFrom(objectType))
                return new ExecutionErrorJsonConverter(_errorInfoProvider);

            if (objectType == typeof(Inputs))
                return new InputsJsonConverter();

            if (objectType == typeof(GraphQLRequest))
                return new GraphQLRequestJsonConverter();

            if (/*GraphQLRequestListJsonConverter.*/CanConvertType(objectType))
                return new GraphQLRequestListJsonConverter();

            if (objectType == typeof(OperationMessage))
                return new OperationMessageJsonConverter();

            return base.ResolveContractConverter(objectType);
        }

        /// <inheritdoc/>
        protected override JsonProperty CreateProperty(MemberInfo member, MemberSerialization memberSerialization)
        {
            var property = base.CreateProperty(member, memberSerialization);
            /*
            if (property.DeclaringType == typeof(Instrumentation.ApolloTrace) || property.DeclaringType?.DeclaringType == typeof(Instrumentation.ApolloTrace))
            {
                property.PropertyName = _camelCase.GetPropertyName(member.Name, false);
            }
            */
            return property;
        }

        internal static bool CanConvertType(Type objectType)
        {
            return (
                objectType == typeof(IList<GraphQLRequest>) ||
                objectType == typeof(GraphQLRequest[]) ||
                objectType == typeof(IEnumerable<GraphQLRequest>) ||
                objectType == typeof(List<GraphQLRequest>) ||
                objectType == typeof(ICollection<GraphQLRequest>) ||
                objectType == typeof(IReadOnlyCollection<GraphQLRequest>) ||
                objectType == typeof(IReadOnlyList<GraphQLRequest>));
        }
    }
}
