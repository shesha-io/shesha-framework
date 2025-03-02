using Shesha.AutoMapper;
using Shesha.AutoMapper.Dto;
using Shesha.Domain;
using System;

namespace Shesha.SecurityQuestions.Dto
{
    public class SecurityQuestionsMapProfile : ShaProfile
    {
        public SecurityQuestionsMapProfile()
        {
            CreateMap<QuestionAssignment, UserAnswerDto>()
                .ForMember(a => a.User, option => option.MapFrom(e => e.User != null 
                    ? new EntityReferenceDto<Int64>(e.User) { _displayName = e.User.FullName }
                    : null))
                .ForMember(a => a.SelectedQuestion, option => option.MapFrom(e => e.SelectedQuestion != null 
                    ? new EntityReferenceDto<Guid>(e.SelectedQuestion) { _displayName = e.SelectedQuestion.Question } 
                    : null));

            CreateMap<UserAnswerDto, QuestionAssignment>()
                .ForMember(a => a.User, option => option.Ignore())
                .ForMember(a => a.SelectedQuestion, option => option.MapFrom(e => e.SelectedQuestion != null ? GetEntity<SecurityQuestion, Guid>(e.SelectedQuestion.Id) : null));
        }
    }
}
