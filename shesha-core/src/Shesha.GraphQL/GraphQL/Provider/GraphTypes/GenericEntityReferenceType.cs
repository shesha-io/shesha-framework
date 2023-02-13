using Abp.Dependency;
using GraphQL.Types;
using GraphQLParser.AST;
using Shesha.EntityReferences;

namespace Shesha.GraphQL.Provider.GraphTypes
{
    /// <summary>
    /// The GenericEntityReferenceType scalar graph type represents a GenericEntityReference.
    /// </summary>
    public class GenericEntityReferenceType : ScalarGraphType, ITransientDependency
    {
        /// <inheritdoc/>
        public override object? ParseLiteral(GraphQLValue value) => value switch
        {
            GraphQLStringValue s => new RawJson((string)s.Value), //ISSUE:allocation
            GraphQLNullValue _ => null,
            _ => ThrowLiteralConversionError(value)
        };

        /// <inheritdoc/>
        public override object? ParseValue(object? value) => value switch
        {
            string s => new RawJson(s),
            GenericEntityReference _ => value,
            null => null,
            _ => ThrowValueConversionError(value)
        };

        /// <inheritdoc/>
        public override object? Serialize(object? value) => ParseValue(value) switch
        {
            GenericEntityReference reference => reference,
            null => null,
            _ => ThrowSerializationError(value)
        };
    }
}
