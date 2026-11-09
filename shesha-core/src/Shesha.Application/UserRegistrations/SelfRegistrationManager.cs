using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Services;
using Abp.Events.Bus;
using Abp.Runtime.Validation;
using Abp.Timing;
using Abp.UI;
using Shesha.Authorization.Users;
using Shesha.Configuration.Runtime;
using Shesha.Configuration.Security;
using Shesha.ConfigurationItems;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Extensions;
using Shesha.Otp;
using Shesha.Otp.Dto;
using Shesha.UserManagements.Configurations;
using Shesha.UserRegistrations.Dto;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.UserRegistrations
{
    /// <summary>
    /// Anonymous self-registration: validates the request against the front-end's settings, creates the user account,
    /// creates or links the Person, appoints default roles and raises <see cref="UserSelfRegisteredEventData"/>.
    /// Methods are virtual so projects can replace the manager to customise individual steps.
    /// </summary>
    public class SelfRegistrationManager : DomainService, ITransientDependency
    {
        public const string RegistrationDisabledMessage = "Self-registration is not available.";
        public const string OwnershipNotVerifiedMessage = "Please verify your email address or mobile number with a one-time pin to link your account.";
        public const string ContactNotVerifiedMessage = "Please verify your email address or mobile number with a one-time pin before registering.";
        public const string MisconfiguredMessage = "Self-registration is not configured correctly. Please contact the system administrator.";
        public const string InvalidCompletionTokenMessage = "This registration link is invalid or has expired. Please log in to finish your registration.";

        private readonly UserManager _userManager;
        private readonly IRepository<Person, Guid> _personRepository;
        private readonly IRepository<ShaRole, Guid> _roleRepository;
        private readonly IRepository<ShaRoleAppointedPerson, Guid> _roleAppointmentRepository;
        private readonly IRepository<ShaUserRegistration, Guid> _userRegistrationRepository;
        private readonly IEntityConfigurationStore _entityConfigurationStore;
        private readonly IOtpManager _otpManager;
        private readonly ISecuritySettings _securitySettings;
        private readonly IConfigurationFrameworkRuntime _cfRuntime;

        public IEventBus EventBus { get; set; } = NullEventBus.Instance;

        public SelfRegistrationManager(
            UserManager userManager,
            IRepository<Person, Guid> personRepository,
            IRepository<ShaRole, Guid> roleRepository,
            IRepository<ShaRoleAppointedPerson, Guid> roleAppointmentRepository,
            IRepository<ShaUserRegistration, Guid> userRegistrationRepository,
            IEntityConfigurationStore entityConfigurationStore,
            IOtpManager otpManager,
            ISecuritySettings securitySettings,
            IConfigurationFrameworkRuntime cfRuntime)
        {
            _userManager = userManager;
            _personRepository = personRepository;
            _roleRepository = roleRepository;
            _roleAppointmentRepository = roleAppointmentRepository;
            _userRegistrationRepository = userRegistrationRepository;
            _entityConfigurationStore = entityConfigurationStore;
            _otpManager = otpManager;
            _securitySettings = securitySettings;
            _cfRuntime = cfRuntime;
        }

        public virtual async Task<SelfRegistrationResult> RegisterAsync(SelfRegistrationInput input, EffectiveUserManagementSettings effective)
        {
            if (!effective.IsSelfRegistrationEnabled)
                throw new UserFriendlyException(RegistrationDisabledMessage);

            var settings = effective.Settings;

            input.EmailAddress = input.EmailAddress?.Trim();
            input.MobileNumber = input.MobileNumber?.Trim();
            input.UserName = input.UserName?.Trim();

            ValidateInput(input, settings);

            var personType = ResolvePersonType(settings.PersonEntityType);
            var matches = await FindMatchingPersonsAsync(input.EmailAddress, input.MobileNumber);
            if (matches.Count > 1)
                throw new UserFriendlyException(SelfRegistrationPlanner.AccountAlreadyExistsMessage);

            var existingPerson = matches.SingleOrDefault();
            var plan = SelfRegistrationPlanner.Plan(settings.CreationMode, existingPerson != null, existingPerson?.User != null);
            if (plan.Action == SelfRegistrationAction.Reject)
                throw new UserFriendlyException(plan.RejectionReason);

            if (plan.Action == SelfRegistrationAction.LinkToExisting)
                await EnsureOwnershipVerifiedAsync(input, existingPerson);
            else
                await EnsureContactVerifiedAsync(input, settings.SupportedRegistrationMethods);

            var userName = settings.UserEmailAsUsername ? input.EmailAddress : input.UserName;
            var user = await _userManager.CreateUserAsync(
                userName,
                createLocalPassword: true,
                input.Password,
                input.PasswordConfirmation,
                input.FirstName,
                input.LastName,
                input.MobileNumber,
                input.EmailAddress,
                requireChangePassword: false,
                await GetSupportedPasswordResetMethodsAsync());

            Person person;
            if (plan.Action == SelfRegistrationAction.LinkToExisting)
            {
                person = existingPerson;
                person.User = user;
                await _personRepository.UpdateAsync(person);
            }
            else
            {
                person = CreatePersonInstance(personType);
                person.FirstName = input.FirstName;
                person.LastName = input.LastName;
                person.EmailAddress1 = input.EmailAddress;
                person.MobileNumber1 = input.MobileNumber;
                person.User = user;
                await _personRepository.InsertAsync(person);
            }

            await AppointDefaultRolesAsync(person, settings.DefaultRoles);

            var registration = await SaveRegistrationAsync(user, settings);
            var completionToken = registration.IsComplete ? null : await IssueCompletionTokenAsync(registration);

            await CurrentUnitOfWork.SaveChangesAsync();

            await EventBus.TriggerAsync(new UserSelfRegisteredEventData(
                user,
                person,
                plan.Action == SelfRegistrationAction.LinkToExisting,
                _cfRuntime.FrontEndApplication,
                settings));

            return new SelfRegistrationResult
            {
                UserId = user.Id,
                PersonId = person.Id,
                LinkedToExistingPerson = plan.Action == SelfRegistrationAction.LinkToExisting,
                GoToUrlAfterRegistration = registration.GoToUrlAfterRegistration,
                RequiresAdditionalRegistrationInfo = !registration.IsComplete,
                AdditionalRegistrationInfoFormModule = registration.AdditionalRegistrationInfoForm?.Module,
                AdditionalRegistrationInfoFormName = registration.AdditionalRegistrationInfoForm?.Name,
                CompletionToken = completionToken,
            };
        }

        /// <summary>
        /// How long a registration completion token stays valid. A new token is issued each time the user logs in
        /// with an incomplete registration, so this only needs to cover filling in the additional registration form.
        /// </summary>
        public virtual TimeSpan CompletionTokenLifetime => TimeSpan.FromHours(1);

        /// <summary>
        /// Issues a new single-use completion token for an incomplete registration, replacing any previous one.
        /// Only the token's hash is stored; the token itself is returned to the registrant.
        /// </summary>
        public virtual async Task<string> IssueCompletionTokenAsync(ShaUserRegistration registration)
        {
            var token = Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLowerInvariant();
            registration.CompletionTokenHash = HashCompletionToken(token);
            registration.CompletionTokenExpiresOn = Clock.Now.Add(CompletionTokenLifetime);
            await _userRegistrationRepository.UpdateAsync(registration);
            return token;
        }

        /// <summary>
        /// Returns the incomplete registration of the specified user when <paramref name="token"/> is its current, unexpired
        /// completion token; otherwise throws. Projects can call this from their own anonymous endpoints to authorise
        /// saving the additional registration information for <paramref name="userId"/>.
        /// </summary>
        public virtual async Task<ShaUserRegistration> GetRegistrationForCompletionAsync(long userId, string token)
        {
            var registration = string.IsNullOrWhiteSpace(token)
                ? null
                : await _userRegistrationRepository.FirstOrDefaultAsync(e => e.UserId == userId);

            var isValid = registration != null
                && !registration.IsComplete
                && registration.CompletionTokenHash != null
                && registration.CompletionTokenExpiresOn > Clock.Now
                && CryptographicOperations.FixedTimeEquals(
                    Encoding.ASCII.GetBytes(registration.CompletionTokenHash),
                    Encoding.ASCII.GetBytes(HashCompletionToken(token.Trim())));

            if (!isValid)
                throw new UserFriendlyException(InvalidCompletionTokenMessage);

            return registration;
        }

        /// <summary>
        /// Marks the registration as complete (after the additional registration info form), invalidates the token and returns the URL to go to
        /// </summary>
        public virtual async Task<string> CompleteRegistrationAsync(long userId, string token)
        {
            var registration = await GetRegistrationForCompletionAsync(userId, token);

            registration.IsComplete = true;
            registration.CompletionTokenHash = null;
            registration.CompletionTokenExpiresOn = null;
            await _userRegistrationRepository.UpdateAsync(registration);

            return registration.GoToUrlAfterRegistration;
        }

        private static string HashCompletionToken(string token)
        {
            return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token))).ToLowerInvariant();
        }

        protected virtual void ValidateInput(SelfRegistrationInput input, UserManagementSettings settings)
        {
            var errors = new List<ValidationResult>();

            if (string.IsNullOrWhiteSpace(input.FirstName))
                errors.Add(new ValidationResult("First Name is mandatory"));
            if (string.IsNullOrWhiteSpace(input.LastName))
                errors.Add(new ValidationResult("Last Name is mandatory"));

            if (settings.UserEmailAsUsername && string.IsNullOrWhiteSpace(input.EmailAddress))
                errors.Add(new ValidationResult("Email Address is mandatory"));
            if (!settings.UserEmailAsUsername && string.IsNullOrWhiteSpace(input.UserName))
                errors.Add(new ValidationResult("Username is mandatory"));

            if (!string.IsNullOrWhiteSpace(input.EmailAddress) && EmailDomainPolicy.GetDomain(input.EmailAddress) == null)
                errors.Add(new ValidationResult("Email Address is not valid"));

            if (EmailDomainPolicy.ParseDomains(settings.AllowedEmailDomains).Count > 0)
            {
                if (string.IsNullOrWhiteSpace(input.EmailAddress))
                    errors.Add(new ValidationResult("Email Address is mandatory"));
                else if (!EmailDomainPolicy.IsAllowed(input.EmailAddress, settings.AllowedEmailDomains))
                    errors.Add(new ValidationResult("Registration is not allowed for this email domain"));
            }

            if (errors.Any())
                throw new AbpValidationException("Please correct the errors and try again", errors);
        }

        /// <summary>
        /// Resolves the configured Person entity type; null/empty means <see cref="Person"/>
        /// </summary>
        protected virtual Type ResolvePersonType(string personEntityType)
        {
            if (string.IsNullOrWhiteSpace(personEntityType))
                return typeof(Person);

            var type = _entityConfigurationStore.GetOrNull(personEntityType.Trim())?.EntityType;
            if (type == null || !typeof(Person).IsAssignableFrom(type) || type.IsAbstract || type.GetConstructor(Type.EmptyTypes) == null)
            {
                Logger.Error($"Self-registration Person entity type '{personEntityType}' is not a creatable Person type");
                throw new UserFriendlyException(MisconfiguredMessage);
            }

            return type;
        }

        protected virtual Person CreatePersonInstance(Type personType)
        {
            return (Person)Activator.CreateInstance(personType);
        }

        protected virtual async Task<List<Person>> FindMatchingPersonsAsync(string email, string mobile)
        {
            var hasEmail = !string.IsNullOrWhiteSpace(email);
            var hasMobile = !string.IsNullOrWhiteSpace(mobile);
            if (!hasEmail && !hasMobile)
                return new List<Person>();

            var emailLower = email?.ToLower();
            return await _personRepository.GetAll()
                .Where(p => hasEmail && p.EmailAddress1.ToLower() == emailLower || hasMobile && p.MobileNumber1 == mobile)
                .Take(2)
                .ToListAsync();
        }

        /// <summary>
        /// The registrant must show they control the email address or mobile number of the pre-registered Person:
        /// the one-time pin must be valid and must have been sent to that address/number.
        /// </summary>
        protected virtual async Task EnsureOwnershipVerifiedAsync(SelfRegistrationInput input, Person person)
        {
            var sentTo = await GetVerifiedOtpDestinationAsync(input);

            var provedEmail = sentTo != null && sentTo == NormalizeContact(input.EmailAddress) && sentTo == NormalizeContact(person.EmailAddress1);
            var provedMobile = sentTo != null && sentTo == NormalizeContact(input.MobileNumber) && sentTo == NormalizeContact(person.MobileNumber1);
            if (!provedEmail && !provedMobile)
                throw new UserFriendlyException(OwnershipNotVerifiedMessage);
        }

        /// <summary>
        /// A new account must prove the registrant controls the contact used to register: the email address for
        /// <see cref="SupportedRegistrationMethods.EmailAddress"/>, the mobile number for <see cref="SupportedRegistrationMethods.MobileNumber"/>,
        /// otherwise either. The registration forms verify it with a one-time pin (or email link) before calling Register;
        /// this enforces it on the server so a direct call can't register an address the caller doesn't own.
        /// </summary>
        protected virtual async Task EnsureContactVerifiedAsync(SelfRegistrationInput input, SupportedRegistrationMethods method)
        {
            var sentTo = await GetVerifiedOtpDestinationAsync(input, ContactNotVerifiedMessage);

            var provedEmail = sentTo == NormalizeContact(input.EmailAddress);
            var provedMobile = sentTo == NormalizeContact(input.MobileNumber);
            var proved = method switch
            {
                SupportedRegistrationMethods.EmailAddress => provedEmail,
                SupportedRegistrationMethods.MobileNumber => provedMobile,
                _ => provedEmail || provedMobile,
            };
            if (!proved)
                throw new UserFriendlyException(ContactNotVerifiedMessage);
        }

        /// <summary>
        /// Verifies the one-time pin in the input and returns the normalised address/number it was sent to; throws when it isn't valid
        /// </summary>
        private async Task<string> GetVerifiedOtpDestinationAsync(SelfRegistrationInput input, string failureMessage = OwnershipNotVerifiedMessage)
        {
            if (input.OtpOperationId == null || string.IsNullOrWhiteSpace(input.OtpPin))
                throw new UserFriendlyException(failureMessage);

            var otp = await _otpManager.GetAsync(input.OtpOperationId.Value);
            if (otp == null)
                throw new UserFriendlyException(failureMessage);

            var verification = await _otpManager.VerifyPinAsync(new VerifyPinInput { OperationId = input.OtpOperationId.Value, Pin = input.OtpPin });
            if (!verification.IsSuccess)
                throw new UserFriendlyException(failureMessage);

            return NormalizeContact(otp.SendTo) ?? throw new UserFriendlyException(failureMessage);
        }

        private static string NormalizeContact(string value)
        {
            return string.IsNullOrWhiteSpace(value)
                ? null
                : new string(value.Where(c => !char.IsWhiteSpace(c)).ToArray()).ToLowerInvariant();
        }

        protected virtual async Task AppointDefaultRolesAsync(Person person, List<string> roleNames)
        {
            if (roleNames == null || !roleNames.Any())
                return;

            foreach (var roleName in roleNames.Where(n => !string.IsNullOrWhiteSpace(n)).Select(n => n.Trim()).Distinct())
            {
                var role = await _roleRepository.FirstOrDefaultAsync(r => r.Name == roleName && r.IsLast);
                if (role == null)
                {
                    Logger.Warn($"Self-registration default role '{roleName}' was not found and was not appointed");
                    continue;
                }

                var alreadyAppointed = await _roleAppointmentRepository.GetAll().AnyAsync(a => a.Role == role && a.Person == person);
                if (!alreadyAppointed)
                    await _roleAppointmentRepository.InsertAsync(new ShaRoleAppointedPerson { Role = role, Person = person });
            }
        }

        protected virtual async Task<ShaUserRegistration> SaveRegistrationAsync(User user, UserManagementSettings settings)
        {
            var hasAdditionalForm = settings.AdditionalRegistrationInfo
                && !string.IsNullOrWhiteSpace(settings.AdditionalRegistrationInfoFormModule)
                && !string.IsNullOrWhiteSpace(settings.AdditionalRegistrationInfoFormName);

            var registration = new ShaUserRegistration
            {
                UserId = user.Id,
                UserNameOrEmailAddress = user.UserName,
                GoToUrlAfterRegistration = settings.GoToUrlAfterRegistration,
                AdditionalRegistrationInfoForm = hasAdditionalForm
                    ? new FormIdentifier(settings.AdditionalRegistrationInfoFormModule, settings.AdditionalRegistrationInfoFormName)
                    : null,
                IsComplete = !hasAdditionalForm,
            };

            await _userRegistrationRepository.InsertAsync(registration);
            return registration;
        }

        protected virtual async Task<long> GetSupportedPasswordResetMethodsAsync()
        {
            var securitySettings = await _securitySettings.SecuritySettings.GetValueAsync();
            long methods = 0;
            if (securitySettings.UseResetPasswordViaEmailLink)
                methods += (long)RefListPasswordResetMethods.EmailLink;
            if (securitySettings.UseResetPasswordViaSecurityQuestions)
                methods += (long)RefListPasswordResetMethods.SecurityQuestions;
            if (securitySettings.UseResetPasswordViaSmsOtp)
                methods += (long)RefListPasswordResetMethods.SmsOtp;
            return methods;
        }
    }
}
