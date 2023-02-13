using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using Shesha.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.SecurityQuestions.Dto
{
    [AutoMap(typeof(SecurityQuestion))]
    public class SecurityQuestionDto: EntityDto<Guid>
    {
        public string Question { get; set; }
    }
}
