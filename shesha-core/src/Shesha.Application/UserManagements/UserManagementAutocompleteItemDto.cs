using Abp.Application.Services.Dto;
using System;

namespace Shesha.UserManagements
{
    public class UserManagementAutocompleteItemDto: EntityDto<Guid>
    {
        public string FullName { get; set; }
    }
}
