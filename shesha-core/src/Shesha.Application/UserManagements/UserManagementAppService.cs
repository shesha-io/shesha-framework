using Abp.Auditing;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Runtime.Validation;
using DocumentFormat.OpenXml.Spreadsheet;
using Shesha.Authorization;
using Shesha.Authorization.Users;
using Shesha.Configuration;
using Shesha.Configuration.Security;
using Shesha.ConfigurationItems;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Extensions;
using Shesha.Models.TokenAuth;
using Shesha.Persons;
using Shesha.UserManagements.Configurations;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.UserManagements
{
    /// <summary>
    /// User Management Application Service
    /// </summary>
    public class UserManagementAppService: SheshaAppServiceBase
    {
        private readonly UserManager _userManager;
        private readonly IRepository<ShaRoleAppointedPerson, Guid> _rolePersonRepository;
        private readonly IRepository<Person, Guid> _repository;
        private readonly IRepository<ShaUserRegistration, Guid> _userRegistration;
        private readonly ISecuritySettings _securitySettings;
        private readonly IUserManagementSettings _userManagementSettings;

        public UserManagementAppService(
            IRepository<Person, Guid> repository, 
            UserManager userManager, 
            IRepository<ShaRoleAppointedPerson, Guid> rolePersonRepository,
            ISecuritySettings securitySettings,
            IUserManagementSettings userManagementSettings,
            IRepository<ShaUserRegistration, Guid> userRegistration)
        {
            _userManager = userManager;
            _rolePersonRepository = rolePersonRepository;
            _repository = repository;
            _securitySettings = securitySettings;
            _userManagementSettings = userManagementSettings;
            _userRegistration = userRegistration;
        }

        /// <summary>
        /// Default constructor
        /// </summary>
        /// <param name="repository"></param>
        public UserManagementAppService(IRepository<Person, Guid> repository)
        {

        }

        public async Task<PersonAccountDto> CreateAsync(CreatePersonAccountDto input)
        {
            //CheckCreatePermission();
            var registrationSettings = await _userManagementSettings.UserManagementSettings.GetValueAsync();

            // Performing additional validations
            var validationResults = new List<ValidationResult>();
            var supportedPasswordResetMethods = new List<int>();

            if (input.TypeOfAccount == null)
                validationResults.Add(new ValidationResult("Type of account is mandatory"));

            if (string.IsNullOrWhiteSpace(input.FirstName))
                validationResults.Add(new ValidationResult("First Name is mandatory"));
            if (string.IsNullOrWhiteSpace(input.LastName))
                validationResults.Add(new ValidationResult("Last Name is mandatory"));

            // email and mobile number must be unique
            if (await MobileNoAlreadyInUse(input.MobileNumber, null))
                validationResults.Add(new ValidationResult("Specified mobile number already used by another person"));
            if (await EmailAlreadyInUse(input.EmailAddress, null))
                validationResults.Add(new ValidationResult("Specified email already used by another person"));

            if (validationResults.Any())
                throw new AbpValidationException("Please correct the errors and try again", validationResults);

            // Supported password reset methods for the user
            // This might need reviewing since some methods might be unavailable for some users during time of
            // creation.
            var securitySettings = await _securitySettings.SecuritySettings.GetValueAsync();

            var isEmailLinkSupported = securitySettings.UseResetPasswordViaEmailLink;
            if (isEmailLinkSupported)
                supportedPasswordResetMethods.Add((int)RefListPasswordResetMethods.EmailLink);

            var isSecurityQuestionsSupported = securitySettings.UseResetPasswordViaSecurityQuestions;
            if (isSecurityQuestionsSupported)
                supportedPasswordResetMethods.Add((int)RefListPasswordResetMethods.SecurityQuestions);

            var isSsmOtpSupported = securitySettings.UseResetPasswordViaSmsOtp;
            if (isSsmOtpSupported)
                supportedPasswordResetMethods.Add((int)RefListPasswordResetMethods.SmsOtp);

            var defaultMethods = supportedPasswordResetMethods.Count > 0 ? supportedPasswordResetMethods.Sum() : 0;

            // Creating User Account to enable login into the application
            User user = await _userManager.CreateUserAsync(
                registrationSettings.UserEmailAsUsername ? input.EmailAddress : input.UserName,
                input.TypeOfAccount?.ItemValue == (long)RefListTypeOfAccount.Internal,
                input.Password,
                input.PasswordConfirmation,
                input.FirstName,
                input.LastName,
                input.MobileNumber,
                input.EmailAddress,
                defaultMethods);

            // Creating Person entity
            var person = ObjectMapper.Map<Person>(input);
           
            // manual map for now
            person.EmailAddress1 = input.EmailAddress;
            person.MobileNumber1 = input.MobileNumber;
            person.User = user;

            await _repository.InsertAsync(person);

            var personAccount = ObjectMapper.Map<PersonAccountDto>(person);
            personAccount.GoToUrlAfterRegistration = registrationSettings.GoToUrlAfterRegistration;

            var userRegistration = new ShaUserRegistration
            {
                UserId = user.Id,
                UserNameOrEmailAddress = user.UserName,
                GoToUrlAfterRegistration = registrationSettings.GoToUrlAfterRegistration,
                AdditionalRegistrationInfoForm = !string.IsNullOrWhiteSpace(registrationSettings.AdditionalRegistrationInfoFormModule) && !string.IsNullOrWhiteSpace(registrationSettings.AdditionalRegistrationInfoFormName)
                ? new FormIdentifier(registrationSettings.AdditionalRegistrationInfoFormModule,registrationSettings.AdditionalRegistrationInfoFormName) : null,
                IsComplete = registrationSettings.AdditionalRegistrationInfo ? false : true
            };
          
            await _userRegistration.InsertAsync(userRegistration);

            CurrentUnitOfWork.SaveChanges();

            return personAccount;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        /// <exception cref="Exception"></exception>
        public async Task<string> CompleteRegistration (long userId)
        {
            var userRegistration = await _userRegistration.FirstOrDefaultAsync(e => e.UserId == userId);
            if (userRegistration == null)
                throw new Exception("User registration not found");

            if (userRegistration.IsComplete)
                throw new Exception("User registration already completed");

            userRegistration.IsComplete = true;
            await _userRegistration.UpdateAsync(userRegistration);

            return userRegistration.GoToUrlAfterRegistration;
        }


        /// <summary>
        /// Checks is specified mobile number already used by another person
        /// </summary>
        /// <returns></returns>
        private async Task<bool> MobileNoAlreadyInUse(string mobileNo, Guid? id)
        {
            if (string.IsNullOrWhiteSpace(mobileNo))
                return false;

            return await _repository.GetAll().AnyAsync(e =>
                e.MobileNumber1.Trim().ToLower() == mobileNo.Trim().ToLower() && (id == null || e.Id != id));
        }

        /// <summary>
        /// Checks is specified email already used by another person
        /// </summary>
        /// <returns></returns>
        private async Task<bool> EmailAlreadyInUse(string email, Guid? id)
        {
            if (string.IsNullOrWhiteSpace(email))
                return false;

            return await _repository.GetAll().AnyAsync(e =>
                e.EmailAddress1.Trim().ToLower() == email.Trim().ToLower() && (id == null || e.Id != id));
        }

    }
}
