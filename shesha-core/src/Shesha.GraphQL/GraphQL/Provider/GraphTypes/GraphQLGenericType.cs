using Abp.Domain.Uow;
using Abp.Threading;
using GraphQL;
using GraphQL.Types;
using NetTopologySuite.Geometries;
using NetTopologySuite.IO;
using Newtonsoft.Json;
using Shesha.Configuration.Runtime;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.DynamicEntities;
using Shesha.DynamicEntities.Cache;
using Shesha.Extensions;
using Shesha.Json;
using Shesha.JsonEntities;
using Shesha.Reflection;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;

namespace Shesha.GraphQL.Provider.GraphTypes
{
    /// <summary>
    /// https://github.com/fenomeno83/graphql-dotnet-auto-types
    /// </summary>
    public class GraphQLGenericType<TModel> : ObjectGraphType<TModel> where TModel : class
    {
        private readonly IDynamicPropertyManager _dynamicPropertyManager;
        private readonly IEntityConfigCache _entityConfigCache;
        private readonly IDynamicDtoTypeBuilder _dynamicDtoTypeBuilder;
        private readonly IUnitOfWorkManager _unitOfWorkManager;

        public GraphQLGenericType(IDynamicPropertyManager dynamicPropertyManager, IEntityConfigCache entityConfigCache, IDynamicDtoTypeBuilder dynamicDtoTypeBuilder, IUnitOfWorkManager unitOfWorkManager)
        {
            _dynamicPropertyManager = dynamicPropertyManager;
            _entityConfigCache = entityConfigCache;
            _dynamicDtoTypeBuilder = dynamicDtoTypeBuilder;
            _unitOfWorkManager = unitOfWorkManager;

            var genericType = typeof(TModel);

            Name = MakeName(typeof(TModel));

            var propsInfo = genericType.GetProperties(BindingFlags.Public | BindingFlags.Instance);

            if (propsInfo == null || propsInfo.Length == 0)
                throw new GraphQLSchemaException(genericType.Name, $"Unable to create generic GraphQL type from type {genericType.Name} because it has no properties");

            var properties = genericType.GetProperties(BindingFlags.Public | BindingFlags.Instance)
                .Where(p => p.PropertyType != typeof(Type))
                .ToList();
            foreach (var property in properties) 
            {
                EmitField(property);
                
                // for nested entities add raw Id property
                if (property.PropertyType.IsEntityType()) 
                {
                    var nestedEntityIdName = $"{property.Name}Id";

                    // skip if property already declared
                    if (!properties.Any(p => p.Name.Equals(nestedEntityIdName, StringComparison.InvariantCultureIgnoreCase)))
                    {
                        var idType = property.PropertyType.GetEntityIdType();

                        Field(nestedEntityIdName, GraphTypeMapper.GetGraphType(idType, isInput: false))
                            .Description($"Id of the {property.Name}")
                            .Resolve(context =>
                            {
                                var nestedEntity = property.GetValue(context.Source);
                                return nestedEntity?.GetId();
                            });
                    }
                }
            }

            // add dynamic properties
            if (typeof(TModel).IsEntityType()) 
            {
                var displayNameProperty = typeof(TModel).GetEntityConfiguration()?.DisplayNamePropertyInfo;

                    // add displayName
                    //FieldAsync(GraphTypeMapper.GetGraphType(typeof(string), isInput: false), EntityConstants.DisplayNameField, "Entity display name",
                    //    resolve: context => {
                    //        var value = displayNameProperty != null
                    //            ? displayNameProperty.GetValue(context.Source)
                    //            : "";
                    //        return Task.FromResult(value);
                    //    }
                    //);
                    Field(EntityConstants.DisplayNameField, GraphTypeMapper.GetGraphType(typeof(string), isInput: false))
                        .Description("Entity display name")
                        .Resolve(context => {
                            var value = displayNameProperty != null
                                ? displayNameProperty.GetValue(context.Source)
                                : "";
                            return value;
                        });

                    // add className
                    //    FieldAsync(GraphTypeMapper.GetGraphType(typeof(string), isInput: false), EntityConstants.ClassNameField, "Entity class name",
                    //    resolve: context => {
                    //        var type = context.Source != null
                    //            ? context.Source.GetType().StripCastleProxyType()
                    //            : typeof(TModel);

                    //        return Task.FromResult(type.FullName as object);
                    //    }
                    //);
                    Field(EntityConstants.ClassNameField, GraphTypeMapper.GetGraphType(typeof(string), isInput: false))
                        .Description("Entity class name")
                        .Resolve(context => {
                            var type = context.Source != null
                                ? context.Source.GetType().StripCastleProxyType()
                                : typeof(TModel);

                            return type.FullName;
                        });

                    AsyncHelper.RunSync(async () => {
                    using (var uow = _unitOfWorkManager.Begin())
                    {
                        var properties = await _entityConfigCache.GetEntityPropertiesAsync(typeof(TModel));
                        var dynamicProps = properties.Where(p => p.Source == Domain.Enums.MetadataSourceType.UserDefined).ToList();
                        foreach (var dynamicProp in dynamicProps)
                        {
                            var alreadyDeclared = properties.Any(p => p.Name.Equals(dynamicProp.Name, StringComparison.InvariantCultureIgnoreCase));
                            if (!alreadyDeclared) 
                            {
                                var propType = await _dynamicDtoTypeBuilder.GetDtoPropertyTypeAsync(dynamicProp, new DynamicDtoTypeBuildingContext());

                                    //FieldAsync(GraphTypeMapper.GetGraphType(propType, isInput: false), dynamicProp.Name, dynamicProp.Description,
                                    //    resolve: async context => {
                                    //        var value = await _dynamicPropertyManager.GetPropertyAsync(context.Source, dynamicProp.Name);
                                    //        return value;
                                    //    }
                                    //);
                                    Field(dynamicProp.Name, GraphTypeMapper.GetGraphType(propType, isInput: false))
                                        .Description(dynamicProp.Description)
                                        .ResolveAsync(async context => {
                                            var value = await _dynamicPropertyManager.GetPropertyAsync(context.Source, dynamicProp.Name);
                                            return value;
                                        });
                                }                            
                        }
                        await uow.CompleteAsync();
                    }
                });
            }
        }

        private static string MakeName(Type type)
        {
            if (type.IsAssignableToGenericType(typeof(IDictionary<,>)))
            {
                return "Dictionary";
            }

            return type.GetNamedType().Name;
        }

        private void EmitField(PropertyInfo propertyInfo)
        {
            if (propertyInfo.Name.Contains("Revision")) 
            { 
            }

            var isDictionary = propertyInfo.PropertyType.IsAssignableToGenericType(typeof(IDictionary<,>));
            var typeName = propertyInfo.PropertyType.Name;

            if (propertyInfo.PropertyType.IsJsonEntityType())
            {
                Field(propertyInfo.Name, GraphTypeMapper.GetGraphType(typeof(RawJson), isInput: false))
                    .Resolve(context => {
                        var jsonEntity = propertyInfo.GetValue(context.Source) as IJsonEntity;
                        return jsonEntity != null
                            ? new RawJson(jsonEntity)
                            : null;
                    });
                return;
            }

            if (propertyInfo.GetCustomAttribute<SaveAsJsonAttribute>() != null)
            {
                Field(propertyInfo.Name, GraphTypeMapper.GetGraphType(typeof(RawJson), isInput: false))
                    .Resolve(context => {
                        var jsonValue = propertyInfo.GetValue(context.Source);
                        return jsonValue != null
                            ? new RawJson(jsonValue)
                            : null;
                    });
                return;
            }

            if (typeof(Geometry).IsAssignableFrom(propertyInfo.PropertyType))
            {
                Field(propertyInfo.Name, GraphTypeMapper.GetGraphType(typeof(RawJson), isInput: false))
                    .Resolve(context => {
                        var geometry = propertyInfo.GetValue(context.Source) as Geometry;
                        if (geometry == null)
                            return null;

                        var serializer = GeoJsonSerializer.Create();
                        using (var stringWriter = new StringWriter())
                        {
                            using (var jsonWriter = new JsonTextWriter(stringWriter))
                            {
                                serializer.Serialize(jsonWriter, geometry);
                                var geoJson = stringWriter.ToString();
                                return new RawJson(new JsonString(geoJson));
                            }
                        }
                    });                    
                return;
            }

            if (ReflectionHelper.IsMultiValueReferenceListProperty(propertyInfo)) 
            {
                var gtn = typeof(Int64);
                var gqlListType = GraphTypeMapper.GetGraphType(gtn, isInput: false);
                var listType = typeof(ListGraphType<>).MakeGenericType(gqlListType);

                Field(propertyInfo.Name, listType)
                    .Resolve(context => {
                        var rawValue = propertyInfo.GetValue(context.Source);
                        var arrayValue = rawValue != null
                                    ? EntityExtensions.DecomposeIntoBitFlagComponents((Int64)System.Convert.ChangeType(rawValue, typeof(Int64)))
                                    : new Int64[0];

                        return arrayValue;
                    });
                return;
            }

            if (isDictionary || propertyInfo.PropertyType.Namespace != null && !propertyInfo.PropertyType.Namespace.StartsWith("System"))
            {
                if (propertyInfo.PropertyType.IsEnum)
                    Field(propertyInfo.Name, GraphTypeMapper.GetGraphType(propertyInfo.PropertyType, isInput: false)).Resolve(context => Convert.ToInt32(propertyInfo.GetValue(context.Source)));
                else
                {
                    var gqlType = Assembly.GetAssembly(typeof(ISchema)).GetTypes().FirstOrDefault(t => t.Name == $"{typeName}Type" && t.IsAssignableTo(typeof(IGraphType)));
                    
                    gqlType ??= isDictionary
                        ? MakeDictionaryType(propertyInfo)
                        : typeof(GraphQLGenericType<>).MakeGenericType(propertyInfo.PropertyType);

                    Field(propertyInfo.Name, gqlType);
                }
            }
            else
            {
                switch (typeName)
                {
                    case "List`1":
                    case "IList`1":
                    case "IEnumerable`1":
                    case "ICollection`1":
                        {
                            var gtn = propertyInfo.PropertyType.GetGenericArguments().First();
                            var gqlListType = GraphTypeMapper.GetGraphType(gtn, isInput: false);
                            var listType = typeof(ListGraphType<>).MakeGenericType(gqlListType);
                            Field(propertyInfo.Name, listType);
                            break;
                        }
                    case nameof(Byte): Field(propertyInfo.Name, GraphTypeMapper.GetGraphType(propertyInfo.PropertyType, isInput: false)).Resolve(context => Convert.ToInt32(propertyInfo.GetValue(context.Source))); break;

                    case "Nullable`1":
                        {
                            var underlyingType = Nullable.GetUnderlyingType(propertyInfo.PropertyType);
                            if (underlyingType.IsEnum)
                            {
                                Field(propertyInfo.Name, GraphTypeMapper.GetGraphType(underlyingType, isInput: false))
                                    .Resolve(context =>
                                    {
                                        var nullableEnum = propertyInfo.GetValue(context.Source);

                                        if (nullableEnum == null)
                                            return null;

                                        var numericValue = Convert.ChangeType(nullableEnum, typeof(Int64));
                                        return numericValue;
                                    });
                                break;
                            }
                            else
                            {
                                switch (underlyingType.Name)
                                {
                                    case nameof(Guid):
                                        Field(propertyInfo.Name, GraphTypeMapper.GetGraphType(underlyingType, isInput: false))
                                            .Resolve(context =>
                                            {
                                                var nullableGuid = propertyInfo.GetValue(context.Source) as Guid?;
                                                if (nullableGuid.HasValue) return nullableGuid.Value;
                                                else return null;
                                            });
                                        break;
                                    case nameof(Int32):
                                        Field(propertyInfo.Name, GraphTypeMapper.GetGraphType(underlyingType, isInput: false))
                                            .Resolve(context =>
                                            {
                                                var nullableGuid = propertyInfo.GetValue(context.Source) as int?;
                                                if (nullableGuid.HasValue) return nullableGuid.Value;
                                                else return null;
                                            });
                                        break;
                                    case nameof(Byte):
                                        Field(propertyInfo.Name, GraphTypeMapper.GetGraphType(underlyingType, isInput: false))
                                            .Resolve(context =>
                                            {
                                                var nullableGuid = propertyInfo.GetValue(context.Source) as byte?;
                                                if (nullableGuid.HasValue) return nullableGuid.Value;
                                                else return null;
                                            });
                                        break;
                                    case nameof(Int16):
                                        Field(propertyInfo.Name, GraphTypeMapper.GetGraphType(underlyingType, isInput: false))
                                            .Resolve(context =>
                                            {
                                                var nullableGuid = propertyInfo.GetValue(context.Source) as short?;
                                                if (nullableGuid.HasValue) return nullableGuid.Value;
                                                else return null;
                                            });
                                        break;
                                    case nameof(Int64):
                                        Field(propertyInfo.Name, GraphTypeMapper.GetGraphType(underlyingType, isInput: false))
                                            .Resolve(context =>
                                            {
                                                var nullableGuid = propertyInfo.GetValue(context.Source) as long?;
                                                if (nullableGuid.HasValue) return nullableGuid.Value;
                                                else return null;
                                            });
                                        break;
                                    case nameof(Double):
                                        Field(propertyInfo.Name, GraphTypeMapper.GetGraphType(underlyingType, isInput: false))
                                            .Resolve(context =>
                                            {
                                                var nullableGuid = propertyInfo.GetValue(context.Source) as double?;
                                                if (nullableGuid.HasValue) return nullableGuid.Value;
                                                else return null;
                                            });
                                        break;
                                    case nameof(Single):
                                        Field(propertyInfo.Name, GraphTypeMapper.GetGraphType(underlyingType, isInput: false))
                                            .Resolve(context =>
                                            {
                                                var nullableGuid = propertyInfo.GetValue(context.Source) as float?;
                                                if (nullableGuid.HasValue) return nullableGuid.Value;
                                                else return null;
                                            });
                                        break;
                                    case nameof(Boolean):
                                        Field(propertyInfo.Name, GraphTypeMapper.GetGraphType(underlyingType, isInput: false))
                                            .Resolve(context =>
                                            {
                                                var nullableGuid = propertyInfo.GetValue(context.Source) as bool?;
                                                if (nullableGuid.HasValue) return nullableGuid.Value;
                                                else return null;
                                            });
                                        break;
                                    case nameof(Decimal):
                                        Field(propertyInfo.Name, GraphTypeMapper.GetGraphType(underlyingType, isInput: false))
                                            .Resolve(context =>
                                            {
                                                var nullableGuid = propertyInfo.GetValue(context.Source) as decimal?;
                                                if (nullableGuid.HasValue) return nullableGuid.Value;
                                                else return null;
                                            });
                                        break;
                                    case nameof(DateTime):
                                        Field(propertyInfo.Name, GraphTypeMapper.GetGraphType(underlyingType, isInput: false))
                                            .Resolve(context =>
                                            {
                                                var nullableGuid = propertyInfo.GetValue(context.Source) as DateTime?;
                                                if (nullableGuid.HasValue) return nullableGuid.Value;
                                                else return null;
                                            });
                                        break;
                                    case nameof(TimeSpan):
                                        Field(propertyInfo.Name, GraphTypeMapper.GetGraphType(underlyingType, isInput: false))
                                            .Resolve(context =>
                                            {
                                                var nullableGuid = propertyInfo.GetValue(context.Source) as TimeSpan?;
                                                if (nullableGuid.HasValue) return nullableGuid.Value;
                                                else return null;
                                            });
                                        break;
                                }
                            }
                        }
                        break;
                    case nameof(String):
                    case nameof(Guid):
                    case nameof(Boolean):
                    case nameof(Int32):
                    case nameof(Int64):
                    case nameof(Int16):
                    case nameof(Single):
                    case nameof(Double):
                    case nameof(Decimal):
                    case nameof(DateTime):
                    default: 
                        {
                            Field(propertyInfo.Name, GraphTypeMapper.GetGraphType(propertyInfo.PropertyType, isInput: false)); 
                            break;
                        } 
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
