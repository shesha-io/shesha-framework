using Abp.Authorization;
using Abp.Domain.Repositories;
using Abp.UI;
using Shesha.Authorization;
using Shesha.Authorization.Users;
using Shesha.Configuration;
using Shesha.Configuration.Security;
using Shesha.Domain;
using Shesha.SecurityQuestions.Dto;
using System;
using System.Threading.Tasks;

namespace Shesha.SecurityQuestions
{
    public class QuestionAnswersAppService : SheshaCrudServiceBase<QuestionAssignment, UserAnswerDto, Guid>
    {
        private readonly IRepository<User, long> _userRepository;
        private readonly ISecuritySettings _setting;

        public QuestionAnswersAppService(IRepository<QuestionAssignment, Guid> repository,
            IRepository<User, long> userRepository,
            ISecuritySettings setting) : base(repository)
        {
            _userRepository = userRepository;
            _setting = setting;
        }

        [SheshaAuthorize(Domain.Enums.RefListPermissionedAccess.AnyAuthenticated)]
        public override async Task<UserAnswerDto> CreateAsync(UserAnswerDto input)
        {
            var currentUserId = AbpSession.UserId;

            if (!currentUserId.HasValue)
            {
                throw new UserFriendlyException("Please log in to submit your answers to the security questions.");
            }

            var user = await _userRepository.GetAsync(currentUserId.Value);

            var settings = await _setting.SecuritySettings.GetValueAsync();

            var numberOfQuestionsAllowed = settings.ResetPasswordViaSecurityQuestionsNumQuestionsAllowed;

            var numberOfQuestionsSelected = await Repository.CountAsync(q => q.User == user);

            if (numberOfQuestionsSelected >= numberOfQuestionsAllowed)
            {
                throw new UserFriendlyException($"Maximum of {numberOfQuestionsAllowed} questions allowed");
            }

            var alreadyAnsweredQuestions = await Repository.CountAsync(q => q.User == user && q.SelectedQuestion.Id == input.SelectedQuestion.Id);
            if (alreadyAnsweredQuestions != 0)
            {
                throw new UserFriendlyException("You have already answered this question");
            }

            var entity = await SaveOrUpdateEntityAsync<QuestionAssignment>(null, item =>
            {
                ObjectMapper.Map(input, item);
                item.User = user;
            });

            if (numberOfQuestionsSelected == numberOfQuestionsAllowed - 1)
            {
                user.SecurityQuestionStatus = Domain.Enums.RefListSecurityQuestionStatus.Set;

                await _userRepository.UpdateAsync(user);
            }


            return ObjectMapper.Map<UserAnswerDto>(entity);
        }
    }
}
