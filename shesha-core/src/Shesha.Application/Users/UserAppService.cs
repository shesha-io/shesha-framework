using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Extensions;
using Abp.IdentityFramework;
using Abp.Linq.Extensions;
using Abp.Localization;
using Abp.Runtime.Session;
using Abp.UI;
using Abp.Web.Models.AbpUserConfiguration;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Shesha.Authorization;
using Shesha.Authorization.Roles;
using Shesha.Authorization.Users;
using Shesha.Configuration.Security;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Extensions;
using Shesha.NHibernate.EntityHistory;
using Shesha.Otp;
using Shesha.Otp.Dto;
using Shesha.Roles.Dto;
using Shesha.SecurityQuestions.Dto;
using Shesha.Users.Dto;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using EntityExtensions = Shesha.Extensions.EntityExtensions;

namespace Shesha.Users
{
    [SheshaAuthorize(RefListPermissionedAccess.RequiresPermissions, PermissionNames.Pages_Users)]

    public class UserAppService : AsyncCrudAppService<User, UserDto, long, PagedUserResultRequestDto, CreateUserDto, UserDto>, IUserAppService
    {
        // from: http://regexlib.com/REDetails.aspx?regexp_id=1923
        public const string PasswordRegex = "(?=^.{8,}$)(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\\s)[0-9a-zA-Z!@#$%^&*()]*$";

        private readonly UserManager _userManager;
        private readonly RoleManager _roleManager;
        private readonly IRepository<Role> _roleRepository;
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
            IRepository<Role> roleRepository,
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
            _roleRepository = roleRepository;
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

        public async Task<ListResultDto<RoleDto>> GetRolesAsync()
        {
            var roles = await _roleRepository.GetAllListAsync();
            return new ListResultDto<RoleDto>(ObjectMapper.Map<List<RoleDto>>(roles));
        }

        public async Task ChangeLanguageAsync(ChangeUserLanguageDto input)
        {
            await SettingManager.ChangeSettingForUserAsync(
                AbpSession.ToUserIdentifier(),
                LocalizationSettingNames.DefaultLanguage,
                input.LanguageName
            );
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

        protected override async Task<User> GetEntityByIdAsync(long id)
        {
            var user = await Repository.GetAllIncluding(x => x.Roles).FirstOrDefaultAsync(x => x.Id == id);

            if (user == null)
            {
                throw new EntityNotFoundException(typeof(User), id);
            }

            return user;
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

        private async Task<User?> GetUniqueUserByMobileNoAsync(string mobileNo)
        {
            var users = await _userRepository.GetAll().Where(u => u.PhoneNumber == mobileNo).ToListAsync();

            if (users.Count > 1)
                throw new UserFriendlyException("Found more than one user with the provided Mobile No");

            if (!users.Any())
                throw new UserFriendlyException("User with the specified `Mobile No` not found");

            return users.FirstOrDefault();
        }

        /// <summary>
        /// Send One-time pin for password reset
        /// </summary>
        /// <param name="mobileNo">mobile number of the user</param>
        [AbpAllowAnonymous]
        public async Task<ResetPasswordSendOtpResponse> ResetPasswordSendOtpAsync(string mobileNo)
        {
            // todo: cleanup mobile number
            // todo: store clear mobile number in the DB

            // ensure that the user exists
            var user = await GetUniqueUserByMobileNoAsync(mobileNo);

            var otpResponse = await _otpManager.SendPinAsync(new SendPinInput() { SendTo = mobileNo, SendType = OtpSendType.Sms });

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
        [AbpAllowAnonymous]
        public async Task<List<ResetPasswordOptionDto>> GetUserPasswordResetOptionsAsync(string username)
        {
            var securitySettings = await _securitySettings.SecuritySettings.GetValueAsync();

            var person = await _userRepository.GetAll().Where(p => p.UserName == username).FirstOrDefaultAsync();

            if (person == null)
            {
                throw new UserFriendlyException("Your username is not recognised");
            }

            var resetOptions = person.SupportedPasswordResetMethods;
            var result = new List<ResetPasswordOptionDto>();

            var supportedResetOptions = EntityExtensions.DecomposeIntoBitFlagComponents(resetOptions);
            var isEmailLinkEnabled = securitySettings.UseResetPasswordViaEmailLink;
            var isSMSOTPEnabled = securitySettings.UseResetPasswordViaSmsOtp;
            var isSecurityQuestionsEnabled = securitySettings.UseResetPasswordViaSecurityQuestions;
            
            var hasPhoneNumber = !string.IsNullOrEmpty(person.PhoneNumber);
            var hasEmail = !string.IsNullOrEmpty(person.EmailAddress);
            var hasQuestions = await _questionRepository.GetAll().Where(q => q.User == person).AnyAsync();

            if (supportedResetOptions.Length > 0)
            {
                foreach(var option in supportedResetOptions)
                {
                    var reflistItem = (RefListPasswordResetMethods)option;
                    var methodOption = new ResetPasswordOptionDto();
                    methodOption.Method = reflistItem;
                    var isAllowed = false;

                    if (reflistItem == RefListPasswordResetMethods.SmsOtp && isSMSOTPEnabled && hasPhoneNumber)
                    {
                        var maskedPhoneNumber = person.PhoneNumber.MaskMobileNo();
                        methodOption.Prompt = $"SMS an OTP to {maskedPhoneNumber}";
                        methodOption.MaskedIdentifier = maskedPhoneNumber;
                        isAllowed = true;
                        
                    }
                    else if (reflistItem == RefListPasswordResetMethods.EmailLink && isEmailLinkEnabled && hasEmail)
                    {
                        if (!string.IsNullOrWhiteSpace(person.EmailAddress)) 
                        {
                            var maskedEmail = person.EmailAddress.MaskEmail();
                            methodOption.Prompt = $"Email a link to {maskedEmail}";
                            methodOption.MaskedIdentifier = maskedEmail;
                            isAllowed = true;
                        }                        
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
        [AbpAllowAnonymous]
        [HttpPost]
        public async Task<bool> SendSmsOtpAsync(string username)
        {
            var securitySettings = await _securitySettings.SecuritySettings.GetValueAsync();
            var user = await _userRepository.GetAll().Where(u => u.UserName == username).FirstOrDefaultAsync();

            ValidateUserPasswordResetMethod(user, (long)RefListPasswordResetMethods.SmsOtp);

            var lifetime = securitySettings.ResetPasswordSmsOtpLifetime;

            var response = await _otpManager.SendPinAsync(new SendPinInput() { SendTo = user.PhoneNumber, SendType = OtpSendType.Sms, Lifetime = lifetime });

            user.PasswordResetCode = response.OperationId.ToString();

            await _userManager.UpdateAsync(user);

            return true;
        }

        /// <summary>
        /// Get a user's selected security questions
        /// </summary>
        /// <param name="username"></param>
        /// <returns></returns>
        [AbpAllowAnonymous]
        public async Task<List<SecurityQuestionDto>> GetSecurityQuestionsAsync(string username)
        {
            var user = await _userRepository.GetAll().Where(u => u.UserName == username).FirstOrDefaultAsync();

            ValidateUserPasswordResetMethod(user, (long)RefListPasswordResetMethods.SecurityQuestions);

            var questions = await _questionRepository.GetAllIncluding(q => q.User, q => q.SelectedQuestion).Where(q => q.User == user).Select(q => q.SelectedQuestion).ToListAsync();

            return ObjectMapper.Map<List<SecurityQuestionDto>>(questions);
        }

        /// <summary>
        /// Validate provided OTP or Email token
        /// </summary>
        /// <param name="input"></param>
        /// <returns>Supposed to return the token required to reset password</returns>
        /// <exception cref="UserFriendlyException"></exception>
        [AbpAllowAnonymous]
        [HttpPost]
        public async Task<ResetPasswordVerifyOtpResponse> ValidateResetCodeAsync(ResetPasswordValidateCodeInput input)
        {
            var username = input.Username;
            if ((RefListPasswordResetMethods)input.Method == RefListPasswordResetMethods.EmailLink)
            {
                username = Encoding.UTF8.GetString(Convert.FromBase64String(username));
            }

            var user = await _userRepository.GetAll().Where(u => u.UserName == username).FirstOrDefaultAsync();

            ValidateUserPasswordResetMethod(user, input.Method);

            if (String.IsNullOrEmpty(user.PasswordResetCode) || String.IsNullOrWhiteSpace(user.PasswordResetCode))
            {
                var message = (RefListPasswordResetMethods)input.Method == RefListPasswordResetMethods.SmsOtp ? "OTP Verification failed" : "Email link verification failed";
                throw new UserFriendlyException(message);
            }

            var operationId = user.PasswordResetCode.ToGuidOrNull();

            if (!operationId.HasValue)
            {
                throw new UserFriendlyException("Failed to verify OTP provided");
            }

            var otpResponse = await _otpManager.VerifyPinAsync(new VerifyPinInput
            {
                OperationId = operationId.Value,
                Pin = input.Code
            });

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
        [AbpAllowAnonymous]
        [HttpPost]
        public async Task<ResetPasswordVerifyOtpResponse> ValidateSecurityQuestionsAsync(SecurityQuestionVerificationDto input)
        {
            var user = await _userRepository.GetAll().Where(u => u.UserName == input.Username).FirstOrDefaultAsync();

            ValidateUserPasswordResetMethod(user, (long)RefListPasswordResetMethods.SecurityQuestions);

            var validationErrors = 0;
            var validationResult = new VerifyPinResponse();
            var response = new ResetPasswordVerifyOtpResponse();

            foreach(var submittedQuestionPair in input.SubmittedQuestions)
            {
                var answeredQuestion = await _questionRepository.GetAllIncluding(q => q.User, q => q.SelectedQuestion).Where(q => q.User == user && q.SelectedQuestion.Id == submittedQuestionPair.QuestionId).FirstOrDefaultAsync();

                if (submittedQuestionPair.SubmittedAnswer.ToLower() != answeredQuestion.Answer.ToLower())
                {
                    validationErrors ++;
                }
            }

            if (validationErrors > 0)
            {
                validationResult = VerifyPinResponse.Failed($"There are some questions you have answered incorrectly");
            }
            else
            {
                validationResult = VerifyPinResponse.Success();
            }

            ObjectMapper.Map(validationResult, response);

            if (validationResult.IsSuccess)
            {
                user.SetNewPasswordResetCode();
                await _userManager.UpdateAsync(user);

                // real password reset will be done using token
                response.Token = user.PasswordResetCode;
            }

            return response;
        }


        /// <summary>
        /// Send an email to the user with a link to reset their password
        /// </summary>
        /// <param name="username"></param>
        /// <returns></returns>
        [AbpAllowAnonymous]
        [HttpPost]
        public async Task<bool> SendEmailLinkAsync(string username)
        {
            var securitySettings = await _securitySettings.SecuritySettings.GetValueAsync();

            var user = await _userRepository.GetAll().Where(u => u.UserName == username).FirstOrDefaultAsync();

            ValidateUserPasswordResetMethod(user, (long)RefListPasswordResetMethods.EmailLink);

            if (string.IsNullOrWhiteSpace(user.EmailAddress))
                throw new UserFriendlyException("User has no email address");

            var lifetime = securitySettings.ResetPasswordEmailLinkLifetime;

            var encodedUserName = Convert.ToBase64String(Encoding.UTF8.GetBytes(username));

            var response = await _otpManager.SendPinAsync(new SendPinInput() { SendTo = user.EmailAddress, SendType = OtpSendType.EmailLink, Lifetime = lifetime, RecipientId = encodedUserName });

            user.PasswordResetCode = response.OperationId.ToString();

            await _userManager.UpdateAsync(user);

            return true;
        }

        /// <summary>
        /// Verify one-time pin that was used for password reset. Returns a token that should be used for password update
        /// </summary>
        [AbpAllowAnonymous]
        public async Task<ResetPasswordVerifyOtpResponse> ResetPasswordVerifyOtpAsync(ResetPasswordVerifyOtpInput input)
        {
            var otp = await _otpManager.GetOrNullAsync(input.OperationId);
            var personId = otp?.RecipientId?.ToGuid() ?? Guid.Empty;
            var user = personId != Guid.Empty
                ? (await _personRepository.GetAsync(personId))?.User
                : await GetUniqueUserByMobileNoAsync(input.MobileNo);

            if (user == null)
                throw new Exception("User not found");

            var otpRequest = ObjectMapper.Map<VerifyPinInput>(input);
            var otpResponse = await _otpManager.VerifyPinAsync(otpRequest);

            var response = ObjectMapper.Map<ResetPasswordVerifyOtpResponse>(otpResponse);

            if (response.IsSuccess)
            {
                user.SetNewPasswordResetCode();
                await _userManager.UpdateAsync(user);
                
                // real password reset will be done using token
                response.Token = user.PasswordResetCode;
                response.Username = user.UserName;
            }

            return response;
        }

        /// <summary>
        /// Resets a password of the user using token
        /// </summary>
        [AbpAllowAnonymous]
        public async Task<bool> ResetPasswordUsingTokenAsync(ResetPasswordUsingTokenInput input)
        {
            var user = await _userRepository.GetAll().FirstOrDefaultAsync(u => u.UserName == input.Username);
            if (user == null)
                throw new UserFriendlyException("User not found");

            // check the token
            if (user.PasswordResetCode != input.Token)
                throw new UserFriendlyException("Your token is invalid or has expired, try to reset password again");

            // todo: add new setting for the PasswordRegex and error message
            if (!new Regex(PasswordRegex).IsMatch(input.NewPassword))
            {
                throw new UserFriendlyException("Passwords must be at least 8 characters, contain a lowercase, uppercase, and number.");
            }
            
            user.AddHistoryEvent("Password reset", "Password reset");
            _personRepository.GetAll().FirstOrDefault(x => x.User == user)?.AddHistoryEvent("Password reset", "Password reset");

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
        private void ValidateUserPasswordResetMethod(User user, long resetMethod)
        {
            var securitySettings = _securitySettings.SecuritySettings.GetValue();

            var isEmailLinkEnabled = securitySettings.UseResetPasswordViaEmailLink;
            var isSmsOtpEnabled = securitySettings.UseResetPasswordViaSmsOtp;
            var isSecurityQuestionsEnabled = securitySettings.UseResetPasswordViaSecurityQuestions;

            if (user == null)
                throw new UserFriendlyException("Your username is not recognised");

            var userSupportedMethods = EntityExtensions.DecomposeIntoBitFlagComponents(user.SupportedPasswordResetMethods);

            if (!userSupportedMethods.Any())
                throw new UserFriendlyException("User has no supported password reset methods");

            if (!userSupportedMethods.Contains(resetMethod))
                throw new UserFriendlyException("User is not allowed to reset password using the selected method");

            if ((RefListPasswordResetMethods)resetMethod == RefListPasswordResetMethods.EmailLink && !isEmailLinkEnabled)
                throw new UserFriendlyException("Resetting password through email link is not allowed");

            if ((RefListPasswordResetMethods)resetMethod == RefListPasswordResetMethods.SmsOtp && !isSmsOtpEnabled)
                throw new UserFriendlyException("Resetting password through SMS one time passwords is not allowed");

            if ((RefListPasswordResetMethods)resetMethod == RefListPasswordResetMethods.SecurityQuestions && !isSecurityQuestionsEnabled)
                throw new UserFriendlyException("Resetting password through security questions is not allowed");

            if ((RefListPasswordResetMethods)resetMethod == RefListPasswordResetMethods.SecurityQuestions && user.SecurityQuestionStatus != RefListSecurityQuestionStatus.Set)
                throw new UserFriendlyException("User has not set the security questions");
        }

        #endregion

        public async Task<bool> ChangePasswordAsync(ChangePasswordDto input)
        {
            if (_abpSession.UserId == null)
            {
                throw new UserFriendlyException("Please log in before attemping to change password.");
            }
            long userId = _abpSession.UserId.Value;
            var user = await _userManager.GetUserByIdAsync(userId);
            var loginAsync = await _logInManager.LoginAsync(user.UserName, input.CurrentPassword, shouldLockout: false);
            if (loginAsync.Result != ShaLoginResultType.Success)
            {
                throw new UserFriendlyException("Your 'Existing Password' did not match the one on record.  Please try again or contact an administrator for assistance in resetting your password.");
            }
            // todo: add new setting for the PasswordRegex and error message
            if (!new Regex(PasswordRegex).IsMatch(input.NewPassword))
            {
                throw new UserFriendlyException("Passwords must be at least 8 characters, contain a lowercase, uppercase, and number.");
            }

            user.AddHistoryEvent("Password changed", "Password changed");
            _personRepository.GetAll().FirstOrDefault(x => x.User == user)?.AddHistoryEvent("Password changed", "Password changed");

            user.Password = _passwordHasher.HashPassword(user, input.NewPassword);
            await CurrentUnitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ResetPasswordAsync(ResetPasswordDto input)
        {
            if (_abpSession.UserId == null)
            {
                throw new UserFriendlyException("Please log in before attemping to reset password.");
            }
            long currentUserId = _abpSession.UserId.Value;
            var currentUser = await _userManager.GetUserByIdAsync(currentUserId);
            
            if (currentUser.IsDeleted || !currentUser.IsActive)
            {
                return false;
            }
            
            if (!await PermissionChecker.IsGrantedAsync(ShaPermissionNames.Users_ResetPassword))
            {
                throw new UserFriendlyException("You are not authorized to reset passwords.");
            }

            var user = await _userManager.GetUserByIdAsync(input.UserId);
            if (user != null)
            {
                user.AddHistoryEvent("Password reset", "Password reset");
                var person = await _personRepository.FirstOrDefaultAsync(x => x.User == user);
                person?.AddHistoryEvent("Password reset", "Password reset");

                user.Password = _passwordHasher.HashPassword(user, input.NewPassword);
                user.IsActive = true;
                if (user.LockoutEndDateUtc.HasValue && user.LockoutEndDateUtc > DateTime.Now)
                    user.LockoutEndDateUtc = DateTime.Now;
                await _userManager.UpdateAsync(user);
                await CurrentUnitOfWork.SaveChangesAsync();
            }

            return true;
        }

        public virtual async Task<AbpUserAuthConfigDto> GetUserAuthConfigAsync()
        {
            var config = new AbpUserAuthConfigDto();

            var allPermissionNames = PermissionManager.GetAllPermissions(false).Select(p => p.Name).ToList();
            var grantedPermissionNames = new List<string>();

            if (AbpSession.UserId.HasValue)
            {
                foreach (var permissionName in allPermissionNames)
                {
                    if (await PermissionChecker.IsGrantedAsync(permissionName))
                    {
                        grantedPermissionNames.Add(permissionName);
                    }
                }
            }

            config.AllPermissions = allPermissionNames.ToDictionary(permissionName => permissionName, permissionName => "true");
            config.GrantedPermissions = grantedPermissionNames.ToDictionary(permissionName => permissionName, permissionName => "true");

            return config;
        } 
    }
}

