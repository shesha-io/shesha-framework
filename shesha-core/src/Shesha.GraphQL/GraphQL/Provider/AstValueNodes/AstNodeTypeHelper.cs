using GraphQLParser.AST;
using Shesha.Reflection;
using System;
using System.Collections.Generic;
using System.Numerics;

namespace Shesha.GraphQL.Provider.AstValueNodes
{
    public static class AstNodeTypeHelper
    {
        public static Type ToAstValueNodeType(Type type, bool useTypeInNullable)
        {
            var targetType = useTypeInNullable ? type.GetFirstGenericArgumentIfNullable() : type;

            if (targetType.ImplementsGenericInterface(typeof(IList<>)))
                return typeof(GraphQLListValue);

            if (targetType.IsEnum)
                return typeof(GraphQLEnumValue);

            switch (targetType.Name)
            {
                case nameof(Enum): return typeof(GraphQLEnumValue);
                case nameof(Int16): return typeof(GraphQLIntValue);
                case nameof(Int32): return typeof(GraphQLIntValue);
                case nameof(Int64): return typeof(GraphQLIntValue);
                case nameof(BigInteger): return typeof(GraphQLIntValue);

                case nameof(Boolean): return typeof(GraphQLBooleanValue);
                case nameof(Double): return typeof(GraphQLFloatValue);
                case nameof(Single): return typeof(GraphQLFloatValue);
                case nameof(Decimal): return typeof(GraphQLFloatValue);

                case nameof(String): return typeof(GraphQLStringValue);
                default: return typeof(GraphQLObjectValue);
            }
        }

    }
}
