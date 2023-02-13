using System;
using System.Numerics;
using GraphQLParser.AST;

namespace Shesha.GraphQL.Provider.AstValueNodes
{
    public static class AstNodeTypeHelper
    {
        public static Type ToAstValueNodeType(Type type, bool useTypeInNullable)
        {
            var targetType = useTypeInNullable ? type.GetFirstGenericArgumentIfNullable() : type;

            if (targetType.Name == "List`1")
            {
                return typeof(GraphQLListValue);
            }

            if (targetType.IsEnum)
            {
                return typeof(GraphQLEnumValue);
            }

            switch (targetType.Name)
            {
                case nameof(Enum): return typeof(GraphQLEnumValue);
                //case nameof(Byte): return typeof(ByteValue); /**/
                case nameof(Int16): return typeof(GraphQLIntValue); /**/
                case nameof(Int32): return typeof(GraphQLIntValue);
                case nameof(Int64): return typeof(GraphQLIntValue);
                case nameof(BigInteger): return typeof(GraphQLIntValue);

                case nameof(Boolean): return typeof(GraphQLBooleanValue);
                //case nameof(DateTime): return typeof(DateTimeValue);
                case nameof(Double): return typeof(GraphQLFloatValue);
                case nameof(Single): return typeof(GraphQLFloatValue);
                case nameof(Decimal): return typeof(GraphQLFloatValue);
                //case nameof(Guid): return typeof(GraphQLGui);

                case nameof(String): return typeof(GraphQLStringValue);
                default: return typeof(GraphQLObjectValue);
            }
        }

    }
}
