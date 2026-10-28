using Abp.Application.Services.Dto;
using Shesha.AutoMapper.Dto;

namespace Boxfusion.SheshaFunctionalTests.Common.Application.Services.Dto
{

    public class MembershipPaymentDto : EntityDto<Guid>
    {
        public virtual EntityReferenceDto<Guid> Member { get; set; }
        public virtual double Amount { get; set; }
        public virtual DateTime PaymentDate { get; set; }
        public virtual ReferenceListItemValueDto PaymentType { get; set; }
    }
}
