using Abp.Application.Services.Dto;
using Abp.Domain.Entities;

namespace Shesha.DynamicEntities.Dtos
{
    public interface IDynamicDto<TEntity, TId>: IEntityDto<TId>, IHasJObjectField where TEntity: IEntity<TId>
    {
    }
}
