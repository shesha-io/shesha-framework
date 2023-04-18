using Boxfusion.SheshaFunctionalTests.Common.Domain.Domain;
using Shesha.AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Boxfusion.SheshaFunctionalTests.Common.Application.Services.Dto
{
    public class BankMemberMappingProfile: ShaProfile
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
