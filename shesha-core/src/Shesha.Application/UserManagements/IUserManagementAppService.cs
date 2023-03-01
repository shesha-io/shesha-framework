using Abp.Application.Services;
using Shesha.Application.Services.Dto;
using Shesha.Persons;
using System;

namespace Shesha.UserManagements
{
    /// <summary>
    /// User Management Application Service
    /// </summary>
    public interface IUserManagementAppService : IAsyncCrudAppService<PersonAccountDto, Guid, FilteredPagedAndSortedResultRequestDto, CreatePersonAccountDto, PersonAccountDto>
    {
    }
}
