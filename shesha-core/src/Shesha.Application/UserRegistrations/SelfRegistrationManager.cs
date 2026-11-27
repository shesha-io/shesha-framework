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
using Shesha.Exceptions;
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
    /// Anonymous self-registration: validates the request against the user management settings, creates the user account,
    /// creates or links the Person, appoints default roles and raises <see cref="UserSelfRegisteredEventData"/>.
    /// Methods are virtual so projects can register a subclass as <see cref="ISelfRegistrationManager"/> to customise individual steps.
    /// </summary>
    public class SelfRegistrationManager : DomainService, ISelfRegistrationManager, ITransientDependency
    {
        public const string RegistrationDisabledMessage = "Self-registration is not available.";
        public const string OwnershipNotVerifiedMessage = "Please verify your email address or mobile number with a one-time pin to link your account.";
        public const string ContactNotVerifiedMessage = "Please verify your email address or mobile number with a one-time pin before registering.";
        public const string EmailNotVerifiedMessage = "Please verify your email address with a one-time pin before registering.";
        public const string MisconfiguredMessage = "Self-registration is not configured correctly. Please contact the system administrator.";
        public const string InvalidCompletionTokenMessage = "This registration link is invalid or has expired. Please log in to finish your registration.";

        private readonly UserManager _userManager;
        private readonly IRepository<Person, Guid> _personRepository;
        private readonly IRepository<ShaRole, Guid> _roleRepository;
        private readonly IRepository<ShaRoleAppointedPerson, Guid> _roleAppointmentRepository;
        private readonly IRepository<ShaUserRegistration, Guid> _userRegistrationRepository;
        private readonly IEntityTypeConfigurationStore _entityConfigurationStore;
        private readonly IOtpManager _otpManager;
        private readonly ISecuritySettings _securitySettings;
        private readonly IConfigurationFrameworkRuntime _cfRuntime;
        private readonly IUserManagementSettings _userManagementSettings;

        public IEventBus EventBus { get; set; } = NullEventBus.Instance;

        /// <summary>
        /// Creates the self-registration manager
        /// </summary>
        public SelfRegistrationManager(
            UserManager userManager,
            IRepository<Person, Guid> personRepository,
            IRepository<ShaRole, Guid> roleRepository,
            IRepository<ShaRoleAppointedPerson, Guid> roleAppointmentRepository,
            IRepository<ShaUserRegistration, Guid> userRegistrationRepository,
            IEntityTypeConfigurationStore entityConfigurationStore,
            IOtpManager otpManager,
            ISecuritySettings securitySettings,
            IConfigurationFrameworkRuntime cfRuntime,
            IUserManagementSettings userManagementSettings)
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
            _userManagementSettings = userManagementSettings;
        }

        /// <summary>
        /// True when anonymous users may register: self-registration is allowed and a registration method is configured.
        /// Values saved before <see cref="UserManagementSettings.AllowSelfRegistration"/> existed (null) keep working when they have a
        /// registration method; the built-in default sets it to false.
        /// </summary>
        public static bool IsSelfRegistrationEnabled(UserManagementSettings? settings)
        {
            return settings != null
                && settings.SupportedRegistrationMethods != SupportedRegistrationMethods.None
                && (settings.AllowSelfRegistration ?? true);
        }

        /// <summary>
        /// True when registrants must provide a verified email address: <see cref="UserManagementSettings.RequireEmailAddress"/> is set,
        /// or the email address is the username
        /// </summary>
        public static bool IsEmailAddressRequired(UserManagementSettings settings)
        {
            return settings.RequireEmailAddress || settings.UserEmailAsUsername;
        }

        /// <summary>
        /// True when registrants must fill in the additional registration information form: it's switched on and the form is specified.
        /// Registration is refused while it's switched on without a form (see <see cref="RegisterAsync"/>).
        /// </summary>
        public static bool HasAdditionalRegistrationForm(UserManagementSettings settings)
        {
            return settings.AdditionalRegistrationInfo
                && !string.IsNullOrWhiteSpace(settings.AdditionalRegistrationInfoFormModule)
                && !string.IsNullOrWhiteSpace(settings.AdditionalRegistrationInfoFormName);
        }

        /// <inheritdoc />
        public virtual async Task<SelfRegistrationResult> RegisterAsync(SelfRegistrationInput input)
        {
            var settings = await _userManagementSettings.UserManagementSettings.GetValueAsync();
            if (settings == null || !IsSelfRegistrationEnabled(settings))
                throw new UserFriendlyException(RegistrationDisabledMessage);

            if (settings.AdditionalRegistrationInfo && !HasAdditionalRegistrationForm(settings))
            {
                // completing the registration without the form would skip a step the settings require
                Logger.Error("Self-registration requires additional registration information, but the form module or name isn't set");
                throw new UserFriendlyException(MisconfiguredMessage);
            }

            input.EmailAddress = input.EmailAddress?.Trim();
            input.MobileNumber = input.MobileNumber?.Trim();
            input.UserName = input.UserName?.Trim();

            ValidateInput(input, settings);
            await ValidateAccountDetailsAsync(input, settings);

            // Verify the one-time pins before looking up existing Persons or accounts, and match only verified contacts,
            // so the response can't be used to find out whether an email address or mobile number is registered.
            // Each pin is verified once, here: verification marks it as used, and the verified contacts are trusted from now on.
            // The registration forms don't verify the pins themselves, they pass them to Register.
            var checkedContacts = await CheckPinsBeforeVerificationAsync(input);
            EnsureRequiredEmailProved(input, checkedContacts, settings);

            // Only a registrant holding a valid pin gets this far, so the response can't be used to find out which usernames
            // exist. The pins aren't used up yet, so a taken username can be corrected and submitted again with the same pin.
            await EnsureUserNameAvailableAsync(input, settings);

            var verifiedContact = await EnsureContactVerifiedAsync(input);
            var verifiedEmail = await EnsureEmailVerifiedAsync(input);
            var verifiedContacts = new[] { verifiedContact, verifiedEmail }.Where(c => !string.IsNullOrWhiteSpace(c)).Select(c => c!).Distinct().ToList();
            KeepOnlyVerifiedContacts(input, verifiedContacts, settings);

            var personType = ResolvePersonType(settings.PersonEntityType);
            var matches = await FindMatchingPersonsAsync(input.EmailAddress, input.MobileNumber);
            if (matches.Count > 1)
                throw new UserFriendlyException(SelfRegistrationPlanner.AccountAlreadyExistsMessage);

            var existingPerson = matches.SingleOrDefault();
            var plan = SelfRegistrationPlanner.Plan(settings.CreationMode, existingPerson != null, existingPerson?.User != null);
            if (plan.Action == SelfRegistrationAction.Reject)
                throw new UserFriendlyException(plan.RejectionReason);

            if (plan.Action == SelfRegistrationAction.LinkToExisting)
                EnsureOwnershipVerified(verifiedContacts, existingPerson!);
            else
                EnsureRegistrationMethodVerified(input, verifiedContacts, settings.SupportedRegistrationMethods);

            // ValidateInput makes sure the username (or the email address used as the username) is provided
            var userName = (settings.UserEmailAsUsername ? input.EmailAddress : input.UserName)!;
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
                person = existingPerson!;
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

        /// <inheritdoc />
        public virtual async Task<string> IssueCompletionTokenAsync(ShaUserRegistration registration)
        {
            var token = Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLowerInvariant();
            registration.CompletionTokenHash = HashCompletionToken(token);
            registration.CompletionTokenExpiresOn = Clock.Now.Add(CompletionTokenLifetime);
            await _userRegistrationRepository.UpdateAsync(registration);
            return token;
        }

        /// <inheritdoc />
        public virtual async Task<ShaUserRegistration> GetRegistrationForCompletionAsync(long userId, string? token)
        {
            var registration = string.IsNullOrWhiteSpace(token)
                ? null
                : await _userRegistrationRepository.FirstOrDefaultAsync(e => e.UserId == userId);

            var isValid = registration != null
                && token != null
                && !registration.IsComplete
                && !string.IsNullOrWhiteSpace(registration.CompletionTokenHash)
                && registration.CompletionTokenExpiresOn > Clock.Now
                && CryptographicOperations.FixedTimeEquals(
                    Encoding.ASCII.GetBytes(registration.CompletionTokenHash),
                    Encoding.ASCII.GetBytes(HashCompletionToken(token.Trim())));

            if (!isValid)
                throw new UserFriendlyException(InvalidCompletionTokenMessage);

            return registration!;
        }

        /// <inheritdoc />
        public virtual async Task<string?> CompleteRegistrationAsync(long userId, string? token)
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

        /// <summary>
        /// Validates the mandatory fields and the email address (format and allowed domains); throws an <see cref="AbpValidationException"/> listing every problem
        /// </summary>
        protected virtual void ValidateInput(SelfRegistrationInput input, UserManagementSettings settings)
        {
            var errors = new List<ValidationResult>();

            if (string.IsNullOrWhiteSpace(input.FirstName))
                errors.Add(new ValidationResult("First Name is mandatory"));
            if (string.IsNullOrWhiteSpace(input.LastName))
                errors.Add(new ValidationResult("Last Name is mandatory"));

            if (!settings.UserEmailAsUsername && string.IsNullOrWhiteSpace(input.UserName))
                errors.Add(new ValidationResult("Username is mandatory"));

            if (string.IsNullOrWhiteSpace(input.EmailAddress))
            {
                if (IsEmailAddressRequired(settings))
                    errors.Add(new ValidationResult("Email Address is mandatory"));
            }
            else if (string.IsNullOrWhiteSpace(EmailDomainPolicy.GetDomain(input.EmailAddress)) || input.EmailAddress.Any(char.IsWhiteSpace))
                // whitespace is refused rather than removed, so the address saved as confirmed is exactly the one that was verified
                errors.Add(new ValidationResult("Email Address is not valid"));
            else if (!EmailDomainPolicy.IsAllowed(input.EmailAddress, settings.AllowedEmailDomains))
                errors.Add(new ValidationResult("Registration is not allowed for this email domain"));

            if (errors.Any())
                throw new AbpValidationException("Please correct the errors and try again", errors);
        }

        /// <summary>
        /// Checks the password and the characters of the username before the one-time pins are checked. Verifying a pin uses it
        /// up, so these common mistakes are reported while the registrant can still correct them and submit again with the same pin.
        /// Nothing here depends on existing accounts, so it can't reveal whether a username or email address is registered: see
        /// <see cref="EnsureUserNameAvailableAsync"/>.
        /// </summary>
        protected virtual async Task ValidateAccountDetailsAsync(SelfRegistrationInput input, UserManagementSettings settings)
        {
            var errors = new List<ValidationResult>();

            if (string.IsNullOrWhiteSpace(input.Password))
                errors.Add(new ValidationResult("Password is mandatory"));
            if (string.IsNullOrWhiteSpace(input.PasswordConfirmation))
                errors.Add(new ValidationResult("Password Confirmation is mandatory"));
            if (!string.IsNullOrWhiteSpace(input.Password) && !string.IsNullOrWhiteSpace(input.PasswordConfirmation) && input.Password != input.PasswordConfirmation)
                errors.Add(new ValidationResult("Password Confirmation must be the same as Password"));

            if (errors.Any())
                throw new AbpValidationException("Please correct the errors and try again", errors);

            await _userManager.InitializeOptionsAsync(CurrentUnitOfWork.GetTenantId());

            // the characters Identity allows in a username, which it only checks when the user is created, after the pins are used up
            var userName = settings.UserEmailAsUsername ? input.EmailAddress : input.UserName;
            var allowedCharacters = _userManager.Options.User.AllowedUserNameCharacters;
            if (!string.IsNullOrEmpty(allowedCharacters) && !string.IsNullOrEmpty(userName) && userName.Any(c => !allowedCharacters.Contains(c)))
            {
                var message = settings.UserEmailAsUsername
                    ? "Email Address contains characters that can't be used in a username"
                    : $"Username can only contain letters, digits and these characters: {new string(allowedCharacters.Where(c => !char.IsLetterOrDigit(c)).ToArray())}";
                throw new AbpValidationException("Please correct the errors and try again", new List<ValidationResult> { new ValidationResult(message) });
            }

            // the configured password policy
            foreach (var validator in _userManager.PasswordValidators)
            {
                var result = await validator.ValidateAsync(_userManager, new User(), input.Password);
                if (!result.Succeeded)
                    throw new AbpValidationException("Please correct the errors and try again", result.Errors.Select(e => new ValidationResult(e.Description)).ToList());
            }
        }

        /// <summary>
        /// Resolves the configured Person entity type; null/empty means <see cref="Person"/>
        /// </summary>
        protected virtual Type ResolvePersonType(string? personEntityType)
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

        /// <summary>
        /// Creates an instance of the configured Person entity type. Override to initialise project-specific properties.
        /// </summary>
        protected virtual Person CreatePersonInstance(Type personType)
        {
            return (Person)(Activator.CreateInstance(personType) ?? throw new InvalidOperationException($"Can't create an instance of {personType.FullName}"));
        }

        /// <summary>
        /// Finds Persons whose email address (case-insensitive) or mobile number (ignoring spaces) matches. Returns at most two,
        /// which is enough to tell whether the match is ambiguous.
        /// </summary>
        protected virtual async Task<List<Person>> FindMatchingPersonsAsync(string? email, string? mobile)
        {
            var hasEmail = !string.IsNullOrWhiteSpace(email);
            var hasMobile = !string.IsNullOrWhiteSpace(mobile);
            if (!hasEmail && !hasMobile)
                return new List<Person>();

            // Mobile numbers are compared with spaces removed on both sides, so "082 123 4567" matches "0821234567".
            // Other formats (e.g. +27 vs a leading 0) aren't reconciled.
            var emailLower = email?.ToLower();
            var mobileCompact = hasMobile ? mobile!.Replace(" ", "") : null;
            return await (await _personRepository.GetAllAsync())
                .Where(p => hasEmail && p.EmailAddress1 != null && p.EmailAddress1.ToLower() == emailLower || hasMobile && p.MobileNumber1 != null && p.MobileNumber1.Replace(" ", "") == mobileCompact)
                .Take(2)
                .ToListAsync();
        }

        /// <summary>
        /// The registrant must prove they control the email address or mobile number they register with: the one-time pin
        /// (or email link) must be valid and must have been sent to one of them. The registration forms pass the pin to
        /// Register, which verifies it here, so a direct call can't register an address the caller doesn't own.
        /// </summary>
        /// <returns>The normalised email address or mobile number the one-time pin was sent to</returns>
        protected virtual async Task<string> EnsureContactVerifiedAsync(SelfRegistrationInput input)
        {
            return await VerifyOtpSentToAsync(input.OtpOperationId, input.OtpPin, ContactNotVerifiedMessage, input.EmailAddress, input.MobileNumber);
        }

        /// <summary>
        /// Verifies the optional second one-time pin, which proves the email address when the registrant verified their mobile
        /// number with the first one (for example when the email address is the username). It must have been sent to
        /// <see cref="SelfRegistrationInput.EmailAddress"/>.
        /// </summary>
        /// <returns>The normalised email address, or null when no second pin was supplied</returns>
        protected virtual async Task<string?> EnsureEmailVerifiedAsync(SelfRegistrationInput input)
        {
            if (input.EmailOtpOperationId == null && string.IsNullOrWhiteSpace(input.EmailOtpPin))
                return null;

            // the same pin in both fields is one proof, already used up by EnsureContactVerifiedAsync: it only has to have been
            // sent to the email address
            if (RepeatsFirstPin(input))
                return (await GetOtpSentToAsync(input.EmailOtpOperationId, input.EmailOtpPin, EmailNotVerifiedMessage, input.EmailAddress)).SentTo;

            return await VerifyOtpSentToAsync(input.EmailOtpOperationId, input.EmailOtpPin, EmailNotVerifiedMessage, input.EmailAddress);
        }

        /// <summary>
        /// A new account must be registered with the configured registration method: a verified contact must be the email
        /// address for <see cref="SupportedRegistrationMethods.EmailAddress"/>, the mobile number for
        /// <see cref="SupportedRegistrationMethods.MobileNumber"/>, otherwise either. Either one-time pin can satisfy it.
        /// </summary>
        protected virtual void EnsureRegistrationMethodVerified(SelfRegistrationInput input, IReadOnlyCollection<string> verifiedContacts, SupportedRegistrationMethods method)
        {
            var email = NormalizeContact(input.EmailAddress);
            var mobile = NormalizeContact(input.MobileNumber);
            var provedEmail = !string.IsNullOrWhiteSpace(email) && verifiedContacts.Contains(email);
            var provedMobile = !string.IsNullOrWhiteSpace(mobile) && verifiedContacts.Contains(mobile);
            var proved = method switch
            {
                SupportedRegistrationMethods.EmailAddress => provedEmail,
                SupportedRegistrationMethods.MobileNumber => provedMobile,
                _ => provedEmail || provedMobile,
            };
            if (!proved)
                throw new VerificationFailedException(ContactNotVerifiedMessage);
        }

        /// <summary>
        /// Linking is only allowed when a verified contact is the pre-registered Person's own email address or mobile number.
        /// Persons are matched on verified contacts only, so this is a safeguard for overrides of <see cref="FindMatchingPersonsAsync"/>.
        /// </summary>
        protected virtual void EnsureOwnershipVerified(IReadOnlyCollection<string> verifiedContacts, Person person)
        {
            if (!verifiedContacts.Contains(NormalizeContact(person.EmailAddress1)) && !verifiedContacts.Contains(NormalizeContact(person.MobileNumber1)))
                throw new VerificationFailedException(OwnershipNotVerifiedMessage);
        }

        /// <summary>
        /// Only the contacts a one-time pin was sent to are proven, so any other one isn't saved: new users are created with their
        /// email address confirmed, both contacts can be used to reset the password, and registration refuses a contact that already
        /// belongs to a Person. Saving an unverified contact would let a registrant claim someone else's email address or mobile number
        /// and stop its owner from registering.
        /// The registrant can add the other contact after registering. When the email address can't be left out
        /// (<see cref="IsEmailAddressRequired"/>), registration is refused instead, unless the email address was verified with its own
        /// one-time pin (<see cref="SelfRegistrationInput.EmailOtpOperationId"/>).
        /// </summary>
        protected virtual void KeepOnlyVerifiedContacts(SelfRegistrationInput input, IReadOnlyCollection<string> verifiedContacts, UserManagementSettings settings)
        {
            if (!string.IsNullOrWhiteSpace(input.EmailAddress) && !verifiedContacts.Contains(NormalizeContact(input.EmailAddress)))
            {
                if (IsEmailAddressRequired(settings))
                    throw new VerificationFailedException(EmailNotVerifiedMessage);

                input.EmailAddress = null;
            }

            if (!string.IsNullOrWhiteSpace(input.MobileNumber) && !verifiedContacts.Contains(NormalizeContact(input.MobileNumber)))
                input.MobileNumber = null;
        }

        /// <summary>
        /// Marks a one-time pin that <see cref="CheckPinsBeforeVerificationAsync"/> accepted as used. It must have been sent to
        /// one of the specified contacts. Returns the normalised address/number it was sent to; throws a
        /// <see cref="VerificationFailedException"/> when it isn't valid. The destination and the pin are checked before the pin
        /// is used up, so a pin sent to another contact, or one that has just expired, isn't used up.
        /// </summary>
        private async Task<string> VerifyOtpSentToAsync(Guid? operationId, string? pin, string failureMessage, params string?[] contacts)
        {
            var (otp, sentTo) = await GetOtpSentToAsync(operationId, pin, failureMessage, contacts);

            // The pin proves the registrant owns the email address or mobile number, so it's checked here as well:
            // ConsumePinAsync accepts any pin when the IgnoreOtpValidation setting is on
            if (!IsPinValid(otp, pin!))
                throw new VerificationFailedException(failureMessage);

            // CheckPinsBeforeVerificationAsync counted the attempt; ConsumePinAsync checks the pin again and marks it as used
            var verification = await _otpManager.ConsumePinAsync(new VerifyPinInput { OperationId = operationId!.Value, Pin = pin! });
            if (!verification.IsSuccess)
                throw new VerificationFailedException(failureMessage);

            return sentTo;
        }

        /// <summary>
        /// Checks the pin, and the email pin when one is supplied, before either is used up: otherwise a correct first pin would
        /// be used up by a registration that then fails on a wrong second pin or a taken username, and the registrant couldn't
        /// just correct it. Each check counts an attempt before the result is known (<see cref="IOtpManager.CheckPinAsync"/>),
        /// so concurrent requests can't compare more pins than the attempt limit allows.
        /// </summary>
        /// <returns>The normalised contacts the pins were sent to</returns>
        private async Task<List<string>> CheckPinsBeforeVerificationAsync(SelfRegistrationInput input)
        {
            var contacts = new List<string>
            {
                await CheckPinBeforeVerificationAsync(input.OtpOperationId, input.OtpPin, ContactNotVerifiedMessage, input.EmailAddress, input.MobileNumber),
            };

            if (RepeatsFirstPin(input))
                // one proof, checked above (and counted once): it only has to have been sent to the email address
                contacts.Add((await GetOtpSentToAsync(input.EmailOtpOperationId, input.EmailOtpPin, EmailNotVerifiedMessage, input.EmailAddress)).SentTo);
            else if (input.EmailOtpOperationId != null || !string.IsNullOrWhiteSpace(input.EmailOtpPin))
                contacts.Add(await CheckPinBeforeVerificationAsync(input.EmailOtpOperationId, input.EmailOtpPin, EmailNotVerifiedMessage, input.EmailAddress));

            return contacts;
        }

        /// <summary>
        /// The email pin is the same one-time pin as the first one (an email OTP entered in both fields)
        /// </summary>
        private static bool RepeatsFirstPin(SelfRegistrationInput input)
        {
            return input.EmailOtpOperationId != null && input.EmailOtpOperationId == input.OtpOperationId && input.EmailOtpPin == input.OtpPin;
        }

        /// <summary>
        /// When the email address can't be left out (<see cref="IsEmailAddressRequired"/>), one of the pins must prove it.
        /// <see cref="KeepOnlyVerifiedContacts"/> refuses the registration otherwise, but only after the pins are used up; this
        /// refuses it first, so the registrant can add the email pin and submit again with the same mobile pin.
        /// </summary>
        private static void EnsureRequiredEmailProved(SelfRegistrationInput input, IReadOnlyCollection<string> checkedContacts, UserManagementSettings settings)
        {
            if (IsEmailAddressRequired(settings) && !string.IsNullOrWhiteSpace(input.EmailAddress) && !checkedContacts.Contains(NormalizeContact(input.EmailAddress)))
                throw new VerificationFailedException(EmailNotVerifiedMessage);
        }

        /// <summary>
        /// Refuses a username that's already taken. Called once the pins are known to be valid but before they're used up, so
        /// only a registrant who proved their email address or mobile number can find out whether a username exists, and they can
        /// correct it and submit again with the same pin. Not checked when the email address is the username: that would reveal
        /// whether the address is registered, and registration refuses it later like any other existing contact.
        /// </summary>
        protected virtual async Task EnsureUserNameAvailableAsync(SelfRegistrationInput input, UserManagementSettings settings)
        {
            if (!settings.UserEmailAsUsername && !string.IsNullOrWhiteSpace(input.UserName) && await _userManager.FindByNameAsync(input.UserName) != null)
                throw new AbpValidationException("Please correct the errors and try again", new List<ValidationResult> { new ValidationResult("User with the same username already exists") });
        }

        private async Task<string> CheckPinBeforeVerificationAsync(Guid? operationId, string? pin, string failureMessage, params string?[] contacts)
        {
            var (otp, sentTo) = await GetOtpSentToAsync(operationId, pin, failureMessage, contacts);

            // CheckPinAsync counts the attempt and checks the pin like VerifyPinAsync (used, attempt limit, expiry) without using
            // it up; the pin is compared here as well because CheckPinAsync accepts any pin when the IgnoreOtpValidation setting is on
            var check = await _otpManager.CheckPinAsync(new VerifyPinInput { OperationId = operationId!.Value, Pin = pin! });
            if (!check.IsSuccess || !IsPinValid(otp, pin!))
                throw new VerificationFailedException(failureMessage);

            return sentTo;
        }

        /// <summary>
        /// Returns the OTP, and the normalised contact it was sent to, when a pin was supplied and the OTP was sent to one of
        /// the contacts; otherwise throws
        /// </summary>
        private async Task<(IOtpDto Otp, string SentTo)> GetOtpSentToAsync(Guid? operationId, string? pin, string failureMessage, params string?[] contacts)
        {
            if (operationId == null || string.IsNullOrWhiteSpace(pin))
                throw new VerificationFailedException(failureMessage);

            var otp = await _otpManager.GetOrNullAsync(operationId.Value);
            var sentTo = NormalizeContact(otp?.SendTo);
            if (otp == null || sentTo == null || !contacts.Select(NormalizeContact).Contains(sentTo))
                throw new VerificationFailedException(failureMessage);

            return (otp, sentTo);
        }

        /// <summary>
        /// Same comparison, clock and expiry rule as OtpManager.VerifyPinAsync: an OTP without an expiry doesn't expire
        /// </summary>
        private static bool IsPinValid(IOtpDto otp, string pin)
        {
            return (otp.ExpiresOn == null || otp.ExpiresOn >= DateTime.Now) && CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(otp.Pin), Encoding.UTF8.GetBytes(pin));
        }

        private static string? NormalizeContact(string? value)
        {
            return string.IsNullOrWhiteSpace(value)
                ? null
                : new string(value.Where(c => !char.IsWhiteSpace(c)).ToArray()).ToLowerInvariant();
        }

        /// <summary>
        /// Appoints the configured default roles to the Person. Roles that don't exist are logged and skipped.
        /// </summary>
        protected virtual async Task AppointDefaultRolesAsync(Person person, List<string>? roleNames)
        {
            if (roleNames == null || !roleNames.Any())
                return;

            foreach (var roleName in roleNames.Where(n => !string.IsNullOrWhiteSpace(n)).Select(n => n.Trim()).Distinct())
            {
                var role = await _roleRepository.FirstOrDefaultAsync(r => r.Name == roleName);
                if (role == null)
                {
                    Logger.Warn($"Self-registration default role '{roleName}' was not found and was not appointed");
                    continue;
                }

                var alreadyAppointed = await (await _roleAppointmentRepository.GetAllAsync()).AnyAsync(a => a.Role == role && a.Person == person);
                if (!alreadyAppointed)
                    await _roleAppointmentRepository.InsertAsync(new ShaRoleAppointedPerson { Role = role, Person = person });
            }
        }

        /// <summary>
        /// Records the registration. It's complete straight away unless the settings require an additional registration information form.
        /// </summary>
        protected virtual async Task<ShaUserRegistration> SaveRegistrationAsync(User user, UserManagementSettings settings)
        {
            var hasAdditionalForm = HasAdditionalRegistrationForm(settings);

            var registration = new ShaUserRegistration
            {
                UserId = user.Id,
                UserNameOrEmailAddress = user.UserName,
                GoToUrlAfterRegistration = settings.GoToUrlAfterRegistration,
                AdditionalRegistrationInfoForm = hasAdditionalForm
                    ? new FormIdentifier(settings.AdditionalRegistrationInfoFormModule, settings.AdditionalRegistrationInfoFormName!)
                    : null,
                IsComplete = !hasAdditionalForm,
            };

            await _userRegistrationRepository.InsertAsync(registration);
            return registration;
        }

        /// <summary>
        /// Password reset methods to enable on the new user: the methods enabled in the security settings
        /// </summary>
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
