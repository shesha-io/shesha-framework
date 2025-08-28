using Abp.Dependency;
using Abp.Reflection;
using Shesha.AutoMapper;
using Shesha.AutoMapper.Dto;
using Shesha.DynamicEntities.TypeFinder;
using Shesha.Extensions;
using Shesha.Services;
using System.Collections.Generic;
using System.Linq;

namespace Shesha.DynamicEntities.Mapper
{
    /// <summary>
    /// Entity mapping profile
    /// </summary>
    public class EntityMapProfile: ShaProfile, ITransientDependency
    {
        private static List<ConverterDefinition> Converters;

        static EntityMapProfile() 
        {
            Converters = new List<ConverterDefinition>();

            var typeFinder = StaticContext.IocManager.Resolve<IShaTypeFinder>();

            var entityTypes = typeFinder.Find(t => t.IsEntityType()).ToList();
            foreach (var entityType in entityTypes)
            {
                var idType = entityType.GetEntityIdType();

                Converters.Add(new ConverterDefinition(idType, entityType, typeof(IdToEntityConverter<,>).MakeGenericType(entityType, idType)));
                Converters.Add(new ConverterDefinition(entityType, idType, typeof(EntityToIdConverter<,>).MakeGenericType(entityType, idType)));

                var dtoType = typeof(EntityReferenceDto<>).MakeGenericType(idType);
                Converters.Add(new ConverterDefinition(dtoType, entityType, typeof(EntityReferenceDtoToEntityConverter<,>).MakeGenericType(entityType, idType)));
                Converters.Add(new ConverterDefinition(entityType, dtoType, typeof(EntityToEntityReferenceDtoConverter<,>).MakeGenericType(entityType, idType)));
            }
        }

        public EntityMapProfile()
        {
            foreach (var converterInfo in Converters) 
            {
                CreateMap(converterInfo.SrcType, converterInfo.DstType).ConvertUsing(converterInfo.ConverterType);
            }
        }
    }
}
