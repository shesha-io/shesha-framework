using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using Abp.Extensions;
using Abp.IdentityFramework;
using Abp.Linq.Extensions;
using Abp.Runtime.Session;
using Abp.UI;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Shesha.Authorization;
using Shesha.Authorization.Roles;
using Shesha.Authorization.Users;
using Shesha.Configuration.Security;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Exceptions;
using Shesha.Extensions;
using Shesha.NHibernate.EntityHistory;
using Shesha.Otp;
using Shesha.Otp.Configuration;
using Shesha.Otp.Dto;
using Shesha.RateLimiting;
using Shesha.SecurityQuestions.Dto;
using Shesha.Users.Dto;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EntityExtensions = Shesha.Extensions.EntityExtensions;

namespace Shesha.Users
{
    [SheshaAuthorize(RefListPermissionedAccess.RequiresPermissions, PermissionNames.User_Manage, IsConfigurable = false)]

    public class UserAppService : AsyncCrudAppService<User, UserDto, long, PagedUserResultRequestDto, CreateUserDto, UserDto>, IUserAppService
    {
        private readonly UserManager _userManager;
        private readonly RoleManager _roleManager;
        private readonly IRepository<Person, Guid> _personRepository;
        private readonly IPasswordHasher<User> _passwordHasher;
        private readonly IAbpSession _abpSession;
        private readonly LogInManager _logInManager;
        private readonly IOtpManager _otpManager;
        private readonly IRepository<User, long> _userRepository;
        private readonly ISecuritySettings _securitySettings;
        private readonly IRepository<QuestionAssignment, Guid> _questionRepository;


        public UserAppService(
            IRepository<User, long> repository,
            UserManager userManager,
            RoleManager roleManager,
            IRepository<Person, Guid> personRepository,
            IPasswordHasher<User> passwordHasher,
            IAbpSession abpSession,
            LogInManager logInManager,
            IOtpManager otpManager,
            ISecuritySettings securitySettings,
            IRepository<User, long> userRepository,
            IRepository<QuestionAssignment, Guid> questionRepository)
            : base(repository)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _personRepository = personRepository;
            _passwordHasher = passwordHasher;
            _abpSession = abpSession;
            _logInManager = logInManager;
            _otpManager = otpManager;
            _userRepository = userRepository;
            _securitySettings = securitySettings;
            _questionRepository = questionRepository;
        }

        public override async Task<UserDto> CreateAsync(CreateUserDto input)
        {
            CheckCreatePermission();

            var user = ObjectMapper.Map<User>(input);

            user.TenantId = AbpSession.TenantId;
            user.IsEmailConfirmed = true;
            user.SupportedPasswordResetMethods = input.SupportedPasswordResetMethods?.Sum();

            await _userManager.InitializeOptionsAsync(AbpSession.TenantId);

            CheckErrors(await _userManager.CreateAsync(user, input.Password));

            if (input.RoleNames != null)
            {
                CheckErrors(await _userManager.SetRolesAsync(user, input.RoleNames));
            }

            await CurrentUnitOfWork.SaveChangesAsync();

            return MapToEntityDto(user);
        }

        public override async Task<UserDto> UpdateAsync(UserDto input)
        {
            CheckUpdatePermission();

            var user = await _userManager.GetUserByIdAsync(input.Id);

            MapToEntity(input, user);

            CheckErrors(await _userManager.UpdateAsync(user));

            if (input.RoleNames != null)
            {
                CheckErrors(await _userManager.SetRolesAsync(user, input.RoleNames));
            }

            return await GetAsync(input);
        }

        public override async Task DeleteAsync(EntityDto<long> input)
        {
            var user = await _userManager.GetUserByIdAsync(input.Id);
            await _userManager.DeleteAsync(user);
        }

        [HttpPost]
        public async Task<bool> InactivateUserAsync(long userId)
        {
            CheckUpdatePermission();

            var user = await _userManager.GetUserByIdAsync(userId);

            if (!user.IsActive)
                throw new InvalidOperationException("Cannot inactivate user. User is already inactive.");

            user.IsActive = false;

            CheckErrors(await _userManager.UpdateAsync(user));

            return true;
        }

        [HttpPost]
        public async Task<bool> ActivateUserAsync(long userId)
        {
            CheckUpdatePermission();

            var user = await _userManager.GetUserByIdAsync(userId);

            if (user.IsActive)
                throw new InvalidOperationException("Cannot activate user. User is already active.");

            user.IsActive = true;

            CheckErrors(await _userManager.UpdateAsync(user));

            return true;
        }

        protected override User MapToEntity(CreateUserDto createInput)
        {
            var user = ObjectMapper.Map<User>(createInput);
            user.SetNormalizedNames();
            return user;
        }

        protected override void MapToEntity(UserDto updateInput, User user)
        {
            ObjectMapper.Map(updateInput, user);
            user.SupportedPasswordResetMethods = updateInput.SupportedPasswordResetMethods?.Sum();
            user.SetNormalizedNames();
        }

        protected override UserDto MapToEntityDto(User user)
        {
            try
            {
                var userRoles = user.Roles.Select(ur => ur.RoleId).ToList();
                var roles = _roleManager.Roles.Where(r => userRoles.Contains(r.Id)).Select(r => r.NormalizedName);
                var userDto = base.MapToEntityDto(user);
                userDto.RoleNames = roles.ToArray();
                userDto.SupportedPasswordResetMethods = EntityExtensions.DecomposeIntoBitFlagComponents(user.SupportedPasswordResetMethods);
                return userDto;
            }
            catch
            {
                throw;
            }
        }

        protected override IQueryable<User> CreateFilteredQuery(PagedUserResultRequestDto input)
        {
            return Repository.GetAllIncluding(x => x.Roles)
                .WhereIf(!input.Keyword.IsNullOrWhiteSpace(), x => x.UserName.Contains(input.Keyword) || x.Name.Contains(input.Keyword) || x.EmailAddress != null && x.EmailAddress.Contains(input.Keyword))
                .WhereIf(input.IsActive.HasValue, x => x.IsActive == input.IsActive);
        }

        protected override IQueryable<User> ApplySorting(IQueryable<User> query, PagedUserResultRequestDto input)
        {
            return query.OrderBy(r => r.UserName);
        }

        protected virtual void CheckErrors(IdentityResult identityResult)
        {
            identityResult.CheckErrors(LocalizationManager);
        }

        #region Reset password using OTP

        /// <summary>
        /// Recipient type of password reset OTPs; the recipient id is the id of the user the OTP was sent for
        /// </summary>
        private static readonly string PasswordResetRecipientType = typeof(User).FullName!;

        /// <summary>
        /// Returns the user a password reset OTP was sent for, or null when the OTP isn't bound to the user with the
        /// specified mobile number
        /// </summary>
        private async Task<User?> GetPasswordResetUserOrNullAsync(IOtpDto otp, string? mobileNo)
        {
            if (string.IsNullOrWhiteSpace(mobileNo))
                return null;

            // the mobile number must belong to exactly one account...
            var users = await (await _userRepository.GetAllAsync()).Where(u => u.PhoneNumber == mobileNo).ToListAsync();
            if (users.Count != 1)
                return null;

            var user = users[0];

            // ...and that must be the account the OTP was sent for: a person (OTPs sent by applications) or a user
            var personId = otp.RecipientId?.ToGuid() ?? Guid.Empty;
            if (personId != Guid.Empty)
            {
                var person = await _personRepository.FirstOrDefaultAsync(personId);
                return person?.User != null && person.User.Id == user.Id ? user : null;
            }

            return otp.RecipientType == PasswordResetRecipientType && otp.RecipientId == user.Id.ToString()
                ? user
                : null;
        }

        private async Task<User?> GetUniqueUserByMobileNoAsync(string mobileNo)
        {
            var users = await _userRepository.GetAllListAsync(u => u.PhoneNumber == mobileNo);

            if (users.Count > 1)
                throw new BadRequestException("Found more than one user with the provided Mobile No");

            if (!users.Any())
                throw new BadRequestException("User with the specified `Mobile No` not found");

            return users.FirstOrDefault();
        }

        /// <summary>
        /// Send One-time pin for password reset
        /// </summary>
        /// <param name="mobileNo">mobile number of the user</param>
        [AllowAnonymous]
        [HttpPost]
        [EnableRateLimiting(SheshaRateLimitingPolicies.Otp)]
        public async Task<ResetPasswordSendOtpResponse> ResetPasswordSendOtpAsync(string mobileNo)
        {
            // todo: cleanup mobile number
            // todo: store clear mobile number in the DB

            var securitySettings = await _securitySettings.SecuritySettings.GetValueAsync();

            // ensure that the user exists
            var user = await GetUniqueUserByMobileNoAsync(mobileNo);

            if (user == null)
                throw new BadRequestException("Your username is not recognised");

            ValidateUserPasswordResetMethod(user, (long)RefListPasswordResetMethods.SmsOtp);

            await EnforceOtpCooldownAsync(user.PasswordResetCode, securitySettings.OtpCooldownSeconds);

            var otpResponse = await _otpManager.SendPinAsync(new SendPinInput()
            {
                SendTo = mobileNo,
                SendType = OtpSendType.Sms,
                Lifetime = securitySettings.ResetPasswordSmsOtpLifetime,
                ActionType = OtpActionTypes.PasswordReset,
                RecipientType = PasswordResetRecipientType,
                RecipientId = user.Id.ToString(),
            });

            user.PasswordResetCode = otpResponse.OperationId.ToString();
            await _userManager.UpdateAsync(user);

            return new ResetPasswordSendOtpResponse()
            {
                OperationId = otpResponse.OperationId
            };
        }


        /// <summary>
        /// Retrieve the password reset options allowed for the user.
        /// </summary>
        /// <param name="username"></param>
        /// <returns></returns>
        /// <exception cref="UserFriendlyException"></exception>
        [AllowAnonymous]
        public async Task<List<ResetPasswordOptionDto>> GetUserPasswordResetOptionsAsync(string username)
        {
            var securitySettings = await _securitySettings.SecuritySettings.GetValueAsync();

            var person = await _userRepository.FirstOrDefaultAsync(p => p.UserName == username);

            if (person == null)
            {
                throw new BadRequestException("Your username is not recognised");
            }

            var resetOptions = person.SupportedPasswordResetMethods;
            var result = new List<ResetPasswordOptionDto>();

            var supportedResetOptions = EntityExtensions.DecomposeIntoBitFlagComponents(resetOptions);
            var isEmailLinkEnabled = securitySettings.UseResetPasswordViaEmailLink;
            var isSMSOTPEnabled = securitySettings.UseResetPasswordViaSmsOtp;
            var isSecurityQuestionsEnabled = securitySettings.UseResetPasswordViaSecurityQuestions;

            var hasQuestions = await (await _questionRepository.GetAllAsync()).Where(q => q.User == person).AnyAsync();

            if (supportedResetOptions.Length > 0)
            {
                foreach (var option in supportedResetOptions)
                {
                    var reflistItem = (RefListPasswordResetMethods)option;
                    var methodOption = new ResetPasswordOptionDto();
                    methodOption.Method = reflistItem;
                    var isAllowed = false;

                    if (reflistItem == RefListPasswordResetMethods.SmsOtp && isSMSOTPEnabled && !string.IsNullOrEmpty(person.PhoneNumber))
                    {
                        var maskedPhoneNumber = person.PhoneNumber.MaskMobileNo();
                        methodOption.Prompt = $"SMS an OTP to {maskedPhoneNumber}";
                        methodOption.MaskedIdentifier = maskedPhoneNumber;
                        isAllowed = true;

                    }
                    else if (reflistItem == RefListPasswordResetMethods.EmailLink && isEmailLinkEnabled && !string.IsNullOrEmpty(person.EmailAddress))
                    {
                        var maskedEmail = person.EmailAddress.MaskEmail();
                        methodOption.Prompt = $"Email a link to {maskedEmail}";
                        methodOption.MaskedIdentifier = maskedEmail;
                        isAllowed = true;
                    }
                    else if (reflistItem == RefListPasswordResetMethods.SecurityQuestions && isSecurityQuestionsEnabled && hasQuestions)
                    {
                        methodOption.Prompt = "Answer security questions";
                        isAllowed = true;
                    }

                    if (isAllowed)
                        result.Add(methodOption);
                }
            }

            return result;
        }

        /// <summary>
        /// Send SMS OTP provided username.
        /// </summary>
        /// <param name="username"></param>
        /// <returns></returns>
        /// <exception cref="UserFriendlyException"></exception>
        [AllowAnonymous]
        [HttpPost]
        [EnableRateLimiting(SheshaRateLimitingPolicies.Otp)]
        public async Task<bool> SendSmsOtpAsync(string username)
        {
            var securitySettings = await _securitySettings.SecuritySettings.GetValueAsync();
            var user = await _userRepository.FirstOrDefaultAsync(u => u.UserName == username);

            ValidateUserPasswordResetMethod(user, (long)RefListPasswordResetMethods.SmsOtp);
            if (string.IsNullOrWhiteSpace(user.PhoneNumber))
                throw new UserFriendlyException("User has no mobile number");

            await EnforceOtpCooldownAsync(user.PasswordResetCode, securitySettings.OtpCooldownSeconds);

            var lifetime = securitySettings.ResetPasswordSmsOtpLifetime;

            var response = await _otpManager.SendPinAsync(new SendPinInput()
            {
                SendTo = user.PhoneNumber,
                SendType = OtpSendType.Sms,
                Lifetime = lifetime,
                ActionType = OtpActionTypes.PasswordReset,
                RecipientType = PasswordResetRecipientType,
                RecipientId = user.Id.ToString(),
            });

            user.PasswordResetCode = response.OperationId.ToString();

            await _userManager.UpdateAsync(user);

            return true;
        }

        /// <summary>
        /// Throws when a previous OTP for the same user was sent inside the cooldown window.
        /// Returning the remaining wait time prevents the SMS gateway from being hit on every retry.
        /// </summary>
        private async Task EnforceOtpCooldownAsync(string? lastOperationCode, int cooldownSeconds)
        {
            if (cooldownSeconds <= 0 || string.IsNullOrWhiteSpace(lastOperationCode))
                return;

            var existingOtpId = lastOperationCode.ToGuidOrNull();
            if (!existingOtpId.HasValue)
                return;

            var existingOtp = await _otpManager.GetOrNullAsync(existingOtpId.Value);
            if (existingOtp?.SentOn == null)
                return;

            var nextAllowed = existingOtp.SentOn.Value.AddSeconds(cooldownSeconds);
            if (nextAllowed <= DateTime.Now)
                return;

            var secondsRemaining = (int)Math.Ceiling((nextAllowed - DateTime.Now).TotalSeconds);
            throw new TooManyRequestsException(
                $"An OTP was recently sent. Please wait {secondsRemaining} seconds before requesting a new one.", secondsRemaining);
        }

        /// <summary>
        /// Get a user's selected security questions
        /// </summary>
        /// <param name="username"></param>
        /// <returns></returns>
        [AllowAnonymous]
        public async Task<List<SecurityQuestionDto>> GetSecurityQuestionsAsync(string username)
        {
            var user = await _userRepository.FirstOrDefaultAsync(u => u.UserName == username);

            ValidateUserPasswordResetMethod(user, (long)RefListPasswordResetMethods.SecurityQuestions);

            var questions = await (await _questionRepository.GetAllAsync()).Where(q => q.User == user).Select(q => q.SelectedQuestion).ToListAsync();

            return ObjectMapper.Map<List<SecurityQuestionDto>>(questions);
        }

        /// <summary>
        /// Validate provided OTP or Email token
        /// </summary>
        /// <param name="input"></param>
        /// <returns>Supposed to return the token required to reset password</returns>
        /// <exception cref="UserFriendlyException"></exception>
        [AllowAnonymous]
        [HttpPost]
        [EnableRateLimiting(SheshaRateLimitingPolicies.Otp)]
        public async Task<ResetPasswordVerifyOtpResponse> ValidateResetCodeAsync(ResetPasswordValidateCodeInput input)
        {
            var username = input.Username;
            if ((RefListPasswordResetMethods)input.Method == RefListPasswordResetMethods.EmailLink)
            {
                // the email link carries the username Base64-encoded
                try
                {
                    username = Encoding.UTF8.GetString(Convert.FromBase64String(username ?? string.Empty));
                }
                catch (FormatException)
                {
                    throw new BadRequestException("Your username is not recognised");
                }
            }

            var user = await _userRepository.FirstOrDefaultAsync(u => u.UserName == username);

            ValidateUserPasswordResetMethod(user, input.Method);

            if (String.IsNullOrEmpty(user.PasswordResetCode) || String.IsNullOrWhiteSpace(user.PasswordResetCode))
            {
                var message = (RefListPasswordResetMethods)input.Method == RefListPasswordResetMethods.SmsOtp ? "OTP Verification failed" : "Email link verification failed";
                throw new VerificationFailedException(message);
            }

            var operationId = user.PasswordResetCode.ToGuidOrNull();

            if (!operationId.HasValue)
            {
                throw new VerificationFailedException("Failed to verify OTP provided");
            }

            // PasswordResetCode also holds the operation id of an OTP login, so only accept an OTP issued for password reset
            var otp = await _otpManager.GetOrNullAsync(operationId.Value);
            if (otp?.ActionType != OtpActionTypes.PasswordReset)
                throw new VerificationFailedException("Failed to verify OTP provided");

            var otpResponse = await _otpManager.VerifyPinAsync(new VerifyPinInput
            {
                OperationId = operationId.Value,
                Pin = input.Code
            });

            // the OTP is single use: of concurrent requests with the same pin, only one is verified and gets a token
            var response = ObjectMapper.Map<ResetPasswordVerifyOtpResponse>(otpResponse);

            if (response.IsSuccess)
            {
                user.SetNewPasswordResetCode();
                await _userManager.UpdateAsync(user);

                // real password reset will be done using token
                response.Token = user.PasswordResetCode;
                // response.Username = user.UserName;
            }
            return response;
        }

        /// <summary>
        /// Validating security questions submitted by the user
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        [AllowAnonymous]
        [HttpPost]
        [EnableRateLimiting(SheshaRateLimitingPolicies.Otp)]
        public async Task<ResetPasswordVerifyOtpResponse> ValidateSecurityQuestionsAsync(SecurityQuestionVerificationDto input)
        {
            var user = await _userRepository.FirstOrDefaultAsync(u => u.UserName == input.Username);

            ValidateUserPasswordResetMethod(user, (long)RefListPasswordResetMethods.SecurityQuestions);

            if (user.SecurityQuestionLockoutEnd.HasValue && user.SecurityQuestionLockoutEnd.Value > DateTime.UtcNow)
                throw new UserFriendlyException("Account is temporarily locked due to too many failed attempts.");

            var configuredQuestions = await (await _questionRepository.GetAllAsync())
                .Where(q => q.User == user)
                .ToListAsync();

            var submittedQuestions = input.SubmittedQuestions ?? new List<SecurityQuestionPair>();

            var validationErrors = 0;

            // Require the submitted question IDs to exactly match the configured set (no duplicates,
            // no subset, no extras) — otherwise a caller could pass verification by submitting the
            // same known answer multiple times, or by sending an empty list against an empty config.
            var configuredQuestionIds = configuredQuestions
                .Select(q => q.SelectedQuestion.Id)
                .ToHashSet();
            var submittedQuestionIds = submittedQuestions
                .Select(q => q.QuestionId)
                .ToHashSet();

            if (configuredQuestionIds.Count == 0
                || submittedQuestions.Count != configuredQuestionIds.Count
                || submittedQuestionIds.Count != configuredQuestionIds.Count
                || !submittedQuestionIds.SetEquals(configuredQuestionIds))
            {
                validationErrors++;
            }
            else
            {
                foreach (var submittedQuestionPair in submittedQuestions)
                {
                    var answeredQuestion = configuredQuestions
                        .Single(q => q.SelectedQuestion.Id == submittedQuestionPair.QuestionId);

                    if (string.IsNullOrEmpty(submittedQuestionPair.SubmittedAnswer)
                        || !string.Equals(submittedQuestionPair.SubmittedAnswer, answeredQuestion.Answer, StringComparison.OrdinalIgnoreCase))
                    {
                        validationErrors++;
                    }
                }
            }

            if (validationErrors > 0)
            {
                user.SecurityQuestionFailedAttempts = (user.SecurityQuestionFailedAttempts ?? 0) + 1;

                var maxAttempts = await _securitySettings.MaxFailedAccessAttemptsBeforeLockout.GetValueAsync();

                if (user.SecurityQuestionFailedAttempts >= maxAttempts)
                {
                    var lockoutSeconds = await _securitySettings.DefaultAccountLockoutSeconds.GetValueAsync();
                    user.SecurityQuestionLockoutEnd = DateTime.UtcNow.AddSeconds(lockoutSeconds);
                    user.SecurityQuestionFailedAttempts = 0;
                    await _userManager.UpdateAsync(user);

                    // return instead of throwing: an exception rolls back the unit of work and the lockout would never be saved
                    var lockedResponse = new ResetPasswordVerifyOtpResponse();
                    ObjectMapper.Map(VerifyPinResponse.Failed("Account is temporarily locked due to too many failed attempts."), lockedResponse);
                    return lockedResponse;
                }

                await _userManager.UpdateAsync(user);

                var validationResult = VerifyPinResponse.Failed("There are some questions you have answered incorrectly");
                var failedResponse = new ResetPasswordVerifyOtpResponse();
                ObjectMapper.Map(validationResult, failedResponse);
                return failedResponse;
            }

            user.SecurityQuestionFailedAttempts = 0;
            user.SecurityQuestionLockoutEnd = null;
            user.SetNewPasswordResetCode();
            await _userManager.UpdateAsync(user);

            var successResponse = new ResetPasswordVerifyOtpResponse();
            ObjectMapper.Map(VerifyPinResponse.Success(), successResponse);
            successResponse.Token = user.PasswordResetCode!;
            return successResponse;
        }


        /// <summary>
        /// Send an email to the user with a link to reset their password
        /// </summary>
        /// <param name="username"></param>
        /// <returns></returns>
        [AllowAnonymous]
        [HttpPost]
        [EnableRateLimiting(SheshaRateLimitingPolicies.Otp)]
        public async Task<bool> SendEmailLinkAsync(string username)
        {
            var securitySettings = await _securitySettings.SecuritySettings.GetValueAsync();

            var user = await _userRepository.FirstOrDefaultAsync(u => u.UserName == username);

            ValidateUserPasswordResetMethod(user, (long)RefListPasswordResetMethods.EmailLink);

            if (string.IsNullOrWhiteSpace(user.EmailAddress))
                throw new UserFriendlyException("User has no email address");

            var lifetime = securitySettings.ResetPasswordEmailLinkLifetime;

            var encodedUserName = Convert.ToBase64String(Encoding.UTF8.GetBytes(username));

            var response = await _otpManager.SendPinAsync(new SendPinInput() { SendTo = user.EmailAddress, SendType = OtpSendType.EmailLink, Lifetime = lifetime, RecipientId = encodedUserName, ActionType = OtpActionTypes.PasswordReset });

            user.PasswordResetCode = response.OperationId.ToString();

            await _userManager.UpdateAsync(user);

            return true;
        }

        /// <summary>
        /// Verify one-time pin that was used for password reset. Returns a token that should be used for password update
        /// </summary>
        [AllowAnonymous]
        [EnableRateLimiting(SheshaRateLimitingPolicies.Otp)]
        public async Task<ResetPasswordVerifyOtpResponse> ResetPasswordVerifyOtpAsync(ResetPasswordVerifyOtpInput input)
        {
            // only accept an OTP issued for password reset, not e.g. one sent for an OTP login
            var otp = await _otpManager.GetOrNullAsync(input.OperationId);
            if (otp == null || otp.ActionType != OtpActionTypes.PasswordReset)
                return ObjectMapper.Map<ResetPasswordVerifyOtpResponse>(VerifyPinResponse.Failed("Wrong one time pin"));

            // the OTP must have been sent for this user, to their current mobile number, so a pin sent to one user can't
            // reset another user's password. PasswordResetCode isn't used for this: it also holds the operation id of an
            // OTP login, so requesting a login OTP after the reset OTP would make the valid reset pin fail
            var user = await GetPasswordResetUserOrNullAsync(otp, input.MobileNo);
            if (user == null || string.IsNullOrWhiteSpace(user.PhoneNumber) || otp.SendTo != user.PhoneNumber)
                return ObjectMapper.Map<ResetPasswordVerifyOtpResponse>(VerifyPinResponse.Failed("Wrong one time pin"));

            var otpRequest = ObjectMapper.Map<VerifyPinInput>(input);
            var otpResponse = await _otpManager.VerifyPinAsync(otpRequest);

            // the OTP is single use: of concurrent requests with the same pin, only one is verified and gets a token
            var response = ObjectMapper.Map<ResetPasswordVerifyOtpResponse>(otpResponse);

            if (response.IsSuccess)
            {
                user.SetNewPasswordResetCode();
                await _userManager.UpdateAsync(user);

                // real password reset will be done using token
                response.Token = user.PasswordResetCode!;
                response.Username = user.UserName;
            }

            return response;
        }

        /// <summary>
        /// Resets a password of the user using token
        /// </summary>
        [AllowAnonymous]
        public async Task<bool> ResetPasswordUsingTokenAsync(ResetPasswordUsingTokenInput input)
        {
            var user = await _userRepository.FirstOrDefaultAsync(u => u.UserName == input.Username);
            if (user == null)
                throw new BadRequestException("User not found");

            // check the token
            if (user.PasswordResetCode != input.Token)
                throw new VerificationFailedException("Your token is invalid or has expired, try to reset password again");

            // PasswordResetCode also holds the operation id of a pending OTP (password reset, email link or OTP login), which
            // the send endpoints return to anonymous callers. Operation ids are stored in the GUID "D" format (with dashes), and
            // the tokens issued after a pin is verified (SetNewPasswordResetCode) in the "N" format, so a token in the "D" format
            // is never accepted. This doesn't depend on the OTP still being stored, which isn't the case after a cache evicts it
            if (Guid.TryParseExact(input.Token, "D", out _))
                throw new VerificationFailedException("Your token is invalid or has expired, try to reset password again");

            // validate password against configured policy
            await _userManager.InitializeOptionsAsync(AbpSession.TenantId);
            var passwordErrors = new List<IdentityError>();
            foreach (var validator in _userManager.PasswordValidators)
            {
                var validationResult = await validator.ValidateAsync(_userManager, user, input.NewPassword);
                if (!validationResult.Succeeded)
                    passwordErrors.AddRange(validationResult.Errors);
            }
            if (passwordErrors.Any())
                CheckErrors(IdentityResult.Failed(passwordErrors.ToArray()));

            user.AddHistoryEvent("Password reset", "Password reset");
            (await _personRepository.FirstOrDefaultAsync(x => x.User == user))?.AddHistoryEvent("Password reset", "Password reset");

            user.Password = _passwordHasher.HashPassword(user, input.NewPassword);
            user.PasswordResetCode = null;

            await CurrentUnitOfWork.SaveChangesAsync();

            return true;
        }

        /// <summary>
        /// Check to see if the specified user is allowed to reset their password using the specified method.
        /// </summary>
        /// <param name="user"></param>
        /// <param name="resetMethod"></param>
        /// <exception cref="UserFriendlyException"></exception>
        private void ValidateUserPasswordResetMethod([NotNull] User? user, long resetMethod)
        {
            var securitySettings = _securitySettings.SecuritySettings.GetValue();

            var isEmailLinkEnabled = securitySettings.UseResetPasswordViaEmailLink;
            var isSmsOtpEnabled = securitySettings.UseResetPasswordViaSmsOtp;
            var isSecurityQuestionsEnabled = securitySettings.UseResetPasswordViaSecurityQuestions;

            if (user == null)
                throw new BadRequestException("Your username is not recognised");

            var userSupportedMethods = EntityExtensions.DecomposeIntoBitFlagComponents(user.SupportedPasswordResetMethods);

            if (!userSupportedMethods.Any())
                throw new BadRequestException("User has no supported password reset methods");

            if (!userSupportedMethods.Contains(resetMethod))
                throw new BadRequestException("User is not allowed to reset password using the selected method");

            if ((RefListPasswordResetMethods)resetMethod == RefListPasswordResetMethods.EmailLink && !isEmailLinkEnabled)
                throw new BadRequestException("Resetting password through email link is not allowed");

            if ((RefListPasswordResetMethods)resetMethod == RefListPasswordResetMethods.SmsOtp && !isSmsOtpEnabled)
                throw new BadRequestException("Resetting password through SMS one time passwords is not allowed");

            if ((RefListPasswordResetMethods)resetMethod == RefListPasswordResetMethods.SecurityQuestions && !isSecurityQuestionsEnabled)
                throw new BadRequestException("Resetting password through security questions is not allowed");

            if ((RefListPasswordResetMethods)resetMethod == RefListPasswordResetMethods.SecurityQuestions && user.SecurityQuestionStatus != RefListSecurityQuestionStatus.Set)
                throw new BadRequestException("User has not set the security questions");
        }

        #endregion

        public async Task<bool> ChangePasswordAsync(ChangePasswordDto input)
        {
            if (_abpSession.UserId == null)
            {
                throw new UserFriendlyException("Please log in before attempting to change your password.");
            }

            long userId = _abpSession.UserId.Value;
            var user = await _userManager.GetUserByIdAsync(userId);
            var loginAsync = await _logInManager.LoginAsync(user.UserName, input.CurrentPassword, shouldLockout: false);
            if (loginAsync.Result != ShaLoginResultType.Success)
            {
                throw new UserFriendlyException("Your 'Existing Password' did not match the one on record.  Please try again or contact an administrator for assistance in resetting your password.");
            }
            // validate password against configured policy
            await _userManager.InitializeOptionsAsync(AbpSession.TenantId);
            foreach (var validator in _userManager.PasswordValidators)
            {
                CheckErrors(await validator.ValidateAsync(_userManager, user, input.NewPassword));
            }

            user.AddHistoryEvent("Password changed", "Password changed");
            (await _personRepository.FirstOrDefaultAsync(x => x.User == user))?.AddHistoryEvent("Password changed", "Password changed");

            user.Password = _passwordHasher.HashPassword(user, input.NewPassword);
            user.RequireChangePassword = false;

            await CurrentUnitOfWork.SaveChangesAsync();
            return true;
        }

        [SheshaAuthorize(RefListPermissionedAccess.RequiresPermissions, PermissionNames.User_Manage, PermissionNames.User_ResetPassword)]
        public async Task ResetPasswordAsync(ResetPasswordDto input)
        {
            var user = await _userManager.GetUserByIdAsync(input.UserId);
            if (user == null)
                throw new UserFriendlyException("User not found");

            // validate password against configured policy
            await _userManager.InitializeOptionsAsync(AbpSession.TenantId);
            foreach (var validator in _userManager.PasswordValidators)
            {
                CheckErrors(await validator.ValidateAsync(_userManager, user, input.NewPassword));
            }

            user.AddHistoryEvent("Password reset", "Password reset");
            var person = await _personRepository.FirstOrDefaultAsync(x => x.User == user);
            person?.AddHistoryEvent("Password reset", "Password reset");

            user.Password = _passwordHasher.HashPassword(user, input.NewPassword);
            user.RequireChangePassword = input.RequireChangePassword;
            user.IsActive = true;
            if (user.LockoutEndDateUtc.HasValue && user.LockoutEndDateUtc > DateTime.Now)
                user.LockoutEndDateUtc = DateTime.Now;
            await _userManager.UpdateAsync(user);
            await CurrentUnitOfWork.SaveChangesAsync();
        }
    }
}

