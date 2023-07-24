using AutoMapper;
using Shesha.Authorization.Users;
using Shesha.AutoMapper;

namespace Shesha.Users.Dto
{
    public class UserMapProfile : Profile
    {
        public UserMapProfile()
        {
            CreateMap<UserDto, User>();
            CreateMap<UserDto, User>()
                .ForMember(x => x.SupportedPasswordResetMethods, opt => opt.Ignore())
                .ForMember(x => x.Roles, opt => opt.Ignore())
                .ForMember(x => x.CreationTime, opt => opt.Ignore())
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            CreateMap<User, UserDto>()
                .ForMember(x => x.RoleNames, opt => opt.Ignore())
                .ForMember(x => x.SupportedPasswordResetMethods, opt => opt.Ignore());

            CreateMap<CreateUserDto, User>();
            CreateMap<CreateUserDto, User>()
                .ForMember(x => x.Roles, opt => opt.Ignore())
                .ForMember(x => x.SupportedPasswordResetMethods, opt => opt.Ignore());
        }
    }
}
