using System.Collections.Generic;
using Abp.Application.Services.Dto;
using Abp.AutoMapper;

namespace Shesha.Roles.Dto
{
    [AutoMapFrom(typeof(Abp.Authorization.Permission))]
    public class PermissionDto : EntityDto<string>
    {
        public PermissionDto()
        {
            Child = new List<PermissionDto>();
        }

        public string Name { get; set; }

        public string DisplayName { get; set; }

        public string Description { get; set; }

        public string ParentName { get; set; }
        
        public bool IsDbPermission { get; set; }

        public PermissionDto Parent { get; set; }

        public List<PermissionDto> Child { get; set; }
    }
}
