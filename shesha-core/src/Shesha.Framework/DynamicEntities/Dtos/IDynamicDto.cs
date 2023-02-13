using Abp.Application.Services.Dto;
using Abp.Domain.Entities;
using Newtonsoft.Json.Linq;

namespace Shesha.DynamicEntities.Dtos
{
    public interface IDynamicDto<TEntity, TId>: IEntityDto<TId>, IHasJObjectField where TEntity: IEntity<TId>
    {
    }
}
