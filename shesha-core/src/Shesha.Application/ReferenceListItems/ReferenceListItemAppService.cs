using Abp.Domain.Repositories;
using Shesha.Domain;
using Shesha.DynamicEntities.Dtos;
using System;
using System.Threading.Tasks;

namespace Shesha.ReferenceLists
{
    public class ReferenceListItemAppService : DynamicCrudAppService<ReferenceListItem, DynamicDto<ReferenceListItem, Guid>, Guid>
    {
        public ReferenceListItemAppService(IRepository<ReferenceListItem, Guid> repository) : base(repository)
        {
        }

        public override async Task<DynamicDto<ReferenceListItem, Guid>> UpdateAsync(DynamicDto<ReferenceListItem, Guid> input)
        {
            return await base.UpdateAsync(input);
        }
    }
}