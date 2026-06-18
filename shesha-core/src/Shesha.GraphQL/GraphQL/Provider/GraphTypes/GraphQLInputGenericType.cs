using GraphQL;
using GraphQL.Types;
using Shesha.GraphQL.Provider.AstValueNodes;
using Shesha.Reflection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace Shesha.GraphQL.Provider.GraphTypes
{
    /// <summary>
    /// https://github.com/fenomeno83/graphql-dotnet-auto-types
    /// </summary>
    public class GraphQLInputGenericType<T> : InputObjectGraphType<T> where T : class
    {
        private Dictionary<string, Type> PropertiesAstNodeType { get; } = new();

        public GraphQLInputGenericType()
        {
            var genericType = typeof(T);

            Name = MakeName(typeof(T));

            var propsInfo = genericType.GetProperties(BindingFlags.Public | BindingFlags.Instance);

            if (propsInfo == null || propsInfo.Length == 0)
                throw new GraphQLSchemaException(genericType.Name, $"Unable to create generic GraphQL type from type {genericType.Name} because it has no properties");

            var targetType =
                genericType.IsAssignableToGenericType(typeof(NonNullGraphType<>)) ||
                genericType.IsAssignableToGenericType(typeof(ListGraphType<>))
                    ? genericType.GetGenericArguments()[0]
                    : genericType;

            if (GraphTypeMapper.IsBuiltInScalar(targetType))
            {
                return;
            }

            targetType.GetProperties(BindingFlags.Public | BindingFlags.Instance)
                .ToList()
                .ForEach(pi =>
                {
                    EmitField(pi);
                    PropertiesAstNodeType[pi.Name] = AstNodeTypeHelper.ToAstValueNodeType(pi.PropertyType, true);
                });
        }

        private static string MakeName(Type type)
        {
            var name = type.GetNamedType().Name;

            return name.EndsWith("Input") ? name : $"{name}Input";
        }

        private void EmitField(PropertyInfo propertyInfo)
        {
            var isDictionary = propertyInfo.PropertyType.IsAssignableToGenericType(typeof(IDictionary<,>));
            var typeName = propertyInfo.PropertyType.Name;
            var propertyType = propertyInfo.PropertyType;
            if (isDictionary || propertyType.Namespace != null && !propertyType.Namespace.StartsWith("System"))
            {
                if (propertyType.IsEnum) {
                    Field(propertyInfo.Name, GraphTypeMapper.GetGraphType(propertyType, isInput: true));                    
                }                
                else
                {
                    var gqlType = Assembly.GetAssembly(typeof(ISchema)).GetTypes().FirstOrDefault(t => t.Name == $"{typeName}Type" && t.IsAssignableTo(typeof(IGraphType)));

                    gqlType ??= isDictionary
                        ? MakeDictionaryType(propertyInfo)
                        : typeof(GraphQLInputGenericType<>).MakeGenericType(propertyType);

                    Field(propertyInfo.Name, gqlType);                    
                }
            }
            else
            {
                if (propertyType.ImplementsGenericInterface(typeof(IList<>)))
                {
                    var gtn = propertyInfo.PropertyType.GetGenericArguments().First();
                    var gqlListType = GraphTypeMapper.GetGraphType(gtn, isInput: true);
                    var listType = typeof(ListGraphType<>).MakeGenericType(gqlListType);
                    Field(propertyInfo.Name, listType);
                } else 
                {
                    Field(propertyInfo.Name, GraphTypeMapper.GetGraphType(propertyInfo.PropertyType, isInput: true));
                }
            }
        }

        private Type MakeDictionaryType(PropertyInfo propertyInfo)
        {
            var dictType = propertyInfo.PropertyType.GetGenericTypeAssignableTo(typeof(IDictionary<,>));

            var args = dictType.GetGenericArguments();

            return typeof(DictionaryGraphType<,>).MakeGenericType(args[0], args[1]);
        }
    }
}
