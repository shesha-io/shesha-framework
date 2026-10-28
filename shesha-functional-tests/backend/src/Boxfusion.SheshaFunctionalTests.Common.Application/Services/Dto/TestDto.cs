using Abp.Application.Services.Dto;
using Shesha.Attributes;

namespace Boxfusion.SheshaFunctionalTests.Common.Application.Services.Dto
{
    [AddToMetadata]
    public class TestDto : EntityDto<Guid>
    {
        public virtual string Name { get; set; }
        public virtual string Description { get; set; }
    }
}