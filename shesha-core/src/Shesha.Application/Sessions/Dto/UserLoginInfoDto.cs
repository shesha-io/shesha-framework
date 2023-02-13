using System.Collections.Generic;
using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using Shesha.Authorization.Users;

namespace Shesha.Sessions.Dto
{
    [AutoMapFrom(typeof(User))]
    public class UserLoginInfoDto : EntityDto<long>
    {
        public bool AccountFound { get; set; }
        public string UserName { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string FullName { get; set; }
        public string Picture { get; set; }
        public string Email { get; set; }
        public string MobileNumber { get; set; }
        public bool HasRegistered { get; set; }
        public string LoginProvider { get; set; }
        //public TypeOfAccount? TypeOfAccount { get; set; }
        public string HomeUrl { get; set; }
        public bool IsSelfServiceUser { get; set; }
        public List<string> GrantedPermissions { get; set; } = new List<string>();
    }
}
