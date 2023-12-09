using Abp.Domain.Repositories;
using Abp.Runtime.Validation;
using Shesha.Authorization.Users;
using Shesha.Configuration;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Extensions;
using Shesha.Persons;
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
        private readonly IAuthenticationSettings _authSettings;

        public UserManagementAppService(
            IRepository<Person, Guid> repository, 
            UserManager userManager, 
            IRepository<ShaRoleAppointedPerson, Guid> rolePersonRepository,
            IAuthenticationSettings authSettings)
        {
            _userManager = userManager;
            _rolePersonRepository = rolePersonRepository;
            _repository = repository;
            _authSettings = authSettings;
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
            var isEmailLinkSupported = await _authSettings.UseResetPasswordViaEmailLink.GetValueAsync();
            if (isEmailLinkSupported)
                supportedPasswordResetMethods.Add((int)RefListPasswordResetMethods.EmailLink);

            var isSecurityQuestionsSupported = await _authSettings.UseResetPasswordViaSecurityQuestions.GetValueAsync();
            if (isSecurityQuestionsSupported)
                supportedPasswordResetMethods.Add((int)RefListPasswordResetMethods.SecurityQuestions);

            var isSsmOtpSupported = await _authSettings.UseResetPasswordViaSmsOtp.GetValueAsync();
            if (isSsmOtpSupported)
                supportedPasswordResetMethods.Add((int)RefListPasswordResetMethods.SmsOtp);

            var defaultMethods = supportedPasswordResetMethods.Count > 0 ? supportedPasswordResetMethods.Sum() : 0;

            // Creating User Account to enable login into the application
            User user = await _userManager.CreateUser(
                input.UserName,
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

            CurrentUnitOfWork.SaveChanges();

            return ObjectMapper.Map<PersonAccountDto>(person);
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
