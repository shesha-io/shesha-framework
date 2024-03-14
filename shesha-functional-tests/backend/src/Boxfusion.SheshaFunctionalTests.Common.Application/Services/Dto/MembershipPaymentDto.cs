using Abp.Application.Services.Dto;
using Boxfusion.SheshaFunctionalTests.Common.Domain.Domain.Enum;
using Boxfusion.SheshaFunctionalTests.Common.Domain.Domain;
using Shesha.Domain.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Shesha.Services.ReferenceLists.Dto;
using Shesha.AutoMapper.Dto;

namespace Boxfusion.SheshaFunctionalTests.Common.Application.Services.Dto
{

    public class MembershipPaymentDto: EntityDto<Guid>
    {
        public virtual EntityReferenceDto<Guid> Member { get; set; }
        public virtual double Amount { get; set; }
        public virtual DateTime PaymentDate { get; set; }
        public virtual ReferenceListItemValueDto PaymentType { get; set; }
    }
}
