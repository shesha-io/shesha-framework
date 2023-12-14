using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Boxfusion.SheshaFunctionalTests.Common.Application.Services.Dto
{
    public class BankMemberDto: EntityDto<Guid>
    {
        public string Name { get; set; }

        public string Description { get; set; }

        public Guid? Address { get; set; }

        public List<Guid> Members { get; set; }
    }
}
