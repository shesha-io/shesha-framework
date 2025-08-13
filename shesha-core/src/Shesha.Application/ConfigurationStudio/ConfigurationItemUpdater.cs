using Abp.Application.Services.Dto;
using Abp.Domain.Entities;
using Newtonsoft.Json.Linq;
using Shesha.ConfigurationItems;
using Shesha.Domain;
using Shesha.DynamicEntities;
using Shesha.DynamicEntities.Dtos;
using Shesha.Extensions;
using Shesha.Reflection;
using Shesha.Utilities;
using System;

namespace Shesha.ConfigurationStudio
{
    public class ConfigurationItemUpdater<TItem, TRevision, TDynamicDto>
            where TItem : class, IConfigurationItem<TRevision>, IEntity<Guid>
            where TDynamicDto : class, IDynamicDto<TItem, Guid>
            where TRevision : ConfigurationItemRevision
    {
        public static ConfigurationItemDtoParts ExtractConfigurationItemDtoParts(Guid id, TDynamicDto fullDto)
        {
            var result = new ConfigurationItemDtoParts();

            var mainObject = fullDto._jObject;

            var activeRevisionPropName = nameof(ConfigurationItem<ConfigurationItemRevision>.LatestRevision).ToCamelCase();

            if (mainObject != null && mainObject.TryGetValue(activeRevisionPropName, out var activeRevisionToken))
            {
                if (activeRevisionToken is JObject activeRevisionObject) 
                {
                    var revisionDtoType = typeof(DynamicDto<,>).MakeGenericType([typeof(TRevision), typeof(Guid)]);
                    var revisionDto = ActivatorHelper.CreateNotNullObject(revisionDtoType);
                    (revisionDto as IHasJObjectField).NotNull()._jObject = activeRevisionObject;

                    result.Revision = revisionDto as IDynamicDto<TRevision, Guid>;
                }

                mainObject.Remove(activeRevisionPropName);

                var dtoType = typeof(DynamicDto<,>).MakeGenericType([typeof(TItem), typeof(Guid)]);
                var dto = ActivatorHelper.CreateNotNullObject(dtoType);
                (dto as IEntityDto<Guid>).NotNull().Id = id;
                (dto as IHasJObjectField).NotNull()._jObject = mainObject;

                result.Item = dto as TDynamicDto;                
            }

            return result;            
        }

        public class ConfigurationItemDtoParts
        {
            public TDynamicDto? Item { get; set; }
            public IDynamicDto<TRevision, Guid>? Revision { get; set; }            
        }
    }
}