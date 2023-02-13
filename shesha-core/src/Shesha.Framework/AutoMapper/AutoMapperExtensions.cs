using Abp.Domain.Entities;
using AutoMapper;
using Shesha.AutoMapper.Dto;
using Shesha.Domain;
using Shesha.Reflection;
using Shesha.Services;
using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Reflection;

namespace Shesha.AutoMapper
{
    public static class AutoMapperExtensions
    {
        public static IMappingExpression<TSource, TDestination> IgnoreNotMapped<TSource, TDestination>(
               this IMappingExpression<TSource, TDestination> expression)
        {
            var sourceType = typeof(TSource);

            foreach (var property in sourceType.GetProperties())
            {
                if (property.HasAttribute<NotMappedAttribute>())
                    expression.ForMember(property.Name, opt => opt.Ignore());
            }

            return expression;
        }

        public static IMappingExpression<TSource, TDestination> IgnoreDestinationChildEntities<TSource, TDestination>(
            this IMappingExpression<TSource, TDestination> expression)
        {
            var destinationType = typeof(TDestination);

            foreach (var property in destinationType.GetProperties())
            {
                if (typeof(IEntity).IsAssignableFrom(property.PropertyType))
                    expression.ForMember(property.Name, opt => opt.Ignore());
            }
            return expression;
        }

        public static IMappingExpression<TSource, TDestination> IgnoreDestinationChildEntityLists<TSource, TDestination>(
            this IMappingExpression<TSource, TDestination> expression)
        {
            var destinationType = typeof(TDestination);

            foreach (var property in destinationType.GetProperties())
            {
                if (property.PropertyType.IsSubtypeOfGeneric(typeof(IList<>)))
                {
                    var genericArgument = property.PropertyType.GenericTypeArguments.FirstOrDefault();

                    if (genericArgument?.GetInterfaces().Contains(typeof(IEntity)) == true)
                        expression.ForMember(property.Name, opt => opt.Ignore());
                }
            }
            return expression;
        }

        public static IMappingExpression<TSource, TDestination> IgnoreChildEntities<TSource, TDestination>(
            this IMappingExpression<TSource, TDestination> expression)
        {
            var sourceType = typeof(TSource);
            var destinationType = typeof(TDestination);

            foreach (var property in sourceType.GetProperties())
            {
                if (typeof(IEntity).IsAssignableFrom(property.PropertyType) && destinationType.GetProperty(property.Name) != null)
                {
                    expression.ForMember(property.Name, opt => opt.Ignore());
                }
            }
            return expression;
        }

        public static IMappingExpression<TSource, TDestination> IgnoreChildEntityLists<TSource, TDestination>(
               this IMappingExpression<TSource, TDestination> expression)
        {
            var sourceType = typeof(TSource);

            foreach (var property in sourceType.GetProperties())
            {
                if (property.PropertyType.IsSubtypeOfGeneric(typeof(IList<>)))
                {
                    var genericArgument = property.PropertyType.GenericTypeArguments.FirstOrDefault();

                    if (genericArgument?.GetInterfaces().Contains(typeof(IEntity)) == true)
                        expression.ForMember(property.Name, opt => opt.Ignore());
                }
            }
            return expression;
        }

        /// <summary>
        /// Maps all reference list properties of the source type to <see cref="ReferenceListItemValueDto"/> of the destination type
        /// </summary>
        /// <typeparam name="TSource"></typeparam>
        /// <typeparam name="TDestination"></typeparam>
        /// <param name="expression"></param>
        /// <returns></returns>
        public static IMappingExpression<TSource, TDestination> MapReferenceListValuesToDto<TSource, TDestination>(
            this IMappingExpression<TSource, TDestination> expression)
        {
            var sourceType = typeof(TSource);
            var destinationType = typeof(TDestination);

            var refListProperties = destinationType.GetProperties().Where(p => p.PropertyType == typeof(ReferenceListItemValueDto))
                .Select(d =>
                    {
                        var source = sourceType.GetProperty(d.Name);
                        return new
                        {
                            DstProperty = d,
                            SrcProperty = source,
                            RefListIdentifier = source?.GetReferenceListIdentifierOrNull()
                        };
                    }
                )
                .Where(i => i.RefListIdentifier != null)
                .ToList();

            foreach (var item in refListProperties)
            {
                expression.ForMember(item.DstProperty.Name, m => m.MapFrom(e => e != null
                    ? GetRefListItemValueDto(item.RefListIdentifier.Module, item.RefListIdentifier.Name, item.SrcProperty.GetValue(e))
                    : null));
            }

            return expression;
        }

        private static ReferenceListItemValueDto GetRefListItemValueDto(string refListModule, string refListName, object value)
        {
            var intValue = value != null
                ? Convert.ToInt64(value)
                : (Int64?)null;

            return intValue != null
                ? new ReferenceListItemValueDto
                {
                    ItemValue = intValue.Value,
                    Item = GetRefListItemText(refListModule, refListName, intValue.Value)
                }
                : null;
        }

        private static string GetRefListItemText(string refListModule, string refListName, Int64? value)
        {
            if (value == null)
                return null;
            var helper = StaticContext.IocManager.Resolve<IReferenceListHelper>();
            return helper.GetItemDisplayText(new ReferenceListIdentifier(refListModule, refListName), value);
        }

        /// <summary>
        /// Maps all <see cref="ReferenceListItemValueDto"/> properties of the source type to reference list values in the destination type
        /// </summary>
        /// <typeparam name="TSource"></typeparam>
        /// <typeparam name="TDestination"></typeparam>
        /// <param name="expression"></param>
        /// <returns></returns>
        public static IMappingExpression<TSource, TDestination> MapReferenceListValuesFromDto<TSource, TDestination>(
            this IMappingExpression<TSource, TDestination> expression)
        {
            var sourceType = typeof(TSource);
            var destinationType = typeof(TDestination);

            var refListProperties = sourceType.GetProperties().Where(p => p.PropertyType == typeof(ReferenceListItemValueDto))
                .Select(p =>
                    {
                        var destination = destinationType.GetProperty(p.Name);

                        var propType = destination?.PropertyType.GetUnderlyingTypeIfNullable();
                        if (propType == null || propType != typeof(int) && !propType.IsEnum)
                            return null;

                        return new
                        {
                            DstProperty = destination,
                            SrcProperty = p,
                            PropType = propType
                        };
                    }
                )
                .Where(i => i != null)
                .ToList();
            
            foreach (var item in refListProperties)
            {
                expression.ForMember(item.DstProperty.Name, m => m.MapFrom(e => e != null ? GetRefListItemValue(item.SrcProperty.GetValue(e) as ReferenceListItemValueDto, item.SrcProperty.PropertyType, item.DstProperty.PropertyType) : null));
            }

            return expression;
        }

        /// <summary>
        /// Map multivalue reference list values from a singe value to decomposed list
        /// </summary>
        public static IMappingExpression MapMultiValueReferenceListValuesToDto(
            this IMappingExpression expression, Type sourceType, Type destinationType)
        {
            var multiValueRefListProperties = sourceType.GetProperties().Where(p => p.IsMultiValueReferenceListProperty())
                .Select(p =>
                {
                    var destinationProperty = destinationType.GetProperty(p.Name);

                    var propType = destinationProperty?.PropertyType.GetUnderlyingTypeIfNullable();
                    if (propType == null || !propType.IsSubtypeOfGeneric(typeof(List<>)))
                        return null;

                    var itemType = propType.GetGenericArguments().FirstOrDefault();
                    if (itemType != typeof(Int64) && itemType != typeof(Int64?))
                        return null;

                    return new
                    {
                        DstProperty = destinationProperty,
                        SrcProperty = p,
                        ItemType = itemType,
                    };
                }
                )
                .Where(i => i != null)
                .ToList();

            foreach (var item in multiValueRefListProperties)
            {
                expression.ForMember(item.DstProperty.Name, m => m.MapFrom(e => GetDecomposedMultiValueRefListValue(e, item.SrcProperty, item.ItemType)));
            }

            return expression;
        }

        private static object GetDecomposedMultiValueRefListValue(object owner, PropertyInfo property, Type itemType)
        {
            var rawValue = owner != null
                ? property.GetValue(owner)
                : null;

            var intVal = rawValue != null
                ? Convert.ToInt64(rawValue)
                : (Int64?)null;

            if (intVal == null)
            {
                var resultType = typeof(List<>).MakeGenericType(itemType);
                return Activator.CreateInstance(resultType);
            }

            return Shesha.Extensions.EntityExtensions.DecomposeIntoBitFlagComponents(intVal);
        }


        /// <summary>
        /// Map multivalue reference list values from decomposed list to a single value
        /// </summary>
        public static IMappingExpression MapMultiValueReferenceListValuesFromDto(
            this IMappingExpression expression, Type sourceType, Type destinationType)
        {
            var multiValueRefListProperties = destinationType.GetProperties().Where(p => p.IsMultiValueReferenceListProperty())
                .Select(p =>
                {
                    var sourceProperty = sourceType.GetProperty(p.Name);

                    var propType = sourceProperty?.PropertyType.GetUnderlyingTypeIfNullable();
                    if (propType == null || !propType.IsSubtypeOfGeneric(typeof(List<>)))
                        return null;

                    var itemType = propType.GetGenericArguments().FirstOrDefault();
                    if (itemType != typeof(Int64) && itemType != typeof(Int64?))
                        return null;

                    return new
                    {
                        DstProperty = p,
                        SrcProperty = sourceProperty,
                        SourceItemType = itemType,
                    };
                }
                )
                .Where(i => i != null)
                .ToList();

            foreach (var item in multiValueRefListProperties)
            {
                expression.ForMember(item.DstProperty.Name, m => m.MapFrom(e => GetMultiValueRefListValue(e, item.SrcProperty, item.DstProperty)));
            }

            return expression;
        }

        private static object GetMultiValueRefListValue(object owner, PropertyInfo srcProperty, PropertyInfo dstProperty)
        {
            var listValue = owner != null
                ? srcProperty.GetValue(owner)
                : null;

            if (listValue is IList list)
            {
                Int64 value = 0;
                foreach (var item in list) 
                {
                    var intValue = item as Int64?;

                    if (intValue == null)
                        continue;

                    value = value | intValue.Value;
                }
                return value;
            }

            return null;
        }

        private static object GetRefListItemValue(ReferenceListItemValueDto dto, Type srcPropType, Type dstPropType)
        {
            if (dto?.ItemValue == null)
                return null;

            if (srcPropType.IsEnum)
                return Enum.ToObject(srcPropType, dto.ItemValue);

            var dstType = dstPropType.GetUnderlyingTypeIfNullable();

            if (dstType.IsEnum) {
                var enumUnderlayingType = dstType.GetEnumUnderlyingType();
                var numericValue = System.Convert.ChangeType(dto.ItemValue.Value, enumUnderlayingType);
                return Enum.ToObject(dstType, numericValue);
            }
                        
            return System.Convert.ChangeType(dto.ItemValue.Value, dstType);
        }
    }
}
