using Abp.Domain.Entities;
using AutoMapper.Internal;
using Shesha.AutoMapper.Dto;
using Shesha.Domain;
using Shesha.DynamicEntities.Dtos;
using Shesha.Extensions;
using Shesha.JsonEntities.Proxy;
using Shesha.Reflection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities
{
    public static class EntityToDtoModelExtesions
    {
        public static Task<TDynamicDto> MapToCustomDynamicDtoAsync<TDynamicDto, TEntity, TPrimaryKey>(TEntity entity, IDynamicMappingSettings? settings = null)
            where TEntity : class, IEntity<TPrimaryKey>
            where TDynamicDto : class, IDynamicDto<TEntity, TPrimaryKey>
        {
            var modelType = typeof(TDynamicDto);
            var dto = ActivatorHelper.CreateNotNullInstance<TDynamicDto>();

            if (modelType.IsGenericType
                && modelType.GetGenericTypeDefinition() == typeof(DynamicDto<,>))
            {
                dto._jObject = ObjectToJsonExtension.GetJObjectFromObject(entity);
            }
            else
            {
                MapProps(entity, dto);
            }

            return Task.FromResult(dto);
        }

        public static void MapProps(object src, object dest)
        {
            var srcProps = src.GetType().GetProperties();
            var destProps = dest.GetType().GetProperties().Where(p => p.CanWrite && p.IsPublic());

            foreach (var destProp in destProps)
            {
                var srcProp = srcProps.FirstOrDefault(x => x.Name == destProp.Name);
                if (srcProp != null)
                {
                    var srcValue = srcProp.GetValue(src);
                    if (srcValue == null)
                    {
                        destProp.SetValue(dest, null, null);
                        continue;
                    }
                    if (srcProp.PropertyType.IsClass && !srcProp.PropertyType.IsEntityType() && !srcProp.PropertyType.IsSystemType())
                    {
                        // Nested object
                        var innerDest = ActivatorHelper.CreateNotNullObject(JsonEntityProxy.GetUnproxiedType(srcValue.GetType()));
                        MapProps(srcValue, innerDest);
                        destProp.SetValue(dest, innerDest, null);
                        continue;
                    }
                    if (srcProp.PropertyType.IsClass && srcProp.PropertyType.IsEntityType())
                    {
                        // Entity reference
                        if (destProp.PropertyType.IsClass && destProp.PropertyType.IsEntityType())
                        {
                            destProp.SetValue(dest, srcValue);
                            continue;
                        }
                        var id = srcValue.GetId();
                        if (destProp.PropertyType.GetGenericTypeDefinition() == typeof(EntityReferenceDto<>))
                        {
                            var idType = typeof(EntityReferenceDto<>).MakeGenericType(srcValue.GetType().GetRequiredProperty("Id").PropertyType);
                            var idWithName = Activator.CreateInstance(idType);
                            idType.GetRequiredProperty(nameof(EntityReferenceDto<int>.Id)).SetValue(idWithName, id);
                            idType.GetRequiredProperty(nameof(EntityReferenceDto<int>._displayName)).SetValue(idWithName, srcValue.GetEntityDisplayName());

                            destProp.SetValue(dest, idWithName);
                        }
                        else destProp.SetValue(dest, id);
                        continue;
                    }
                    if (MappingHelper.IsListType(destProp.PropertyType))
                    {
                        var gTypes = destProp.PropertyType.GenericTypeArguments;
                        var listType = typeof(List<>).MakeGenericType(gTypes);
                        var list = Activator.CreateInstance(listType, new object[] { srcValue });
                        destProp.SetValue(dest, list, null);
                        continue;
                    }
                    if (MappingHelper.IsDictionaryType(destProp.PropertyType))
                    {
                        var gTypes = destProp.PropertyType.GenericTypeArguments;
                        var dictionaryType = typeof(Dictionary<,>).MakeGenericType(gTypes);
                        var dictionary = Activator.CreateInstance(dictionaryType, new object[] { srcValue });
                        destProp.SetValue(dest, dictionary, null);
                        continue;
                    }

                    try
                    {
                        // Property
                        if (destProp.PropertyType == typeof(Int64?))
                            // workaround to convert int to Nullable<Int64>: Object of type 'System.Int32' cannot be converted to type 'System.Nullable`1[System.Int64]'
                            destProp.SetValue(dest, Convert.ChangeType(srcValue, typeof(long)));
                        else
                            destProp.SetValue(dest, srcValue);
                    }
                    catch(Exception)
                    {

                    }
                }
            }
        }
    }
}