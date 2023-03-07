using AutoMapper;
using Shesha.Authorization.Users;

namespace Shesha.Users.Dto
{
    public class UserMapProfile : Profile
    {
        public UserMapProfile()
        {
            CreateMap<UserDto, User>();
            CreateMap<UserDto, User>()
                .ForMember(x => x.Roles, opt => opt.Ignore())
                .ForMember(x => x.CreationTime, opt => opt.Ignore());

            CreateMap<UpdateUserDto, User>()
                .ForMember(x => x.SupportedPasswordResetMethods, opt => opt.Ignore())
                .ForMember(x => x.Roles, opt => opt.Ignore())
                .ForMember(x => x.CreationTime, opt => opt.Ignore())
                .ForAllMembers(x => x.Condition((src, dest, member) => member != null));

            CreateMap<CreateUserDto, User>();
            CreateMap<CreateUserDto, User>()
                .ForMember(x => x.Roles, opt => opt.Ignore())
                .ForMember(x => x.SupportedPasswordResetMethods, opt => opt.Ignore());
        }
    }
}
