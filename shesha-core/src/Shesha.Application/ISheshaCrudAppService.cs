using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Abp.Dependency;
using Shesha.Application.Services.Dto;

namespace Shesha
{
    public interface ISheshaCrudAppService<TEntityDto, TPrimaryKey> : IAsyncCrudAppService<TEntityDto, TPrimaryKey, FilteredPagedAndSortedResultRequestDto>, IAsyncCrudAppService<TEntityDto, TPrimaryKey, FilteredPagedAndSortedResultRequestDto, TEntityDto, TEntityDto>, IAsyncCrudAppService<TEntityDto, TPrimaryKey, FilteredPagedAndSortedResultRequestDto, TEntityDto, TEntityDto, EntityDto<TPrimaryKey>>, IAsyncCrudAppService<TEntityDto, TPrimaryKey, FilteredPagedAndSortedResultRequestDto, TEntityDto, TEntityDto, EntityDto<TPrimaryKey>, EntityDto<TPrimaryKey>>, IApplicationService, ITransientDependency where TEntityDto : IEntityDto<TPrimaryKey>
    {
    }
}
