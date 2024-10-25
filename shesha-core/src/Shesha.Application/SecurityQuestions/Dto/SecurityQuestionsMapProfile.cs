using Shesha.AutoMapper;
using Shesha.AutoMapper.Dto;
using Shesha.Domain;
using Shesha.Extensions;
using System;

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
                .ForMember(a => a.User, option => option.Ignore())
                .ForMember(a => a.SelectedQuestion, option => option.MapFrom(e => e.SelectedQuestion != null ? GetEntity<SecurityQuestion, Guid>(e.SelectedQuestion.Id) : null));
        }
    }
}
