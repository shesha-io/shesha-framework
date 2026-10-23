using System;

namespace Shesha.GraphQL.Provider.GraphTypes
{
    /// <summary>
    /// https://github.com/fenomeno83/graphql-dotnet-auto-types
    /// </summary>
    public class GraphQLSchemaException : ApplicationException
    {
        string? _genericTypeName = null;

        public GraphQLSchemaException(string genericTypeName, string message) : base(message: message) 
        {
            _genericTypeName = genericTypeName;
        }

        public string? GenericTypeName => _genericTypeName;
    }
}
