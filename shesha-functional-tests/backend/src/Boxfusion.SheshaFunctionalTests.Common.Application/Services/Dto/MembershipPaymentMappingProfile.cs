using Boxfusion.SheshaFunctionalTests.Common.Domain.Domain;
using Shesha.AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Boxfusion.SheshaFunctionalTests.Common.Application.Services.Dto
{
    public class MembershipPaymentMappingProfile: ShaProfile
    {
        public MembershipPaymentMappingProfile()
        {
            CreateMap<MembershipPaymentDto, MembershipPayment>()
                .ForMember(a => a.Member, b => b.MapFrom(c => GetEntity<Member>(c.Member.Id)))
                .MapReferenceListValuesFromDto();
        }
    }
}
