using Abp.Application.Services.Dto;
using Abp.Authorization.Users;
using Abp.AutoMapper;
using Shesha.Authorization.Users;
using System;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Users.Dto
{
    [AutoMapFrom(typeof(User))]
    public class UserDto : EntityDto<long>
    {
        [Required]
        [MaxLength(AbpUserBase.MaxUserNameLength)]
        public string? UserName { get; set; }

        [Required]
        [MaxLength(AbpUserBase.MaxNameLength)]
        public string? Name { get; set; }

        [Required]
        [MaxLength(AbpUserBase.MaxSurnameLength)]
        public string? Surname { get; set; }

        [Required]
        [EmailAddress]
        [MaxLength(AbpUserBase.MaxEmailAddressLength)]
        public string? EmailAddress { get; set; }

        public bool IsActive { get; set; }

        public string? FullName { get; set; }

        public DateTime? LastLoginTime { get; set; }

        public DateTime CreationTime { get; set; }

        public string[]? RoleNames { get; set; }

        public long[]? SupportedPasswordResetMethods { get; set; }
    }
}
