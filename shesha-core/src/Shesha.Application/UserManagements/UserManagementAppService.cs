using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Abp.Domain.Repositories;
using Abp.Linq.Extensions;
using Abp.UI;
using Shesha.Authorization.Users;
using Shesha.AutoMapper.Dto;
using Shesha.Configuration;
using Shesha.Configuration.Runtime;
using Shesha.Configuration.Security.Frontend;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.DynamicEntities.Mapper;
using Shesha.Extensions;
using Shesha.Persons;
using Shesha.Reflection;
using Shesha.Services;
using Shesha.ShaRoleAppointedPersons;
using Shesha.ShaRoleAppointedPersons.Dto;
using Shesha.Validations;

namespace Shesha.UserManagements
{
    /// <summary>
    /// User Management Application Service
    /// </summary>
    public class UserManagementAppService : SheshaAppServiceBase
    {
        private readonly UserManager _userManager;
        private readonly IRepository<Person, Guid> _personRepository;
        private readonly IRepository<ShaUserRegistration, Guid> _userRegistration;
        private readonly IUserManagementSettings _userManagementSettings;
        private readonly IRepository<User, long> _userRepository;
        private readonly IShaRoleAppointedPersonAppService _roleAppointedPersonService;
        private readonly IFrontendSettings _frontendSettings;
        private readonly IDynamicRepository _dynamicRepository;
        private readonly IDynamicDtoMappingHelper _dynamicDtoMappingHelper;
        private readonly IEntityTypeConfigurationStore _entityConfigurationStore;
        private readonly IRepository<EntityConfig, Guid> _entityConfigRepository;
        private readonly IRepository<ShaRoleAppointedPerson, Guid> _roleAppointedPersonRepository;
        private readonly IRepository<ConfigurationItem, Guid> _configurationItemRepository;

        public UserManagementAppService(
            IRepository<Person, Guid> personRepository,
            UserManager userManager,
            IUserManagementSettings userManagementSettings,
            IRepository<ShaUserRegistration, Guid> userRegistration,
            IRepository<User, long> userRepository,
            IShaRoleAppointedPersonAppService roleAppointedPersonAppService,
            IFrontendSettings frontendSettings,
            IDynamicRepository dynamicRepository,
            IDynamicDtoMappingHelper dynamicDtoMappingHelper,
            IEntityTypeConfigurationStore entityTypeConfigurationStore,
            IRepository<EntityConfig, Guid> entityConfigurationRepository,
            IRepository<ShaRoleAppointedPerson, Guid> roleAppointedPersonRepository,
            IRepository<ConfigurationItem, Guid> configurationItemRepository)
        {
            _userManager = userManager;
            _personRepository = personRepository;
            _userManagementSettings = userManagementSettings;
            _userRegistration = userRegistration;
            _userRepository = userRepository;
            _roleAppointedPersonService = roleAppointedPersonAppService;
            _frontendSettings = frontendSettings;
            _dynamicRepository = dynamicRepository;
            _dynamicDtoMappingHelper = dynamicDtoMappingHelper;
            _entityConfigurationStore = entityTypeConfigurationStore;
            _entityConfigRepository = entityConfigurationRepository;
            _roleAppointedPersonRepository = roleAppointedPersonRepository;
            _configurationItemRepository = configurationItemRepository;

        }

        public async Task<PersonAccountDto> CreateAsync(CreatePersonAccountDto input)
        {
            // CheckCreatePermission();
            var registrationSettings = await _userManagementSettings.UserManagementSettings.GetValueAsync();
            var defaultAuthenticationSettings = await _userManagementSettings.DefaultAuthentication.GetValueAsync();
            var applicationRedirects = await _frontendSettings.FrontendApplicationRedirectsSettings.GetValueAsync();

            if (!registrationSettings.AllowSelfRegistration)
            {
                throw new UserFriendlyException($"User registration is not enabled.");
            }

            // Get person entity type from settings
            Type personEntityType;
            var personEntityReference = registrationSettings.PersonEntityType;

            if (personEntityReference == null || string.IsNullOrWhiteSpace(personEntityReference.Id))
            {
                personEntityType = typeof(Person);
            }
            else
            {
                // First, resolve the EntityConfig by GUID to get the TypeShortAlias
                if (Guid.TryParse(personEntityReference.Id, out var entityConfigId))
                {
                    var entityConfigRecord = await _entityConfigRepository.FirstOrDefaultAsync(e => e.Id == entityConfigId);
                    if (entityConfigRecord == null)
                        throw new UserFriendlyException($"Person entity configuration with ID '{personEntityReference}' not found.");

                    // Now get the actual entity configuration using TypeShortAlias
                    var fullClassName = entityConfigRecord.FullClassName ?? throw new UserFriendlyException("EntityConfig TypeShortAlias is null");
                    var entityConfig = _entityConfigurationStore.Get(fullClassName);
                    if (entityConfig == null)
                        throw new UserFriendlyException($"Person entity type '{fullClassName}' not found in configuration store.");

                    personEntityType = entityConfig.EntityType;
                }
                else
                {
                    // Fallback: assume it's already a TypeShortAlias
                    var entityConfig = _entityConfigurationStore.Get(personEntityReference.Id);
                    if (entityConfig == null)
                        throw new UserFriendlyException($"Person entity type '{personEntityReference}' not found.");

                    personEntityType = entityConfig.EntityType;
                }
            }

            if (!typeof(Person).IsAssignableFrom(personEntityType))
            {
                throw new UserFriendlyException($"Configured person entity type '{personEntityType.FullName}' is not a subclass of Person.");
            }

            var allowedEmailDomains = registrationSettings?.AllowedEmailDomains;

            // Performing additional validations
            var validationResults = new List<ValidationResult>();

            if (!defaultAuthenticationSettings.UserEmailAsUsername && string.IsNullOrWhiteSpace(input.UserName))
                validationResults.Add(new ValidationResult("Username is mandatory"));
            if (defaultAuthenticationSettings.UserEmailAsUsername && string.IsNullOrWhiteSpace(input.EmailAddress))
                validationResults.Add(new ValidationResult("Email Address is mandatory"));

            if (input.TypeOfAccount == null)
                validationResults.Add(new ValidationResult("Type of account is mandatory"));

            if (string.IsNullOrWhiteSpace(input.FirstName))
                validationResults.Add(new ValidationResult("First Name is mandatory"));
            if (string.IsNullOrWhiteSpace(input.LastName))
                validationResults.Add(new ValidationResult("Last Name is mandatory"));

            // trim email and mobile
            input.EmailAddress = input.EmailAddress?.Trim();
            input.MobileNumber = input.MobileNumber?.Trim();

            // Handle allowed domains
            await HandleAllowedDomainsAsync(
                input.EmailAddress ?? throw new UserFriendlyException(nameof(input.EmailAddress), "Email address cannot be null."),
                allowedEmailDomains ?? string.Empty
            );

            // email and mobile number must be unique
            if (await MobileNoAlreadyInUseAsync(input.MobileNumber, null))
                validationResults.Add(new ValidationResult("Specified mobile number already used by another person."));

            // Handle CreationMode logic to check if the person already exists
            var creationMode = registrationSettings?.CreationMode;
            // Find existing person once to avoid duplicate database calls
            var existingPerson = await FindExistingPersonEntityAsync(input.EmailAddress, input.UserName);
            HandleCreationMode(creationMode, existingPerson);

            validationResults.ThrowValidationExceptionIfAny(L);

            // Supported password reset methods for the user
            // This might need reviewing since some methods might be unavailable for some users during time of
            // creation.
            // Supported password reset methods for the user
            // This might need reviewing since some methods might be unavailable for some users during time of
            // creation.
            RefListPasswordResetMethods supportedPasswordResetMethods = 0;
            if (defaultAuthenticationSettings.UseResetPasswordViaEmailLink)
                supportedPasswordResetMethods |= RefListPasswordResetMethods.EmailLink;
            if (defaultAuthenticationSettings.UseResetPasswordViaSecurityQuestions)
                supportedPasswordResetMethods |= RefListPasswordResetMethods.SecurityQuestions;
            if (defaultAuthenticationSettings.UseResetPasswordViaSmsOtp)
                supportedPasswordResetMethods |= RefListPasswordResetMethods.SmsOtp;

            // Creating User Account to enable login into the application
            var userName = defaultAuthenticationSettings.UserEmailAsUsername ? input.EmailAddress : input.UserName;
            var user = await CreateOrLinkUserAsync(creationMode, existingPerson, input, userName, (long?)supportedPasswordResetMethods);

            // Creating or linking Person entity based on CreationMode using dynamic type from settings
            // Pass existing person to avoid duplicate database call
            var personEntity = await CreateOrLinkPersonEntityAsync(input, user, creationMode, personEntityType, existingPerson);

            await AssignDefaultRolesAsync(registrationSettings, personEntityType, personEntity);

            await SaveUserRegistrationAuditAsync(registrationSettings, applicationRedirects, user);

            // Map dynamic person entity to PersonAccountDto
            var entityToDtoMapper = await _dynamicDtoMappingHelper.GetEntityToDtoMapperAsync(personEntityType, typeof(PersonAccountDto));
            var response = entityToDtoMapper.Map(personEntity, new PersonAccountDto());
            response.GoToUrlAfterRegistration = applicationRedirects.BaseUrl + applicationRedirects.SuccessLoginRedirectPath;
            response.UserId = user.Id;

            await CurrentUnitOfWork.SaveChangesAsync();

            return response;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        /// <exception cref="Exception"></exception>
        public async Task<string?> CompleteRegistrationAsync(long userId)
        {
            var userRegistration = await _userRegistration.FirstOrDefaultAsync(e => e.UserId == userId);
            if (userRegistration == null)
                throw new UserFriendlyException("User registration not found");

            if (userRegistration.IsComplete)
                throw new UserFriendlyException("User registration already completed");

            userRegistration.IsComplete = true;
            await _userRegistration.UpdateAsync(userRegistration);

            return userRegistration.GoToUrlAfterRegistration;
        }

        /// <summary>
        /// Checks is specified mobile number already used by another person
        /// </summary>
        /// <returns></returns>
        private async Task<bool> MobileNoAlreadyInUseAsync(string? mobileNo, Guid? id)
        {
            if (string.IsNullOrWhiteSpace(mobileNo))
                return false;

            return await _personRepository.GetAll()
                .Where(e => e.MobileNumber1 == mobileNo)
                .WhereIf(id.HasValue, e => e.Id != id)
                .AnyAsync();
        }

        /// <summary>
        /// Handles CreationMode validation logic using dynamic person type
        /// </summary>
        private static void HandleCreationMode(RefListCreationMode? creationMode, object? existingPerson)
        {
            switch (creationMode)
            {
                case RefListCreationMode.Always:
                    if (existingPerson != null)
                        throw new UserFriendlyException($"A person with the same identifier already exists. Creation mode is set to 'Always' which requires no existing person.");
                    break;

                case RefListCreationMode.MustAlreadyExist:
                    if (existingPerson == null)
                        throw new UserFriendlyException($"No existing person found with the specified identifier. Creation mode is set to 'Must already exist' which requires a pre-existing person.");
                    break;

                case RefListCreationMode.CreateNewButLinkIfExist:
                    // No validation needed - handled in CreateOrLinkPersonAsync
                    break;

                default:
                    // Default behavior (no creation mode specified) - create new person
                    throw new UserFriendlyException($"Invalid or unsupported creation mode: {creationMode}");
            }
        }

        private async Task<User> CreateOrLinkUserAsync(
            RefListCreationMode? creationMode,
            object? existingPerson,
            CreatePersonAccountDto input,
            string? userName,
            long? supportedPasswordResetMethods
        )
        {
            if (creationMode is null)
                throw new ArgumentNullException(nameof(creationMode));

            var isInternalAccount = input.TypeOfAccount?.ItemValue == (long)RefListTypeOfAccount.Internal;
            var username = userName.NotNull();
            var foundUser = existingPerson != null ? ((Person)existingPerson).User : null;

            // Prepare argument list once to avoid repetition
            async Task<User> CreateUserAsync() => await _userManager.CreateUserAsync(
                username,
                isInternalAccount,
                input.Password,
                input.PasswordConfirmation,
                input.FirstName,
                input.LastName,
                input.MobileNumber,
                input.EmailAddress,
                supportedPasswordResetMethods);

            async Task<User> LinkUserAsync() => await _userManager.LinkUserAsync(
                username,
                isInternalAccount,
                input.Password,
                input.PasswordConfirmation,
                input.FirstName,
                input.LastName,
                input.MobileNumber,
                input.EmailAddress,
                supportedPasswordResetMethods);

            return creationMode switch
            {
                RefListCreationMode.Always when foundUser is null => await CreateUserAsync(),
                RefListCreationMode.MustAlreadyExist when foundUser is not null => await LinkUserAsync(),
                RefListCreationMode.CreateNewButLinkIfExist when foundUser is not null => await LinkUserAsync(),
                RefListCreationMode.CreateNewButLinkIfExist => await CreateUserAsync(),
                _ => throw new InvalidOperationException($"Unsupported creation mode: {creationMode}")
            };
        }

        /// <summary>
        /// Creates a new person entity or links to existing one based on CreationMode using dynamic person type from settings
        /// </summary>
        private async Task<object> CreateOrLinkPersonEntityAsync(CreatePersonAccountDto input, User user, RefListCreationMode? creationMode, Type personEntityType, object? existingPersonEntity = null)
        {
            object personEntity;

            switch (creationMode)
            {
                case RefListCreationMode.MustAlreadyExist:
                    if (existingPersonEntity == null)
                        throw new UserFriendlyException($"No existing person found. This should have been caught in validation.");

                    // Link the user to the existing person
                    await LinkUserToPersonEntityAsync(existingPersonEntity, user, personEntityType);
                    personEntity = existingPersonEntity;
                    break;

                case RefListCreationMode.CreateNewButLinkIfExist:
                    if (existingPersonEntity != null)
                    {
                        // Link to existing person
                        await LinkUserToPersonEntityAsync(existingPersonEntity, user, personEntityType);
                        personEntity = existingPersonEntity;
                    }
                    else
                    {
                        // Create new person
                        personEntity = await CreateNewPersonEntityAsync(input, user, personEntityType);
                    }
                    break;

                case RefListCreationMode.Always:
                    // Always create a new person
                    personEntity = await CreateNewPersonEntityAsync(input, user, personEntityType);
                    break;

                default:
                    // Always create new person (default behavior)
                    personEntity = await CreateNewPersonEntityAsync(input, user, personEntityType);
                    break;
            }

            return personEntity;
        }

        /// <summary>
        /// Creates a new person entity using dynamic type from settings
        /// </summary>
        private async Task<object> CreateNewPersonEntityAsync(CreatePersonAccountDto input, User user, Type personEntityType)
        {
            // Ensure personEntity is not null after creation
            var personEntity = Activator.CreateInstance(personEntityType)
                ?? throw new InvalidOperationException($"Failed to create an instance of type {personEntityType.FullName}");

            ((Person)personEntity).User = user;
            ((Person)personEntity).EmailAddress1 = input.EmailAddress;
            ((Person)personEntity).MobileNumber1 = input.MobileNumber;
            ((Person)personEntity).FirstName = input.FirstName;
            ((Person)personEntity).LastName = input.LastName;

            await _dynamicRepository.SaveOrUpdateAsync(personEntity);
            return personEntity;
        }

        /// <summary>
        /// Finds an existing person entity by identifier (email or username) using dynamic type
        /// </summary>
        private async Task<object?> FindExistingPersonEntityAsync(string? emailAddress, string? userName)
        {
            if (string.IsNullOrWhiteSpace(emailAddress) && string.IsNullOrWhiteSpace(userName))
                return null;

            // For now, use the traditional repository approach since dynamic repository querying is complex
            // This could be optimized later with proper dynamic repository filtering

            if (!string.IsNullOrWhiteSpace(emailAddress) || !string.IsNullOrWhiteSpace(userName))
            {
                // Try to find by email using traditional Person repository as fallback
                var person = await _personRepository.GetAllIncluding(p => p.User)
                        .Where(p =>
                            (p.User != null && p.User.UserName == userName) ||
                            p.EmailAddress1 == emailAddress)
                        .FirstOrDefaultAsync();
                if (person != null)
                    return person;
            }

            return null;
        }

        /// <summary>
        /// Links a user to a person entity using reflection
        /// </summary>
        private async Task LinkUserToPersonEntityAsync(object personEntity, User user, Type personEntityType)
        {
            var userProperty = personEntityType.GetProperty("User");
            if (userProperty != null && userProperty.CanWrite)
            {
                var updatedUser = await GetOrUpdateUserAsync(user);
                userProperty.SetValue(personEntity, updatedUser);
                await _dynamicRepository.SaveOrUpdateAsync(personEntity);
            }
        }

        /// <summary>
        /// Gets or updates user
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        private async Task<User> GetOrUpdateUserAsync(User user)
        {
            // Check if user already exists by Id or Username
            var existingUser = await _userRepository.FirstOrDefaultAsync(u => u.Id == user.Id || u.UserName == user.UserName || u.EmailAddress == user.EmailAddress);

            if (existingUser != null)
            {
                // Update existing user fields with new data
                existingUser.EmailAddress = user.EmailAddress;
                existingUser.Name = user.Name;
                existingUser.Surname = user.Surname;
                existingUser.IsActive = user.IsActive;

                await _userRepository.UpdateAsync(existingUser);
                return existingUser;
            }
            else
            {
                // Create new user record
                await _userRepository.InsertAsync(user);
                return user;
            }
        }

        private async Task SaveUserRegistrationAuditAsync(UserManagementSettings? registrationSettings, FrontendApplicationRedirectsSettings applicationRedirects, User user)
        {
            var additionalRegistrationFormRef = registrationSettings!.AdditionalRegistrationInfoForm;

            // Resolve the form identifier from the entity reference (ID only)
            FormIdentifier? formIdentifier = null;
            if (additionalRegistrationFormRef != null && !string.IsNullOrWhiteSpace(additionalRegistrationFormRef.Id) && Guid.TryParse(additionalRegistrationFormRef.Id, out var formId))
            {
                // Parse the ID and get the form configuration to extract module and name
                //if (Guid.TryParse(additionalRegistrationFormRef.Id, out var formId))
                //{
                    var formConfig = await _configurationItemRepository.FirstOrDefaultAsync(config => config.Id == formId && config.ItemType == "form");
                    if (formConfig != null)
                    {
                        // Create the FormIdentifier using the module name and form name from the configuration
                        var moduleName = formConfig.Module?.Name;
                        formIdentifier = FormIdentifier.New(moduleName, formConfig.Name);
                    }
                //}
            }

            var userRegistration = new ShaUserRegistration
            {
                UserId = user.Id,
                UserNameOrEmailAddress = user.UserName,
                GoToUrlAfterRegistration = applicationRedirects.SuccessLoginRedirectPath,
                AdditionalRegistrationInfoForm = formIdentifier,
                IsComplete = !registrationSettings.AdditionalRegistrationInfo
            };

            await _userRegistration.InsertAsync(userRegistration);
        }

        private async Task AssignDefaultRolesAsync(UserManagementSettings? registrationSettings, Type personEntityType, object? personEntity)
        {
            // Assign default role if specified in the settings
            if (registrationSettings?.DefaultRoles != null && personEntity != null)
            {
                // Get the Id property dynamically from the person entity
                var personIdProperty = personEntityType.GetProperty("Id");
                var personId = personIdProperty?.GetValue(personEntity) as Guid?;

                if (personId.HasValue)
                {
                    foreach (var roleId in registrationSettings.DefaultRoles)
                    {
                        if (roleId == null || roleId == Guid.Empty)
                            continue;

                        // Check if the person already has this role assigned
                        var existingAppointment = await _roleAppointedPersonRepository.GetAll()
                            .FirstOrDefaultAsync(a => a.Role!.Id == roleId.Value && a.Person!.Id == personId.Value);

                        // Only create the role appointment if it doesn't already exist
                        if (existingAppointment == null)
                        {
                            var roleDto = new CreateShaRoleAppointedPersonDto
                            {
                                RoleId = roleId.Value,
                                Person = new EntityReferenceDto<Guid?>
                                {
                                    Id = personId.Value
                                }
                            };
                            await _roleAppointedPersonService.CreateAsync(roleDto);
                        }
                    }
                }
            }
        }

        /// <summary>
        /// Handles the allowed email address domains for registration
        /// The allowed domains can be comma separated
        /// </summary>
        /// <param name="email"></param>
        /// <param name="allowedDomains"></param>
        /// <exception cref="ArgumentException"></exception>
        /// <exception cref="InvalidOperationException"></exception>
        private static async Task HandleAllowedDomainsAsync(string email, string allowedDomains)
        {
            if (string.IsNullOrWhiteSpace(email))
                throw new UserFriendlyException("Email address is required.", nameof(email));

            // Normalize email
            email = email.Trim().ToLowerInvariant();

            await Task.Yield();

            // If no allowed domains are provided, allow any domain
            if (string.IsNullOrWhiteSpace(allowedDomains))
                return;

            // Split allowed domains by comma and normalize them
            var domainList = allowedDomains
                .Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(d => d.Trim().ToLowerInvariant())
                .ToList();

            // Extract domain from email
            var atIndex = email.LastIndexOf('@');
            if (atIndex < 0)
                throw new UserFriendlyException("Invalid email address format.", nameof(email));

            var emailDomain = email.Substring(atIndex);

            // Check if email domain matches any of the allowed domains
            if (!domainList.Any(allowed => emailDomain.EndsWith(allowed)))
            {
                throw new UserFriendlyException(
                    $"Email domain '{emailDomain}' is not allowed. Allowed domains: {string.Join(", ", domainList)}."
                );
            }
        }
    }
}
