using Abp.Application.Services.Dto;
using Shesha.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Boxfusion.SheshaFunctionalTests.Common.Application.Services.Dto
{
    [AddToMetadata]
    public class TestDto : EntityDto<Guid>
    {
        public virtual string Name { get; set; }
        public virtual string Description { get; set; }
    }
}