using Shesha.Authorization.Users;
using Shesha.AutoMapper;
using Shesha.AutoMapper.Dto;
using Shesha.Domain;
using Shesha.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.SecurityQuestions.Dto
{
    public class SecurityQuestionsMapProfile : ShaProfile
    {
        public SecurityQuestionsMapProfile()
        {
            CreateMap<QuestionAssignment, UserAnswerDto>()
                .ForMember(a => a.User, option => option.MapFrom(e => e.User != null 
                    ? new EntityReferenceDto<Int64>(e.User.Id, e.User.FullName, e.User.GetClassName()) : null))
                .ForMember(a => a.SelectedQuestion, option => option.MapFrom(e => e.SelectedQuestion != null 
                    ? new EntityReferenceDto<Guid>(e.SelectedQuestion.Id, e.SelectedQuestion.Question, e.SelectedQuestion.GetClassName()) : null));

            CreateMap<UserAnswerDto, QuestionAssignment>()
                .ForMember(a => a.User, option => option.MapFrom(e => e.User != null ? GetEntity<User, Int64>(e.User.Id) : null))
                .ForMember(a => a.SelectedQuestion, option => option.MapFrom(e => e.SelectedQuestion != null ? GetEntity<SecurityQuestion, Guid>(e.SelectedQuestion.Id) : null));
        }
    }
}
