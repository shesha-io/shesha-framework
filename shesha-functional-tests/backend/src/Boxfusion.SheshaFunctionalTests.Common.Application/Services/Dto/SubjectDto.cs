using Abp.Application.Services.Dto;

namespace Boxfusion.SheshaFunctionalTests.Common.Application.Services.Dto
{
    public class SubjectDto : EntityDto<Guid>
    {
        public virtual string Name { get; set; }
        public virtual string Description { get; set; }
    }
}
