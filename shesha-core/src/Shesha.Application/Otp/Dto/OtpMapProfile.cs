using Shesha.AutoMapper;
using Shesha.Domain;

namespace Shesha.Otp.Dto
{
    public class OtpMapProfile: ShaProfile
    {
        public OtpMapProfile()
        {
            CreateMap<OtpAuditItem, OtpAuditItemDto>()
                .MapReferenceListValuesToDto();
        }
    }
}
