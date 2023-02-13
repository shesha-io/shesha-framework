using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using Shesha.AutoMapper.Dto;
using Shesha.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.SecurityQuestions.Dto
{
    [AutoMap(typeof(QuestionAssignment))]
    public class UserAnswerDto: EntityDto<Guid>
    {
        public EntityReferenceDto<Int64> User { get; set; }

        public EntityReferenceDto<Guid> SelectedQuestion { get; set; }

        public string Answer { get; set; }
    }
}
