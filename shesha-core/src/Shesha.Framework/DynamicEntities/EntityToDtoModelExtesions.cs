using Abp.Domain.Entities;
using AutoMapper.Internal;
using Castle.DynamicProxy;
using Newtonsoft.Json.Linq;
using Shesha.AutoMapper.Dto;
using Shesha.Domain;
using Shesha.DynamicEntities.Dtos;
using Shesha.Extensions;
using Shesha.JsonEntities.Proxy;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities
{
    public static class EntityToDtoModelExtesions
    {
        public static async Task<TDynamicDto> MapToCustomDynamicDtoAsync<TDynamicDto, TEntity, TPrimaryKey>(TEntity entity, IDynamicMappingSettings settings = null)
            where TEntity : class, IEntity<TPrimaryKey>
            where TDynamicDto : class, IDynamicDto<TEntity, TPrimaryKey>
        {
            var modelType = typeof(TDynamicDto);
            TDynamicDto dto = null;

            if (modelType.IsGenericType
                && modelType.GetGenericTypeDefinition() == typeof(DynamicDto<,>))
            {
                // AS - disabled because DynamicDtoConverter allows to improve performance

                // build dto type
                //var context = new DynamicDtoTypeBuildingContext()
                //{
                //    ModelType = modelType,
                //    UseDtoForEntityReferences = settings?.UseDtoForEntityReferences ?? false
                //};

                //var dtoBuilder = StaticContext.IocManager.Resolve<IDynamicDtoTypeBuilder>();
                //var dtoType = await dtoBuilder.BuildDtoFullProxyTypeAsync(context.ModelType, context);

                //dto = (TDynamicDto)Activator.CreateInstance(dtoType);
                //MapProps(entity, dto);

                // AS - Should only be used with a DynamicDtoConverter
                dto = (TDynamicDto)Activator.CreateInstance(modelType);
                dto._jObject = ObjectToJsonExtension.GetJObjectFromObject(entity);
            }
            else
            {
                dto = (TDynamicDto)Activator.CreateInstance(modelType);
                MapProps(entity, dto);
            }

            return dto;
        }

        public static void MapProps(object src, object dest)
        {
            var srcProps = src.GetType().GetProperties();
            var destProps = dest.GetType().GetProperties().Where(p => p.CanWrite && p.IsPublic());

            foreach (var destProp in destProps)
            {
                //if (destProp.Name == nameof(IHasMetaField._meta))
                //{
                //    var meta = src.GetType().IsJsonEntityType() ? ((IJsonEntity)src)._meta : new MetaDto() { ClassName = src.GetType().FullName };
                //    destProp.SetValue(dest, meta, null);
                //    continue;
                //}

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
                        var innerDest = Activator.CreateInstance(JsonEntityProxy.GetUnproxiedType(srcValue.GetType()));
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
                            var idType = typeof(EntityReferenceDto<>).MakeGenericType(srcValue.GetType().GetProperty("Id").PropertyType);
                            var idWithName = Activator.CreateInstance(idType);
                            idType.GetProperty(nameof(EntityReferenceDto<int>.Id)).SetValue(idWithName, id);
                            idType.GetProperty(nameof(EntityReferenceDto<int>._displayName)).SetValue(idWithName, srcValue.GetDisplayName());

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
                            destProp.SetValue(dest, Convert.ChangeType(srcValue, Nullable.GetUnderlyingType(typeof(long?))));
                        else
                            destProp.SetValue(dest, srcValue);
                    }
                    catch(Exception e)
                    {

                    }
                }
            }
        }
    }
}
