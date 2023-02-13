using Abp.Application.Services;
using Shesha.Application.Services.Dto;
using Shesha.ShaRoleAppointedPersons.Dto;
using System;

namespace Shesha.ShaRoleAppointedPersons
{
    public interface IShaRoleAppointedPersonAppService : IAsyncCrudAppService<ShaRoleAppointedPersonDto, Guid, FilteredPagedAndSortedResultRequestDto, CreateShaRoleAppointedPersonDto, ShaRoleAppointedPersonDto>
    {
    }
}
