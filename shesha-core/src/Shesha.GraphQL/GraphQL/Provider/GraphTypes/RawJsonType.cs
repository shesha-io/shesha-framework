using Abp.Dependency;
using GraphQL.Types;
using GraphQLParser.AST;

namespace Shesha.GraphQL.Provider.GraphTypes
{
    /// <summary>
    /// The Raw Json scalar graph type represents a JSON string.
    /// By default <see cref="SchemaTypes"/> maps all <see cref="RawJson"/> .NET values to this scalar graph type.
    /// </summary>
    public class RawJsonType : ScalarGraphType, ITransientDependency
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
            RawJson _ => value,
            null => null,
            _ => ThrowValueConversionError(value)
        };

        /// <inheritdoc/>
        public override object? Serialize(object? value) => ParseValue(value) switch
        {
            RawJson raw => raw.Value,
            null => null,
            _ => ThrowSerializationError(value)
        };
    }
}
