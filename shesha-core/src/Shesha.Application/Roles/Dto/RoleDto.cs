using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Abp.Application.Services.Dto;
using Abp.Authorization.Roles;
using Abp.AutoMapper;
using Shesha.Authorization.Roles;

namespace Shesha.Roles.Dto
{
    public class RoleDto : EntityDto<int>
    {
        [Required]
        [MaxLength(AbpRoleBase.MaxNameLength)]
        public string Name { get; set; }
        
        [Required]
        [MaxLength(AbpRoleBase.MaxDisplayNameLength)]
        public string DisplayName { get; set; }

        public string NormalizedName { get; set; }
        
        [MaxLength(Role.MaxDescriptionLength)]
        public string Description { get; set; }

        public List<string> GrantedPermissions { get; set; }
    }
}