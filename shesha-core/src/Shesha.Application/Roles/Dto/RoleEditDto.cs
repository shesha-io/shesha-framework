using System.ComponentModel.DataAnnotations;
using Abp.Application.Services.Dto;
using Abp.Authorization.Roles;
using Shesha.Authorization.Roles;

namespace Shesha.Roles.Dto
{
    public class RoleEditDto: EntityDto<int>
    {
        [Required]
        [MaxLength(AbpRoleBase.MaxNameLength)]
        public string Name { get; set; }

        [Required]
        [MaxLength(AbpRoleBase.MaxDisplayNameLength)]
        public string DisplayName { get; set; }

        [MaxLength(Role.MaxDescriptionLength)]
        public string Description { get; set; }

        public bool IsStatic { get; set; }
    }
}