using Boxfusion.SheshaFunctionalTests.Common.Domain.Domain;
using Shesha.AutoMapper;

namespace Boxfusion.SheshaFunctionalTests.Common.Application.Services.Dto
{
    public class BankMemberMappingProfile : ShaProfile
    {
        public BankMemberMappingProfile()
        {
            CreateMap<Bank, BankMemberDto>()
                .ForMember(e => e.Address, m => m.MapFrom(e => e.Address.Id));

            CreateMap<BankMemberDto, Bank>()
                .ForMember(e => e.Id, d => d.Ignore());
        }
    }
}
