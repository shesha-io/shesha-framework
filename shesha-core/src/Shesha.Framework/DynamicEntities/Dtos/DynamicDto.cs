using Abp.Application.Services.Dto;
using Abp.Domain.Entities;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Shesha.DynamicEntities.Converter;

namespace Shesha.DynamicEntities.Dtos
{
    [JsonConverter(typeof(DynamicDtoConverter))]
    public class DynamicDto<TEntity, TId> : EntityDto<TId>, IDynamicDto<TEntity, TId> where TEntity : IEntity<TId>
    {
        public virtual JObject _jObject { get; set; }
    }

    [JsonConverter(typeof(DynamicDtoConverter))]
    public class CreateDynamicDto<TEntity, TId> : DynamicDto<TEntity, TId> where TEntity : IEntity<TId>
    {
    }

    [JsonConverter(typeof(DynamicDtoConverter))]
    public class UpdateDynamicDto<TEntity, TId> : DynamicDto<TEntity, TId> where TEntity : IEntity<TId>
    {
    }
}
