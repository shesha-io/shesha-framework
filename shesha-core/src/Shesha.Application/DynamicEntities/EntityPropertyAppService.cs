using Abp.Domain.Repositories;
using Shesha.Domain;
using Shesha.DynamicEntities.Dtos;
using System;

namespace Shesha.DynamicEntities;

/// inheritedDoc
public class EntityPropertyAppService : SheshaCrudServiceBase<EntityProperty, EntityPropertyDto, Guid>, IEntityPropertyAppService
{
    public EntityPropertyAppService(IRepository<EntityProperty, Guid> repository) : base(repository)
    {
    }
}
