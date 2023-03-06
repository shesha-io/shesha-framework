using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using Shesha.Authorization.Users;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Users.Dto
{
    [AutoMapTo(typeof(User))]
    public class UpdateUserDto: UserDto
    {
        public long[] SupportedPasswordResetMethods { get; set; }
    }
}
