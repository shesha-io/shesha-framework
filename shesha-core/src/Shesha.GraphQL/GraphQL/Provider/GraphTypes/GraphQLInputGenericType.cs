using GraphQL;
using GraphQL.Types;
using Shesha.GraphQL.Provider.AstValueNodes;
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
            if (isDictionary || propertyInfo.PropertyType.Namespace != null && !propertyInfo.PropertyType.Namespace.StartsWith("System"))
            {
                if (propertyInfo.PropertyType.IsEnum)
                    Field(GraphTypeMapper.GetGraphType(propertyInfo.PropertyType, isInput: true), propertyInfo.Name, resolve: context => Convert.ToInt32(propertyInfo.GetValue(context.Source)));
                else
                {
                    var gqlType = Assembly.GetAssembly(typeof(ISchema)).GetTypes().FirstOrDefault(t => t.Name == $"{typeName}Type" && t.IsAssignableTo(typeof(IGraphType)));

                    /*
                    gqlType ??= isDictionary
                        ? propertyInfo.PropertyType.IsAssignableTo<ExtraPropertyDictionary>()
                            ? typeof(AbpExtraPropertyGraphType)
                            : MakeDictionaryType(propertyInfo)
                        : typeof(GraphQLInputGenericType<>).MakeGenericType(propertyInfo.PropertyType);
                    */
                    gqlType ??= isDictionary
                        ? MakeDictionaryType(propertyInfo)
                        : typeof(GraphQLInputGenericType<>).MakeGenericType(propertyInfo.PropertyType);

                    Field(gqlType, propertyInfo.Name);
                }
            }
            else
            {
                switch (typeName)
                {
                    case "List`1":
                        {
                            var gtn = propertyInfo.PropertyType.GetGenericArguments().First();
                            var gqlListType = GraphTypeMapper.GetGraphType(gtn, isInput: true);
                            var listType = typeof(ListGraphType<>).MakeGenericType(gqlListType);
                            Field(listType, propertyInfo.Name);
                            break;
                        }
                    case nameof(Int32): Field(GraphTypeMapper.GetGraphType(propertyInfo.PropertyType, isInput: true), propertyInfo.Name); break;
                    case nameof(Int64): Field(GraphTypeMapper.GetGraphType(propertyInfo.PropertyType, isInput: true), propertyInfo.Name); break;
                    case nameof(Int16): Field(GraphTypeMapper.GetGraphType(propertyInfo.PropertyType, isInput: true), propertyInfo.Name); break;
                    case nameof(Single): Field(GraphTypeMapper.GetGraphType(propertyInfo.PropertyType, isInput: true), propertyInfo.Name); break;
                    case nameof(Double): Field(GraphTypeMapper.GetGraphType(propertyInfo.PropertyType, isInput: true), propertyInfo.Name); break;
                    case nameof(Decimal): Field(GraphTypeMapper.GetGraphType(propertyInfo.PropertyType, isInput: true), propertyInfo.Name); break;
                    case nameof(Boolean): Field(GraphTypeMapper.GetGraphType(propertyInfo.PropertyType, isInput: true), propertyInfo.Name); break;
                    case nameof(Byte):
                        Field(GraphTypeMapper.GetGraphType(propertyInfo.PropertyType, isInput: true), propertyInfo.Name, resolve: context =>
                        {
                            return Convert.ToInt32(propertyInfo.GetValue(context.Source));
                        }); break;
                    case nameof(DateTime): Field(GraphTypeMapper.GetGraphType(propertyInfo.PropertyType, isInput: true), propertyInfo.Name, resolve: context => propertyInfo.GetValue(context.Source)); break;
                    case "Nullable`1":
                        {
                            var underlyingType = Nullable.GetUnderlyingType(propertyInfo.PropertyType);
                            if (underlyingType.IsEnum)
                            {
                                Field(GraphTypeMapper.GetGraphType(underlyingType, isInput: true), propertyInfo.Name, resolve: context =>
                                {
                                    var nullableEnum = propertyInfo.GetValue(context.Source);
                                    if (nullableEnum != null) return (int)nullableEnum;
                                    else return null;
                                });
                            }
                            else
                            {
                                switch (underlyingType.Name)
                                {
                                    case nameof(Int32):
                                        Field(GraphTypeMapper.GetGraphType(underlyingType, isInput: true), propertyInfo.Name, resolve: context =>
                                        {
                                            var nullableInt = propertyInfo.GetValue(context.Source) as int?;
                                            if (nullableInt.HasValue) return nullableInt.Value;
                                            else return null;
                                        }); break;
                                    case nameof(Byte):
                                        Field(GraphTypeMapper.GetGraphType(underlyingType, isInput: true), propertyInfo.Name, resolve: context =>
                                        {
                                            var nullableByte = propertyInfo.GetValue(context.Source) as byte?;
                                            if (nullableByte.HasValue) return nullableByte.Value;
                                            else return null;
                                        }); break;
                                    case nameof(Int16):
                                        Field(GraphTypeMapper.GetGraphType(underlyingType, isInput: true), propertyInfo.Name, resolve: context =>
                                        {
                                            var nullableShort = propertyInfo.GetValue(context.Source) as short?;
                                            if (nullableShort.HasValue) return nullableShort.Value;
                                            else return null;
                                        }); break;
                                    case nameof(Int64):
                                        Field(GraphTypeMapper.GetGraphType(underlyingType, isInput: true), propertyInfo.Name, resolve: context =>
                                        {
                                            var nullableLong = propertyInfo.GetValue(context.Source) as long?;
                                            if (nullableLong.HasValue) return nullableLong.Value;
                                            else return null;
                                        }); break;
                                    case nameof(Double):
                                        Field(GraphTypeMapper.GetGraphType(underlyingType, isInput: true), propertyInfo.Name, resolve: context =>
                                        {
                                            var nullableDouble = propertyInfo.GetValue(context.Source) as double?;
                                            if (nullableDouble.HasValue) return nullableDouble.Value;
                                            else return null;
                                        }); break;
                                    case nameof(Single):
                                        Field(GraphTypeMapper.GetGraphType(underlyingType, isInput: true), propertyInfo.Name, resolve: context =>
                                        {
                                            var nullableSingle = propertyInfo.GetValue(context.Source) as float?;
                                            if (nullableSingle.HasValue) return nullableSingle.Value;
                                            else return null;
                                        }); break;
                                    case nameof(Boolean):
                                        Field(GraphTypeMapper.GetGraphType(underlyingType, isInput: true), propertyInfo.Name, resolve: context =>
                                        {
                                            var nullableBoolean = propertyInfo.GetValue(context.Source) as bool?;
                                            if (nullableBoolean.HasValue) return nullableBoolean.Value;
                                            else return null;
                                        }); break;
                                    case nameof(Decimal):
                                        Field(GraphTypeMapper.GetGraphType(underlyingType, isInput: true), propertyInfo.Name, resolve: context =>
                                        {
                                            var nullableDecimal = propertyInfo.GetValue(context.Source) as decimal?;
                                            if (nullableDecimal.HasValue) return nullableDecimal.Value;
                                            else return null;
                                        }); break;
                                    case nameof(DateTime):
                                        Field(GraphTypeMapper.GetGraphType(underlyingType, isInput: true), propertyInfo.Name, resolve: context =>
                                        {
                                            var nullableDateTime = propertyInfo.GetValue(context.Source) as DateTime?;
                                            if (nullableDateTime.HasValue) return nullableDateTime.Value;
                                            else return null;
                                        }); break;
                                }
                            }
                        }
                        break;
                    case nameof(String):
                    default: Field(GraphTypeMapper.GetGraphType(propertyInfo.PropertyType, isInput: true), propertyInfo.Name); break;
                }
            }
        }

        /*
        public override GraphQLValue ToAST(object value)
        {
            if (value == null)
            {
                return new GraphQLNullValue();
            }

            var fields = new List<GraphQLObjectField>();

            foreach (var propertyInfo in value.GetType().GetProperties())
            {
                var propertyValue = propertyInfo.GetValue(value);

                if (propertyValue is not null)
                {
                    fields.Add(new GraphQLObjectField(propertyInfo.Name,
                        (GraphQLValue)Activator.CreateInstance(PropertiesAstNodeType[propertyInfo.Name], propertyValue)));
                }
                else
                {
                    fields.Add(new GraphQLObjectField() { Name = new GraphQLName(propertyInfo.Name), Value = new GraphQLNullValue() });
                }
            }

            return new GraphQLObjectField(fields);
        }
        */

        private Type MakeDictionaryType(PropertyInfo propertyInfo)
        {
            var dictType = propertyInfo.PropertyType.GetGenericTypeAssignableTo(typeof(IDictionary<,>));

            var args = dictType.GetGenericArguments();

            return typeof(DictionaryGraphType<,>).MakeGenericType(args[0], args[1]);
        }
    }
}
