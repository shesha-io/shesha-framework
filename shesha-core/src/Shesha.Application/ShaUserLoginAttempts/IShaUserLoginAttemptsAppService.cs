using Abp.Application.Services;
using Shesha.Application.Services.Dto;
using Shesha.ShaUserLoginAttempts.Dto;
using System;

namespace Shesha.ShaUserLoginAttempts
{
    public interface IShaUserLoginAttemptsAppService : IAsyncCrudAppService<ShaUserLoginAttemptDto, Guid, FilteredPagedAndSortedResultRequestDto>
    {
    }
}
