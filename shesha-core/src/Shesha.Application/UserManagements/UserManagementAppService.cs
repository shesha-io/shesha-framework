﻿using Abp.Domain.Repositories;
using Abp.Linq.Extensions;
using Shesha.Authorization.Users;
using Shesha.Configuration.Security;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Extensions;
using Shesha.Persons;
using Shesha.Reflection;
using Shesha.UserManagements.Configurations;
using Shesha.Validations;
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
        private readonly IRepository<Person, Guid> _repository;
        private readonly IRepository<ShaUserRegistration, Guid> _userRegistration;
        private readonly ISecuritySettings _securitySettings;
        private readonly IUserManagementSettings _userManagementSettings;

        public UserManagementAppService(
            IRepository<Person, Guid> repository, 
            UserManager userManager, 
            ISecuritySettings securitySettings,
            IUserManagementSettings userManagementSettings,
            IRepository<ShaUserRegistration, Guid> userRegistration)
        {
            _userManager = userManager;
            _repository = repository;
            _securitySettings = securitySettings;
            _userManagementSettings = userManagementSettings;
            _userRegistration = userRegistration;
        }

        public async Task<PersonAccountDto> CreateAsync(CreatePersonAccountDto input)
        {
            //CheckCreatePermission();
            var registrationSettings = await _userManagementSettings.UserManagementSettings.GetValueAsync();

            // Performing additional validations
            var validationResults = new List<ValidationResult>();
            var supportedPasswordResetMethods = new List<int>();

            if (!registrationSettings.UserEmailAsUsername && string.IsNullOrWhiteSpace(input.UserName))
                validationResults.Add(new ValidationResult("Username is mandatory"));
            if (registrationSettings.UserEmailAsUsername && string.IsNullOrWhiteSpace(input.EmailAddress))
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

            // email and mobile number must be unique
            if (await MobileNoAlreadyInUseAsync(input.MobileNumber, null))
                validationResults.Add(new ValidationResult("Specified mobile number already used by another person"));
            if (await EmailAlreadyInUseAsync(input.EmailAddress, null))
                validationResults.Add(new ValidationResult("Specified email already used by another person"));

            validationResults.ThrowValidationExceptionIfAny(L);

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
            var userName = registrationSettings.UserEmailAsUsername ? input.EmailAddress : input.UserName;
            User user = await _userManager.CreateUserAsync(
                userName.NotNull(),
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
            personAccount.UserId = user.Id;

            var userRegistration = new ShaUserRegistration
            {
                UserId = user.Id,
                UserNameOrEmailAddress = user.UserName,
                GoToUrlAfterRegistration = registrationSettings.GoToUrlAfterRegistration,
                AdditionalRegistrationInfoForm = !string.IsNullOrWhiteSpace(registrationSettings.AdditionalRegistrationInfoFormModule) && !string.IsNullOrWhiteSpace(registrationSettings.AdditionalRegistrationInfoFormName)
                    ? new FormIdentifier(registrationSettings.AdditionalRegistrationInfoFormModule,registrationSettings.AdditionalRegistrationInfoFormName) 
                    : null,
                IsComplete = registrationSettings.AdditionalRegistrationInfo ? false : true
            };
          
            await _userRegistration.InsertAsync(userRegistration);

            await CurrentUnitOfWork.SaveChangesAsync();

            return personAccount;
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
        private async Task<bool> MobileNoAlreadyInUseAsync(string? mobileNo, Guid? id)
        {
            if (string.IsNullOrWhiteSpace(mobileNo))
                return false;

            return await _repository.GetAll()
                .Where(e => e.MobileNumber1 == mobileNo)
                .WhereIf(id.HasValue, e => e.Id != id)
                .AnyAsync();
        }

        /// <summary>
        /// Checks is specified email already used by another person
        /// </summary>
        /// <returns></returns>
        private async Task<bool> EmailAlreadyInUseAsync(string? email, Guid? id)
        {
            if (string.IsNullOrWhiteSpace(email))
                return false;

            return await _repository.GetAll()
                .Where(e => e.EmailAddress1 == email)
                .WhereIf(id.HasValue, e => e.Id != id)
                .AnyAsync();
        }
    }
}
