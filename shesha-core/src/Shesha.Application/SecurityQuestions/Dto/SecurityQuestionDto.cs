using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using Shesha.Domain;
using System;

namespace Shesha.SecurityQuestions.Dto
{
    [AutoMap(typeof(SecurityQuestion))]
    public class SecurityQuestionDto: EntityDto<Guid>
    {
        public string Question { get; set; }
    }
}
