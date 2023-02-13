using System;

namespace Shesha.GraphQL.Provider.GraphTypes
{
    /// <summary>
    /// https://github.com/fenomeno83/graphql-dotnet-auto-types
    /// </summary>
    public class GraphQLSchemaException : ApplicationException
    {
        string _genericTypeName = null;

        public GraphQLSchemaException() : base() { }
        public GraphQLSchemaException(string genericTypeName) : base() { }
        public GraphQLSchemaException(string genericTypeName, string message) : base(message: message) { }
        public GraphQLSchemaException(string genericTypeName, string message, Exception innerException) : base(message: message, innerException: innerException) { }

        public string GenericTypeName => _genericTypeName;
    }
}
