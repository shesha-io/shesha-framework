using Abp.Authorization;
using Abp.Domain.Repositories;
using Shesha.Domain;
using Shesha.SecurityQuestions.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.SecurityQuestions
{
    [AbpAuthorize()]
    public class SecurityQuestionsAppService : SheshaCrudServiceBase<SecurityQuestion, SecurityQuestionDto, Guid>
    {
        public SecurityQuestionsAppService(IRepository<SecurityQuestion, Guid> repository) : base(repository)
        {
        }
    }
}
