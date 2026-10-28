using Abp.Application.Services.Dto;

namespace Boxfusion.SheshaFunctionalTests.Common.Application.Services.Dto
{
    public class SchoolDto: EntityDto<Guid>
    {
        public virtual string Name { get; set; }
        public virtual string ContactNumber { get; set; }
    }
}
