using Boxfusion.SheshaFunctionalTests.Common.Domain.Domain;
using Shesha.AutoMapper;

namespace Boxfusion.SheshaFunctionalTests.Common.Application.Services.Dto
{
    public class MembershipPaymentMappingProfile : ShaProfile
    {
        public MembershipPaymentMappingProfile()
        {
            CreateMap<MembershipPaymentDto, MembershipPayment>()
                .ForMember(a => a.Member, b => b.MapFrom(c => GetEntity<Member>(c.Member.Id)))
                .MapReferenceListValuesFromDto();
        }
    }
}
