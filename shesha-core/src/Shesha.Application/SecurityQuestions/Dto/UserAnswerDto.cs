using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using Shesha.AutoMapper.Dto;
using Shesha.Domain;
using System;

namespace Shesha.SecurityQuestions.Dto
{
    [AutoMap(typeof(QuestionAssignment))]
    public class UserAnswerDto: EntityDto<Guid>
    {
        public EntityReferenceDto<Int64>? User { get; set; }

        public EntityReferenceDto<Guid>? SelectedQuestion { get; set; }

        public string? Answer { get; set; }
    }
}
