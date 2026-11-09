using Abp.Authorization;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.EntityHistory;
using Abp.Events.Bus;
using Abp.Runtime.Validation;
using Abp.Timing;
using Abp.UI;
using Castle.MicroKernel.Registration;
using Microsoft.IdentityModel.Tokens;
using Moq;
using NHibernate.Linq;
using Shesha.Authentication.JwtBearer;
using Shesha.Authorization;
using Shesha.Authorization.Users;
using Shesha.ConfigurationItems;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.Domain.Enums;
using Shesha.Models.TokenAuth;
using Shesha.Otp;
using Shesha.Otp.Dto;
using Shesha.Reflection;
using Shesha.Settings;
using Shesha.UserManagements.Configurations;
using Shesha.UserRegistrations;
using Shesha.UserRegistrations.Dto;
using Shouldly;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.UserRegistrations
{
    /// <summary>
    /// End-to-end self-registration through <see cref="UserRegistrationAppService"/> against the test database.
    /// Each test uses its own front-end application key and unique email addresses so tests don't interfere.
    /// </summary>
    public class SelfRegistration_Tests : SheshaNhTestBase, IAsyncLifetime
    {
        private const string Password = "Pass!word123";

        private readonly IUnitOfWorkManager _uowManager;
        private readonly IRepository<Person, Guid> _personRepository;
        private readonly IRepository<User, long> _userRepository;
        private readonly List<string> _appKeys = new();
        private readonly Dictionary<Guid, OtpDto> _otps = new();

        public SelfRegistration_Tests()
        {
            _uowManager = Resolve<IUnitOfWorkManager>();
            _personRepository = Resolve<IRepository<Person, Guid>>();
            _userRepository = Resolve<IRepository<User, long>>();

            // in-memory OTP manager: tests decide which pins were "sent" to which address
            var otpManager = new Mock<IOtpManager>();
            otpManager.Setup(m => m.GetAsync(It.IsAny<Guid>()))
                .Returns<Guid>(id => Task.FromResult<IOtpDto>(_otps.TryGetValue(id, out var otp) ? otp : null));
            otpManager.Setup(m => m.VerifyPinAsync(It.IsAny<VerifyPinInput>()))
                .Returns<VerifyPinInput>(input => Task.FromResult<IVerifyPinResponse>(
                    _otps.TryGetValue(input.OperationId, out var otp) && otp.Pin == input.Pin && otp.ExpiresOn > DateTime.Now
                        ? VerifyPinResponse.Success()
                        : VerifyPinResponse.Failed("Wrong one time pin")));
            LocalIocManager.IocContainer.Register(Component.For<IOtpManager>().Instance(otpManager.Object).IsDefault().Named("test-otp-manager"));
        }

        #region Settings and access

        [Fact]
        public async Task Registration_is_refused_when_self_registration_is_disabledAsync()
        {
            var app = await CreateAppAsync(new UserManagementSettings { AllowSelfRegistration = false, SupportedRegistrationMethods = SupportedRegistrationMethods.EmailAddress });

            var ex = await Should.ThrowAsync<UserFriendlyException>(() => RegisterAsync(app, NewInput()));

            ex.Message.ShouldBe(SelfRegistrationManager.RegistrationDisabledMessage);
        }

        [Fact]
        public async Task Registration_is_refused_when_registration_method_is_NoneAsync()
        {
            var app = await CreateAppAsync(new UserManagementSettings { AllowSelfRegistration = true, SupportedRegistrationMethods = SupportedRegistrationMethods.None });

            await Should.ThrowAsync<UserFriendlyException>(() => RegisterAsync(app, NewInput()));
            (await GetPublicSettingsAsync(app)).IsSelfRegistrationEnabled.ShouldBeFalse();
        }

        [Fact]
        public async Task Settings_are_per_front_end_applicationAsync()
        {
            var publicPortal = await CreateAppAsync(EnabledSettings());
            var adminPortal = await CreateAppAsync(new UserManagementSettings { AllowSelfRegistration = false, SupportedRegistrationMethods = SupportedRegistrationMethods.EmailAddress });

            (await GetPublicSettingsAsync(publicPortal)).IsSelfRegistrationEnabled.ShouldBeTrue();
            var adminSettings = await GetPublicSettingsAsync(adminPortal);
            adminSettings.IsSelfRegistrationEnabled.ShouldBeFalse();
            adminSettings.SupportedRegistrationMethods.ShouldBe(SupportedRegistrationMethods.None, "the login form hides the Register link when the method is None");

            (await RegisterAsync(publicPortal, NewInput())).UserId.ShouldBeGreaterThan(0);
            await Should.ThrowAsync<UserFriendlyException>(() => RegisterAsync(adminPortal, NewInput()));
        }

        [Fact]
        public async Task Application_without_its_own_value_falls_back_to_the_global_valueAsync()
        {
            var provider = Resolve<ISelfRegistrationSettingsProvider>();
            var appWithoutValue = await CreateAppAsync(settings: null);
            var appWithValue = await CreateAppAsync(new UserManagementSettings { AllowSelfRegistration = false, SupportedRegistrationMethods = SupportedRegistrationMethods.EmailAddress, GoToUrlAfterRegistration = "/app-specific" });

            await WithGlobalSettingsAsync(new UserManagementSettings { AllowSelfRegistration = true, SupportedRegistrationMethods = SupportedRegistrationMethods.MobileNumber, GoToUrlAfterRegistration = "/global" }, async () =>
            {
                var fallback = await WithUowAsync(() => provider.GetSettingsAsync(appWithoutValue));
                fallback.IsSelfRegistrationEnabled.ShouldBeTrue();
                fallback.Settings.GoToUrlAfterRegistration.ShouldBe("/global");

                var own = await WithUowAsync(() => provider.GetSettingsAsync(appWithValue));
                own.IsSelfRegistrationEnabled.ShouldBeFalse();
                own.Settings.GoToUrlAfterRegistration.ShouldBe("/app-specific");
            });
        }

        #endregion

        #region Creating accounts

        [Fact]
        public async Task Registration_creates_user_person_registration_record_and_raises_eventAsync()
        {
            var app = await CreateAppAsync(EnabledSettings(s =>
            {
                s.UserEmailAsUsername = true;
                s.GoToUrlAfterRegistration = "/welcome";
                s.AdditionalRegistrationInfo = true;
                s.AdditionalRegistrationInfoFormModule = "Shesha";
                s.AdditionalRegistrationInfoFormName = "extra-info";
            }));
            var input = NewInput();
            var events = new List<UserSelfRegisteredEventData>();
            using var _ = Resolve<IEventBus>().Register<UserSelfRegisteredEventData>(e => events.Add(e));

            var result = await RegisterAsync(app, input);

            result.LinkedToExistingPerson.ShouldBeFalse();
            result.GoToUrlAfterRegistration.ShouldBe("/welcome");
            result.RequiresAdditionalRegistrationInfo.ShouldBeTrue();
            result.AdditionalRegistrationInfoFormName.ShouldBe("extra-info");

            await WithUowAsync(async () =>
            {
                var user = await _userRepository.GetAsync(result.UserId);
                user.UserName.ShouldBe(input.EmailAddress, "UserEmailAsUsername is on");
                user.IsActive.ShouldBeTrue();

                var person = await _personRepository.GetAll().SingleAsync(p => p.Id == result.PersonId);
                person.User.Id.ShouldBe(user.Id);
                person.FirstName.ShouldBe(input.FirstName);
                person.EmailAddress1.ShouldBe(input.EmailAddress);
                person.MobileNumber1.ShouldBeNull("only the email address was verified");

                var registration = await Resolve<IRepository<ShaUserRegistration, Guid>>().GetAll().SingleAsync(r => r.UserId == user.Id);
                registration.IsComplete.ShouldBeFalse();
            });

            events.Count.ShouldBe(1);
            events[0].User.Id.ShouldBe(result.UserId);
            events[0].Person.Id.ShouldBe(result.PersonId);
            events[0].FrontEndApplication.ShouldBe(app);
        }

        [Fact]
        public async Task Username_is_required_when_email_is_not_the_usernameAsync()
        {
            var app = await CreateAppAsync(EnabledSettings(s => s.UserEmailAsUsername = false));
            var input = NewInput();
            input.UserName = null;

            await Should.ThrowAsync<AbpValidationException>(() => RegisterAsync(app, input));
        }

        [Fact]
        public async Task Default_roles_are_appointed_to_the_new_personAsync()
        {
            var roleName = await CreateRoleAsync();
            var app = await CreateAppAsync(EnabledSettings(s => s.DefaultRoles = new List<string> { roleName, "role-that-does-not-exist" }));

            var result = await RegisterAsync(app, NewInput());

            await WithUowAsync(async () =>
            {
                var roles = await Resolve<IRepository<ShaRoleAppointedPerson, Guid>>().GetAll()
                    .Where(a => a.Person.Id == result.PersonId)
                    .Select(a => a.Role.Name)
                    .ToListAsync();
                roles.ShouldBe(new List<string> { roleName }, "missing roles are skipped, not fatal");
            });
        }

        [Fact]
        public async Task Configured_person_entity_type_must_be_a_PersonAsync()
        {
            var app = await CreateAppAsync(EnabledSettings(s => s.PersonEntityType = typeof(Shesha.Domain.ShaRole).FullName));

            var ex = await Should.ThrowAsync<UserFriendlyException>(() => RegisterAsync(app, NewInput()));

            ex.Message.ShouldBe(SelfRegistrationManager.MisconfiguredMessage);
        }

        [Fact]
        public async Task Configured_person_entity_type_is_usedAsync()
        {
            var app = await CreateAppAsync(EnabledSettings(s => s.PersonEntityType = typeof(Person).FullName));

            var result = await RegisterAsync(app, NewInput());

            result.PersonId.ShouldNotBe(Guid.Empty);
        }

        [Theory]
        [InlineData("allowed.test", true)]
        [InlineData("not-allowed.test", false)]
        public async Task Allowed_email_domains_are_enforcedAsync(string domain, bool allowed)
        {
            var app = await CreateAppAsync(EnabledSettings(s => s.AllowedEmailDomains = "allowed.test; other.test"));
            var input = NewInput(domain);

            if (allowed)
                (await RegisterAsync(app, input)).UserId.ShouldBeGreaterThan(0);
            else
                await Should.ThrowAsync<AbpValidationException>(() => RegisterAsync(app, input));
        }

        #endregion

        #region Contact verification for new accounts

        [Fact]
        public async Task A_new_account_requires_a_verified_otpAsync()
        {
            var app = await CreateAppAsync(EnabledSettings());
            var input = NewInput();
            RemoveOtp(input);

            var ex = await Should.ThrowAsync<UserFriendlyException>(() => RegisterAsync(app, input));

            ex.Message.ShouldBe(SelfRegistrationManager.ContactNotVerifiedMessage);
            (await UserExistsAsync(input.UserName)).ShouldBeFalse();
        }

        [Fact]
        public async Task A_new_account_rejects_a_wrong_pinAsync()
        {
            var app = await CreateAppAsync(EnabledSettings());
            var input = NewInput();
            input.OtpPin = "000000";

            var ex = await Should.ThrowAsync<UserFriendlyException>(() => RegisterAsync(app, input));

            ex.Message.ShouldBe(SelfRegistrationManager.ContactNotVerifiedMessage);
            (await UserExistsAsync(input.UserName)).ShouldBeFalse();
        }

        [Fact]
        public async Task A_new_account_rejects_an_otp_sent_to_a_different_email_addressAsync()
        {
            var app = await CreateAppAsync(EnabledSettings());
            var input = NewInput();
            // the caller verified their own address, then submits an address they don't own
            ProvideOtp(input, sentTo: $"caller-{Guid.NewGuid():N}@selfreg.test");

            var ex = await Should.ThrowAsync<UserFriendlyException>(() => RegisterAsync(app, input));

            ex.Message.ShouldBe(SelfRegistrationManager.ContactNotVerifiedMessage);
            (await UserExistsAsync(input.UserName)).ShouldBeFalse();
        }

        [Fact]
        public async Task Mobile_registration_requires_the_mobile_number_to_be_verifiedAsync()
        {
            var app = await CreateAppAsync(EnabledSettings(s => s.SupportedRegistrationMethods = SupportedRegistrationMethods.MobileNumber));

            var verifiedEmailOnly = NewInput();
            var ex = await Should.ThrowAsync<UserFriendlyException>(() => RegisterAsync(app, verifiedEmailOnly));
            ex.Message.ShouldBe(SelfRegistrationManager.ContactNotVerifiedMessage);

            var verifiedMobile = NewInput();
            ProvideOtp(verifiedMobile, sentTo: verifiedMobile.MobileNumber);
            (await RegisterAsync(app, verifiedMobile)).UserId.ShouldBeGreaterThan(0);
        }

        [Fact]
        public async Task Email_registration_does_not_save_an_unverified_mobile_numberAsync()
        {
            var app = await CreateAppAsync(EnabledSettings());
            var input = NewInput();

            var result = await RegisterAsync(app, input);

            await WithUowAsync(async () =>
            {
                var user = await _userRepository.GetAsync(result.UserId);
                user.EmailAddress.ShouldBe(input.EmailAddress);
                user.PhoneNumber.ShouldBeNullOrEmpty();

                var person = await _personRepository.GetAll().SingleAsync(p => p.Id == result.PersonId);
                person.EmailAddress1.ShouldBe(input.EmailAddress);
                person.MobileNumber1.ShouldBeNull();
            });
        }

        [Fact]
        public async Task Mobile_registration_does_not_save_an_unverified_email_addressAsync()
        {
            var app = await CreateAppAsync(EnabledSettings(s => s.SupportedRegistrationMethods = SupportedRegistrationMethods.MobileNumber));
            var input = NewInput();
            ProvideOtp(input, sentTo: input.MobileNumber);

            var result = await RegisterAsync(app, input);

            await WithUowAsync(async () =>
            {
                var user = await _userRepository.GetAsync(result.UserId);
                user.EmailAddress.ShouldBeNullOrEmpty();
                user.PhoneNumber.ShouldBe(input.MobileNumber);

                var person = await _personRepository.GetAll().SingleAsync(p => p.Id == result.PersonId);
                person.EmailAddress1.ShouldBeNull();
                person.MobileNumber1.ShouldBe(input.MobileNumber);
            });
        }

        [Fact]
        public async Task An_unverified_email_address_does_not_block_its_owner_from_registeringAsync()
        {
            var mobileApp = await CreateAppAsync(EnabledSettings(s => s.SupportedRegistrationMethods = SupportedRegistrationMethods.MobileNumber));
            var emailApp = await CreateAppAsync(EnabledSettings());
            var squatter = NewInput();
            var ownersEmail = squatter.EmailAddress;
            ProvideOtp(squatter, sentTo: squatter.MobileNumber);
            await RegisterAsync(mobileApp, squatter);

            var owner = NewInput();
            owner.EmailAddress = ownersEmail;
            ProvideOtp(owner, sentTo: owner.EmailAddress);

            (await RegisterAsync(emailApp, owner)).UserId.ShouldBeGreaterThan(0);
        }

        [Fact]
        public async Task Mobile_registration_is_refused_when_an_unverified_email_is_the_usernameAsync()
        {
            var app = await CreateAppAsync(EnabledSettings(s =>
            {
                s.SupportedRegistrationMethods = SupportedRegistrationMethods.MobileNumber;
                s.UserEmailAsUsername = true;
            }));
            var input = NewInput();
            ProvideOtp(input, sentTo: input.MobileNumber);

            var ex = await Should.ThrowAsync<UserFriendlyException>(() => RegisterAsync(app, input));
            ex.Message.ShouldBe(SelfRegistrationManager.EmailNotVerifiedMessage);
            (await UserExistsAsync(input.EmailAddress)).ShouldBeFalse();
        }

        [Fact]
        public async Task Mobile_registration_is_refused_when_email_domains_are_restricted_and_the_email_is_unverifiedAsync()
        {
            var app = await CreateAppAsync(EnabledSettings(s =>
            {
                s.SupportedRegistrationMethods = SupportedRegistrationMethods.MobileNumber;
                s.AllowedEmailDomains = "selfreg.test";
            }));
            var input = NewInput();
            ProvideOtp(input, sentTo: input.MobileNumber);

            var ex = await Should.ThrowAsync<UserFriendlyException>(() => RegisterAsync(app, input));
            ex.Message.ShouldBe(SelfRegistrationManager.EmailNotVerifiedMessage);
        }

        #endregion

        #region Creation modes and account takeover protection

        [Fact]
        public async Task AlwaysCreateNew_refuses_an_email_that_belongs_to_an_existing_personAsync()
        {
            var app = await CreateAppAsync(EnabledSettings(s => s.CreationMode = RefListSelfRegistrationCreationMode.AlwaysCreateNew));
            var input = NewInput();
            await CreatePreRegisteredPersonAsync(input.EmailAddress, mobile: null);

            var ex = await Should.ThrowAsync<UserFriendlyException>(() => RegisterAsync(app, input));

            ex.Message.ShouldBe(SelfRegistrationPlanner.AccountAlreadyExistsMessage);
        }

        [Fact]
        public async Task MustAlreadyExist_refuses_people_who_are_not_pre_registeredAsync()
        {
            var app = await CreateAppAsync(EnabledSettings(s => s.CreationMode = RefListSelfRegistrationCreationMode.MustAlreadyExist));

            var ex = await Should.ThrowAsync<UserFriendlyException>(() => RegisterAsync(app, NewInput()));

            ex.Message.ShouldBe(SelfRegistrationPlanner.NotPreRegisteredMessage);
        }

        [Fact]
        public async Task MustAlreadyExist_links_to_the_pre_registered_person_after_otp_verificationAsync()
        {
            var app = await CreateAppAsync(EnabledSettings(s => s.CreationMode = RefListSelfRegistrationCreationMode.MustAlreadyExist));
            var input = NewInput();
            var preRegisteredId = await CreatePreRegisteredPersonAsync(input.EmailAddress, mobile: null);
            ProvideOtp(input, sentTo: input.EmailAddress);

            var result = await RegisterAsync(app, input);

            result.LinkedToExistingPerson.ShouldBeTrue();
            result.PersonId.ShouldBe(preRegisteredId);
            await WithUowAsync(async () =>
            {
                var person = await _personRepository.GetAsync(preRegisteredId);
                person.User.ShouldNotBeNull();
                person.User.Id.ShouldBe(result.UserId);
            });
        }

        [Fact]
        public async Task Linking_requires_an_otpAsync()
        {
            var app = await CreateAppAsync(EnabledSettings(s => s.CreationMode = RefListSelfRegistrationCreationMode.LinkIfExistsOtherwiseCreate));
            var input = NewInput();
            RemoveOtp(input);
            await CreatePreRegisteredPersonAsync(input.EmailAddress, mobile: null);

            var ex = await Should.ThrowAsync<UserFriendlyException>(() => RegisterAsync(app, input));

            ex.Message.ShouldBe(SelfRegistrationManager.OwnershipNotVerifiedMessage);
        }

        [Fact]
        public async Task Linking_rejects_a_wrong_pinAsync()
        {
            var app = await CreateAppAsync(EnabledSettings(s => s.CreationMode = RefListSelfRegistrationCreationMode.MustAlreadyExist));
            var input = NewInput();
            await CreatePreRegisteredPersonAsync(input.EmailAddress, mobile: null);
            ProvideOtp(input, sentTo: input.EmailAddress);
            input.OtpPin = "000000";

            var ex = await Should.ThrowAsync<UserFriendlyException>(() => RegisterAsync(app, input));

            ex.Message.ShouldBe(SelfRegistrationManager.OwnershipNotVerifiedMessage);
        }

        [Fact]
        public async Task Linking_rejects_an_otp_sent_to_a_different_addressAsync()
        {
            var app = await CreateAppAsync(EnabledSettings(s => s.CreationMode = RefListSelfRegistrationCreationMode.MustAlreadyExist));
            var input = NewInput();
            await CreatePreRegisteredPersonAsync(input.EmailAddress, mobile: null);
            ProvideOtp(input, sentTo: $"attacker-{Guid.NewGuid():N}@example.test");

            var ex = await Should.ThrowAsync<UserFriendlyException>(() => RegisterAsync(app, input));

            ex.Message.ShouldBe(SelfRegistrationManager.OwnershipNotVerifiedMessage);
        }

        [Fact]
        public async Task Linking_by_mobile_number_is_supportedAsync()
        {
            var app = await CreateAppAsync(EnabledSettings(s => s.CreationMode = RefListSelfRegistrationCreationMode.MustAlreadyExist));
            var input = NewInput();
            var preRegisteredId = await CreatePreRegisteredPersonAsync(email: null, mobile: input.MobileNumber);
            ProvideOtp(input, sentTo: input.MobileNumber);

            var result = await RegisterAsync(app, input);

            result.PersonId.ShouldBe(preRegisteredId);
        }

        [Fact]
        public async Task Linking_by_mobile_number_ignores_spaces_in_the_stored_numberAsync()
        {
            var app = await CreateAppAsync(EnabledSettings(s => s.CreationMode = RefListSelfRegistrationCreationMode.MustAlreadyExist));
            var input = NewInput();
            var preRegisteredId = await CreatePreRegisteredPersonAsync(email: null, mobile: WithSpaces(input.MobileNumber));
            ProvideOtp(input, sentTo: input.MobileNumber);

            var result = await RegisterAsync(app, input);

            result.PersonId.ShouldBe(preRegisteredId);
        }

        [Fact]
        public async Task Linking_by_mobile_number_ignores_spaces_in_the_registered_numberAsync()
        {
            var app = await CreateAppAsync(EnabledSettings(s => s.CreationMode = RefListSelfRegistrationCreationMode.MustAlreadyExist));
            var input = NewInput();
            var preRegisteredId = await CreatePreRegisteredPersonAsync(email: null, mobile: input.MobileNumber);
            input.MobileNumber = WithSpaces(input.MobileNumber);
            ProvideOtp(input, sentTo: input.MobileNumber);

            var result = await RegisterAsync(app, input);

            result.PersonId.ShouldBe(preRegisteredId);
        }

        private static string WithSpaces(string mobile) => $"{mobile[..3]} {mobile[3..5]} {mobile[5..8]} {mobile[8..]}";

        [Fact]
        public async Task LinkIfExists_creates_a_new_person_when_none_matchesAsync()
        {
            var app = await CreateAppAsync(EnabledSettings(s => s.CreationMode = RefListSelfRegistrationCreationMode.LinkIfExistsOtherwiseCreate));

            var result = await RegisterAsync(app, NewInput());

            result.LinkedToExistingPerson.ShouldBeFalse();
        }

        [Theory]
        [InlineData(RefListSelfRegistrationCreationMode.MustAlreadyExist)]
        [InlineData(RefListSelfRegistrationCreationMode.LinkIfExistsOtherwiseCreate)]
        public async Task Existing_accounts_cannot_be_taken_over_even_with_a_valid_otpAsync(RefListSelfRegistrationCreationMode mode)
        {
            var app = await CreateAppAsync(EnabledSettings(s => s.CreationMode = mode));

            // a person who already has an account
            var victim = await RegisterAsync(await CreateAppAsync(EnabledSettings()), NewInput());
            string victimEmail = null, victimPasswordHash = null;
            await WithUowAsync(async () =>
            {
                var user = await _userRepository.GetAsync(victim.UserId);
                victimEmail = user.EmailAddress;
                victimPasswordHash = user.Password;
            });

            var attack = NewInput();
            attack.EmailAddress = victimEmail;
            attack.Password = attack.PasswordConfirmation = "Attacker!123";
            ProvideOtp(attack, sentTo: victimEmail);

            var ex = await Should.ThrowAsync<UserFriendlyException>(() => RegisterAsync(app, attack));

            ex.Message.ShouldBe(SelfRegistrationPlanner.AccountAlreadyExistsMessage);
            await WithUowAsync(async () =>
            {
                var user = await _userRepository.GetAsync(victim.UserId);
                user.Password.ShouldBe(victimPasswordHash);
                var person = await _personRepository.GetAsync(victim.PersonId);
                person.User.Id.ShouldBe(victim.UserId);
            });
        }

        #endregion

        #region Completing registration

        [Fact]
        public async Task Registration_without_additional_info_is_complete_and_has_no_completion_tokenAsync()
        {
            var app = await CreateAppAsync(EnabledSettings());

            var result = await RegisterAsync(app, NewInput());

            result.RequiresAdditionalRegistrationInfo.ShouldBeFalse();
            result.CompletionToken.ShouldBeNull();
            var registration = await GetRegistrationAsync(result.UserId);
            registration.IsComplete.ShouldBeTrue();
            registration.CompletionTokenHash.ShouldBeNull();
        }

        [Fact]
        public async Task CompleteRegistration_with_the_completion_token_completes_the_registrationAsync()
        {
            var app = await CreateAppAsync(AdditionalInfoSettings());
            var result = await RegisterAsync(app, NewInput());

            result.CompletionToken.ShouldNotBeNullOrWhiteSpace();
            var pending = await GetRegistrationAsync(result.UserId);
            pending.IsComplete.ShouldBeFalse();
            pending.CompletionTokenHash.Length.ShouldBe(64);
            pending.CompletionTokenHash.ShouldNotContain(result.CompletionToken, Case.Insensitive, "only a hash of the token is stored");

            var url = await CompleteAsync(result.UserId, result.CompletionToken);

            url.ShouldBe("/done");
            var completed = await GetRegistrationAsync(result.UserId);
            completed.IsComplete.ShouldBeTrue();
            completed.CompletionTokenHash.ShouldBeNull();
            completed.CompletionTokenExpiresOn.ShouldBeNull();
        }

        [Fact]
        public async Task Completion_token_is_single_useAsync()
        {
            var app = await CreateAppAsync(AdditionalInfoSettings());
            var result = await RegisterAsync(app, NewInput());
            await CompleteAsync(result.UserId, result.CompletionToken);

            var ex = await Should.ThrowAsync<UserFriendlyException>(() => CompleteAsync(result.UserId, result.CompletionToken));

            ex.Message.ShouldBe(SelfRegistrationManager.InvalidCompletionTokenMessage);
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData("not-the-token")]
        public async Task CompleteRegistration_rejects_a_wrong_tokenAsync(string token)
        {
            var app = await CreateAppAsync(AdditionalInfoSettings());
            var result = await RegisterAsync(app, NewInput());

            await Should.ThrowAsync<Exception>(() => CompleteAsync(result.UserId, token));

            (await GetRegistrationAsync(result.UserId)).IsComplete.ShouldBeFalse();
        }

        [Fact]
        public async Task A_completion_token_only_works_for_its_own_userAsync()
        {
            var app = await CreateAppAsync(AdditionalInfoSettings());
            var victim = await RegisterAsync(app, NewInput());
            var attacker = await RegisterAsync(app, NewInput());

            var ex = await Should.ThrowAsync<UserFriendlyException>(() => CompleteAsync(victim.UserId, attacker.CompletionToken));

            ex.Message.ShouldBe(SelfRegistrationManager.InvalidCompletionTokenMessage);
            (await GetRegistrationAsync(victim.UserId)).IsComplete.ShouldBeFalse();
        }

        [Fact]
        public async Task An_expired_completion_token_is_rejectedAsync()
        {
            var app = await CreateAppAsync(AdditionalInfoSettings());
            var result = await RegisterAsync(app, NewInput());
            await WithUowAsync(async () =>
            {
                var repo = Resolve<IRepository<ShaUserRegistration, Guid>>();
                var registration = await repo.GetAll().SingleAsync(r => r.UserId == result.UserId);
                registration.CompletionTokenExpiresOn = Clock.Now.AddMinutes(-1);
                await repo.UpdateAsync(registration);
            });

            var ex = await Should.ThrowAsync<UserFriendlyException>(() => CompleteAsync(result.UserId, result.CompletionToken));

            ex.Message.ShouldBe(SelfRegistrationManager.InvalidCompletionTokenMessage);
        }

        [Fact]
        public async Task Login_with_an_incomplete_registration_requires_the_password_before_redirectingAsync()
        {
            ConfigureTokenAuth();
            var app = await CreateAppAsync(AdditionalInfoSettings());
            var input = NewInput();
            await RegisterAsync(app, input);

            // previously the redirect (with the user id) was returned for any password
            await Should.ThrowAsync<AbpAuthorizationException>(() => AuthenticateAsync(input.UserName, "Wrong!password1"));
        }

        [Fact]
        public async Task Login_with_an_incomplete_registration_issues_a_new_completion_tokenAsync()
        {
            ConfigureTokenAuth();
            var app = await CreateAppAsync(AdditionalInfoSettings());
            var input = NewInput();
            var registered = await RegisterAsync(app, input);

            var login = await AuthenticateAsync(input.UserName, input.Password);

            login.ResultType.ShouldBe(AuthenticateResultType.RedirectNoAuth);
            login.AccessToken.ShouldBeNull();
            login.UserId.ShouldBe(registered.UserId);
            login.RedirectModule.ShouldBe("Shesha");
            login.RedirectForm.ShouldBe("extra-info");
            login.RegistrationCompletionToken.ShouldNotBeNullOrWhiteSpace();
            login.RegistrationCompletionToken.ShouldNotBe(registered.CompletionToken);

            // the new token replaces the one returned by Register
            await Should.ThrowAsync<UserFriendlyException>(() => CompleteAsync(registered.UserId, registered.CompletionToken));
            await CompleteAsync(registered.UserId, login.RegistrationCompletionToken);

            var afterCompletion = await AuthenticateAsync(input.UserName, input.Password);
            afterCompletion.ResultType.ShouldBe(AuthenticateResultType.Success);
            afterCompletion.AccessToken.ShouldNotBeNullOrWhiteSpace();
            afterCompletion.RegistrationCompletionToken.ShouldBeNull();
        }

        #endregion

        #region Helpers

        private static UserManagementSettings EnabledSettings(Action<UserManagementSettings> configure = null)
        {
            var settings = new UserManagementSettings
            {
                AllowSelfRegistration = true,
                SupportedRegistrationMethods = SupportedRegistrationMethods.EmailAddress,
                UserEmailAsUsername = false,
                GoToUrlAfterRegistration = "/",
            };
            configure?.Invoke(settings);
            return settings;
        }

        private static UserManagementSettings AdditionalInfoSettings()
        {
            return EnabledSettings(s =>
            {
                s.GoToUrlAfterRegistration = "/done";
                s.AdditionalRegistrationInfo = true;
                s.AdditionalRegistrationInfoFormModule = "Shesha";
                s.AdditionalRegistrationInfoFormName = "extra-info";
            });
        }

        private async Task<string> CompleteAsync(long userId, string token)
        {
            AbpSession.UserId = null;
            return await Resolve<IUserRegistrationAppService>().CompleteRegistrationAsync(new CompleteRegistrationInput { UserId = userId, Token = token });
        }

        private async Task<ShaUserRegistration> GetRegistrationAsync(long userId)
        {
            return await WithUowAsync(() => Resolve<IRepository<ShaUserRegistration, Guid>>().GetAll().SingleAsync(r => r.UserId == userId));
        }

        private async Task<AuthenticateResultModel> AuthenticateAsync(string userName, string password)
        {
            AbpSession.UserId = null;

            // In the test host, entity history for the anonymous login (EntityHistoryHelper -> AsyncHelper.RunSync ->
            // ModelConfigurationManager cache) deadlocks; it is unrelated to registration, so it is switched off here.
            var history = Resolve<IEntityHistoryConfiguration>();
            var historyForAnonymous = history.IsEnabledForAnonymousUsers;
            history.IsEnabledForAnonymousUsers = false;
            try
            {
                return await WithUowAsync(() => Resolve<TokenAuthController>().AuthenticateAsync(new AuthenticateModel
                {
                    UserNameOrEmailAddress = userName,
                    Password = password,
                }));
            }
            finally
            {
                history.IsEnabledForAnonymousUsers = historyForAnonymous;
            }
        }

        private void ConfigureTokenAuth()
        {
            if (!LocalIocManager.IsRegistered<TokenAuthConfiguration>())
                LocalIocManager.Register<TokenAuthConfiguration>();
            var config = LocalIocManager.Resolve<TokenAuthConfiguration>();
            config.SecurityKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes("SheshaTest_SelfRegistration_C421AAEE"));
            config.Issuer = "SheshaTest";
            config.Audience = "SheshaTest";
            config.SigningCredentials = new SigningCredentials(config.SecurityKey, SecurityAlgorithms.HmacSha256);
            config.Expiration = TimeSpan.FromHours(1);
        }

        /// <summary>
        /// A registration request whose email address has been verified with a one-time pin, as the registration forms do
        /// </summary>
        private SelfRegistrationInput NewInput(string domain = "selfreg.test")
        {
            var id = Guid.NewGuid().ToString("N");
            var input = new SelfRegistrationInput
            {
                UserName = $"selfreg-{id}",
                EmailAddress = $"selfreg-{id}@{domain}",
                MobileNumber = $"+27{Math.Abs((long)id.GetHashCode()) % 10_000_000_000L:D10}",
                FirstName = "Self",
                LastName = "Registered",
                Password = Password,
                PasswordConfirmation = Password,
            };
            ProvideOtp(input, sentTo: input.EmailAddress);
            return input;
        }

        private static void RemoveOtp(SelfRegistrationInput input)
        {
            input.OtpOperationId = null;
            input.OtpPin = null;
        }

        private async Task<bool> UserExistsAsync(string userName)
        {
            return await WithUowAsync(() => _userRepository.GetAll().AnyAsync(u => u.UserName == userName));
        }

        private void ProvideOtp(SelfRegistrationInput input, string sentTo)
        {
            var otp = new OtpDto { OperationId = Guid.NewGuid(), Pin = "123456", SendTo = sentTo, ExpiresOn = DateTime.Now.AddMinutes(5) };
            _otps[otp.OperationId] = otp;
            input.OtpOperationId = otp.OperationId;
            input.OtpPin = otp.Pin;
        }

        /// <summary>
        /// Registers anonymously from the specified front-end application
        /// </summary>
        private async Task<SelfRegistrationResult> RegisterAsync(string appKey, SelfRegistrationInput input)
        {
            AbpSession.UserId = null;
            using var scope = Resolve<IConfigurationFrameworkRuntime>().BeginScope(s => s.FrontEndApplication = appKey);
            return await Resolve<IUserRegistrationAppService>().RegisterAsync(input);
        }

        private async Task<PublicRegistrationSettingsDto> GetPublicSettingsAsync(string appKey)
        {
            AbpSession.UserId = null;
            using var scope = Resolve<IConfigurationFrameworkRuntime>().BeginScope(s => s.FrontEndApplication = appKey);
            return await Resolve<IUserRegistrationAppService>().GetSettingsAsync();
        }

        /// <summary>
        /// Creates a front-end application, optionally with its own user management settings, and returns its AppKey
        /// </summary>
        private async Task<string> CreateAppAsync(UserManagementSettings settings)
        {
            var appKey = $"selfreg-test-{Guid.NewGuid():N}";
            _appKeys.Add(appKey);

            await WithUowAsync(async () =>
            {
                await Resolve<IRepository<FrontEndApp, Guid>>().InsertAsync(new FrontEndApp { AppKey = appKey, Name = appKey });
            });

            if (settings != null)
                await SaveSettingsAsync(settings, appKey);

            return appKey;
        }

        private async Task SaveSettingsAsync(UserManagementSettings settings, string appKey)
        {
            var module = typeof(IUserManagementSettings).GetConfigurableModuleName();
            await WithUowAsync(() => Resolve<IShaSettingManager>().SetAsync(module, UserManagementSettingNames.UserManagement, settings,
                new SettingManagementContext { AppKey = appKey }));
        }

        private async Task WithGlobalSettingsAsync(UserManagementSettings settings, Func<Task> action)
        {
            var store = Resolve<Services.Settings.ISettingStore>();
            var definition = Resolve<ISettingDefinitionManager>().Get(typeof(IUserManagementSettings).GetConfigurableModuleName(), UserManagementSettingNames.UserManagement);
            var original = await WithUowAsync(() => store.GetValueAsync(definition, new SettingManagementContext { AppKey = string.Empty }));

            await SaveSettingsAsync(settings, string.Empty);
            try
            {
                await action();
            }
            finally
            {
                await RestoreGlobalValueAsync(definition, original);
            }
        }

        private async Task RestoreGlobalValueAsync(SettingDefinition definition, string originalJson)
        {
            await WithUowAsync(async () =>
            {
                var repo = Resolve<IRepository<SettingValue, Guid>>();
                var value = await Resolve<Services.Settings.ISettingStore>().GetSettingValueAsync(definition, new SettingManagementContext { AppKey = string.Empty });
                if (value == null)
                    return;
                if (originalJson == null)
                    await repo.DeleteAsync(value);
                else
                {
                    value.Value = originalJson;
                    await repo.UpdateAsync(value);
                }
            });
        }

        private async Task<Guid> CreatePreRegisteredPersonAsync(string email, string mobile)
        {
            return await WithUowAsync(async () =>
            {
                var person = new Person { FirstName = "Pre", LastName = "Registered", EmailAddress1 = email, MobileNumber1 = mobile };
                await _personRepository.InsertAsync(person);
                return person.Id;
            });
        }

        private async Task<string> CreateRoleAsync()
        {
            var name = $"selfreg-role-{Guid.NewGuid():N}";
            await WithUowAsync(async () =>
            {
                await Resolve<IRepository<Shesha.Domain.ShaRole, Guid>>().InsertAsync(new Shesha.Domain.ShaRole
                {
                    Name = name,
                    Label = name,
                    VersionNo = 1,
                    VersionStatus = ConfigurationItemVersionStatus.Live,
                });
            });
            return name;
        }

        private async Task WithUowAsync(Func<Task> action)
        {
            using var uow = _uowManager.Begin();
            await action();
            await uow.CompleteAsync();
        }

        private async Task<T> WithUowAsync<T>(Func<Task<T>> action)
        {
            using var uow = _uowManager.Begin();
            var result = await action();
            await uow.CompleteAsync();
            return result;
        }

        public Task InitializeAsync() => Task.CompletedTask;

        /// <summary>
        /// Removes the per-test settings and front-end applications so they don't accumulate in the shared test database
        /// </summary>
        public async Task DisposeAsync()
        {
            await WithUowAsync(async () =>
            {
                var values = Resolve<IRepository<SettingValue, Guid>>();
                var apps = Resolve<IRepository<FrontEndApp, Guid>>();
                foreach (var appKey in _appKeys)
                {
                    foreach (var value in await values.GetAll().Where(v => v.Application.AppKey == appKey).ToListAsync())
                        await values.DeleteAsync(value);
                    foreach (var app in await apps.GetAll().Where(a => a.AppKey == appKey).ToListAsync())
                        await apps.DeleteAsync(app);
                }
            });
        }

        #endregion
    }
}
