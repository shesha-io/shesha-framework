using System;
using Abp.Application.Services.Dto;
using Abp.AutoMapper;

namespace Shesha.UserManagements
{
    [AutoMap(typeof(Domain.Person))]
    public class UserManagementDto: EntityDto<Guid>
    {
        public virtual string UserName { get; set; }
        public virtual string Password { get; set; }

        public virtual string FirstName { get; set; }

        public virtual string LastName { get; set; }

        public virtual string MobileNumber { get; set; }

        public virtual string EmailAddress { get; set; }
    }
}
