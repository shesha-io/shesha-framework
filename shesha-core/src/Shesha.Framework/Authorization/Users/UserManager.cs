using Abp.Authorization;
using Abp.Authorization.Users;
using Abp.Configuration;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.IdentityFramework;
using Abp.Json;
using Abp.Organizations;
using Abp.Runtime.Caching;
using Abp.Runtime.Validation;
using Abp.UI;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Shesha.Authorization.Roles;
using Shesha.Configuration;
using Shesha.Configuration.Security;
using Shesha.Extensions;
using Shesha.Settings;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Authorization.Users
{
    public class UserManager : AbpUserManager<Role, User>
    {
        private readonly IOptions<IdentityOptions> _optionsAccessor;
        
        private readonly IPasswordComplexitySettings _passwordComplexitySettings;
        private readonly ISecuritySettings _securitySettings;

        public UserManager(
            RoleManager roleManager,
            UserStore store, 
            IOptions<IdentityOptions> optionsAccessor, 
            IPasswordHasher<User> passwordHasher, 
            IEnumerable<IUserValidator<User>> userValidators, 
            IEnumerable<IPasswordValidator<User>> passwordValidators,
            ILookupNormalizer keyNormalizer, 
            IdentityErrorDescriber errors, 
            IServiceProvider services, 
            ILogger<UserManager<User>> logger, 
            IPermissionManager permissionManager, 
            IUnitOfWorkManager unitOfWorkManager, 
            ICacheManager cacheManager, 
            IRepository<OrganizationUnit, long> organizationUnitRepository, 
            IRepository<UserOrganizationUnit, long> userOrganizationUnitRepository, 
            IOrganizationUnitSettings organizationUnitSettings, 
            ISettingManager settingManager,
            IShaSettingManager settingProvider,
            IPasswordComplexitySettings passwordComplexitySettings,
            ISecuritySettings securitySettings,
            IRepository<UserLogin, Int64> loginRepository)
            : base(
                roleManager, 
                store, 
                optionsAccessor, 
                passwordHasher, 
                userValidators, 
                passwordValidators, 
                keyNormalizer, 
                errors, 
                services, 
                logger, 
                permissionManager, 
                unitOfWorkManager, 
                cacheManager,
                organizationUnitRepository, 
                userOrganizationUnitRepository, 
                organizationUnitSettings, 
                settingManager,
                loginRepository)
        {
            _optionsAccessor = optionsAccessor;
            _passwordComplexitySettings = passwordComplexitySettings;
            _securitySettings = securitySettings;
        }

        protected override void Dispose(bool disposing)
        {
            base.Dispose(disposing);
        }

        /// <summary>
        /// Removes the specified <paramref name="user" /> from the named role.
        /// </summary>
        /// <param name="user">The user to remove from the named role.</param>
        /// <param name="role">The name of the role to remove the user from.</param>
        /// <returns>
        /// The <see cref="T:System.Threading.Tasks.Task" /> that represents the asynchronous operation, containing the <see cref="T:Microsoft.AspNetCore.Identity.IdentityResult" />
        /// of the operation.
        /// </returns>
        //[DebuggerStepThrough]
        public override async Task<IdentityResult> RemoveFromRoleAsync(
            User user,
            string role)
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user));

            if (string.IsNullOrWhiteSpace(role))
                throw new ArgumentNullException(nameof(role));

            var roleEntity = await RoleManager.FindByNameAsync(role);
            if (roleEntity == null)
                return IdentityResult.Failed(new IdentityError() { Description = $"Role `{role}` not found" });

            var toRemove = user.Roles.Where(r => r.RoleId == roleEntity.Id).ToList();
            foreach (var roleToRemove in toRemove)
            {
                user.Roles.Remove(roleToRemove);
            }
            
            return IdentityResult.Success;
        }

        public override async Task<IdentityResult> SetRolesAsync(User user, string[] roleNames)
        {
            await AbpUserStore.UserRepository.EnsureCollectionLoadedAsync(user, u => u.Roles);

            //Remove from removed roles
            foreach (var userRole in user.Roles.ToList())
            {
                var role = await RoleManager.FindByIdAsync(userRole.RoleId.ToString());
                if (role != null && roleNames.All(roleName => !role.Name.Equals(roleName, StringComparison.InvariantCultureIgnoreCase)))
                {
                    var result = await RemoveFromRoleAsync(user, role.Name);
                    if (!result.Succeeded)
                    {
                        return result;
                    }
                }
            }

            //Add to added roles
            foreach (var roleName in roleNames)
            {
                var role = await RoleManager.GetRoleByNameAsync(roleName);
                if (user.Roles.All(ur => ur.RoleId != role.Id))
                {
                    var result = await AddToRoleAsync(user, roleName);
                    if (!result.Succeeded)
                    {
                        return result;
                    }
                }
            }

            return IdentityResult.Success;
        }

        public override async Task<IdentityResult> CheckDuplicateUsernameOrEmailAddressAsync(long? expectedUserId, string userName, string emailAddress)
        {
            try
            {
                var normalizedUsername = NormalizeName(userName);
                var duplicate = await AbpUserStore.UserRepository.FirstOrDefaultAsync(u => u.NormalizedUserName == normalizedUsername && u.Id != expectedUserId);
                if (duplicate != null)
                {
                    throw new UserFriendlyException(string.Format(L("Identity.DuplicateUserName"), userName));
                }

                /* temporary disabled
                if (!string.IsNullOrWhiteSpace(emailAddress))
                {
                    var normalizedEmail = NormalizeEmail(emailAddress);

                    duplicate = await AbpUserStore.UserRepository.FirstOrDefaultAsync(u => u.NormalizedEmailAddress == normalizedEmail && u.Id != expectedUserId);
                    if (duplicate != null)
                    {
                        throw new UserFriendlyException(string.Format(L("Identity.DuplicateEmail"), emailAddress));
                    }
                }
                */

                return IdentityResult.Success;
            }
            catch
            {
                throw;
            }
        }

        // permissions
        public override Task<bool> IsGrantedAsync(User user, Abp.Authorization.Permission permission)
        {
            var fdc = FeatureDependencyContext;
            return base.IsGrantedAsync(user, permission);
        }

        /// <summary>
        /// Creates a User Account with basic user details and default roles.
        /// </summary>
        /// <param name="username"></param>
        /// <param name="createLocalPassword"></param>
        /// <param name="password"></param>
        /// <param name="passwordConfirmation"></param>
        /// <param name="firstname"></param>
        /// <param name="lastname"></param>
        /// <param name="mobileNumber"></param>
        /// <param name="emailAddress"></param>
        /// <param name="requireChangePassword"></param>
        /// <param name="supportedPasswordResetMethods"></param>
        /// <returns>Returns the User object representing the newly created User Account. If parameters were incorrect will through 
        /// a AbpValidationException exception that can be allowed through to the calling web app.</returns>
        public async Task<User> CreateUserAsync(string username, bool createLocalPassword, string password, string passwordConfirmation, string firstname, string lastname, string mobileNumber, string emailAddress, bool requireChangePassword, long? supportedPasswordResetMethods = null)
        {
            var validationResults = new List<ValidationResult>();

            if (string.IsNullOrWhiteSpace(username))
                validationResults.Add(new ValidationResult("Username is mandatory"));
            else
            // check duplicate usernames
            if (await UserNameAlreadyInUseAsync(username))
                validationResults.Add(new ValidationResult("User with the same username already exists"));

            if (createLocalPassword)
            {
                if (string.IsNullOrWhiteSpace(password))
                    validationResults.Add(new ValidationResult("Password is mandatory"));

                if (string.IsNullOrWhiteSpace(passwordConfirmation))
                    validationResults.Add(new ValidationResult("Password Confirmation is mandatory"));

                if (!string.IsNullOrWhiteSpace(password) &&
                    !string.IsNullOrWhiteSpace(passwordConfirmation) &&
                    password != passwordConfirmation)
                    validationResults.Add(new ValidationResult("Password Confirmation must be the same as Password"));
            }

            if (validationResults.Any())
                throw new AbpValidationException("Please correct the errors and try again", validationResults);

            // 1. create user
            var user = new User()
            {
                EmailAddress = emailAddress ?? "",
                PhoneNumber = mobileNumber ?? "",
                TenantId = AbpSession.TenantId,
                IsEmailConfirmed = true,
                UserName = username,
                //UserName ??= "", // just to prevent crash in the ABP layer, it should be validated before
                Name = firstname, // todo: make a decision how to handle duplicated properties in the User and Person classes (option 1 - use Person as a source and sync onw way, option 2 - remove duplicates from User, but in some cases we needn't Person for a user)
                Surname = lastname,
                RequireChangePassword = requireChangePassword,
                SupportedPasswordResetMethods = supportedPasswordResetMethods
            };


            user.SetNormalizedNames();
            await this.InitializeOptionsAsync(AbpSession.TenantId);

            var newPassword = createLocalPassword
                ? password 
                : Guid.NewGuid().ToString();
            CheckErrors(await CreateAsync(user, newPassword));

            return user;
        }

        protected virtual void CheckErrors(IdentityResult identityResult)
        {
            identityResult.CheckErrors(LocalizationManager);
        }

        /// <summary>
        /// Checks is specified username already used by another person
        /// </summary>
        /// <returns></returns>
        private async Task<bool> UserNameAlreadyInUseAsync(string username)
        {
            if (string.IsNullOrWhiteSpace(username))
                return false;

            var normalizedUsername = NormalizeName(username);
            return await Users.Where(u => u.NormalizedUserName == normalizedUsername).AnyAsync();
        }

        public override void InitializeOptions(int? tenantId)
        {
            Options = JsonConvert.DeserializeObject<IdentityOptions>(_optionsAccessor.Value.ToJsonString());

            //Lockout
            Options.Lockout.AllowedForNewUsers = _securitySettings.UserLockOutEnabled.GetValue();
            var lockoutSecs = _securitySettings.DefaultAccountLockoutSeconds.GetValue();
            Options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromSeconds(lockoutSecs);
            Options.Lockout.MaxFailedAccessAttempts = _securitySettings.MaxFailedAccessAttemptsBeforeLockout.GetValue();

            //Password complexity
            Options.Password.RequireDigit = _passwordComplexitySettings.RequireDigit.GetValue();
            Options.Password.RequireLowercase = _passwordComplexitySettings.RequireLowercase.GetValue();
            Options.Password.RequireNonAlphanumeric = _passwordComplexitySettings.RequireNonAlphanumeric.GetValue();
            Options.Password.RequireUppercase = _passwordComplexitySettings.RequireUppercase.GetValue();
            Options.Password.RequiredLength = _passwordComplexitySettings.RequiredLength.GetValue();
        }

        public override async Task InitializeOptionsAsync(int? tenantId)
        {
            Options = JsonConvert.DeserializeObject<IdentityOptions>(_optionsAccessor.Value.ToJsonString());

            //Lockout
            Options.Lockout.AllowedForNewUsers = await _securitySettings.UserLockOutEnabled.GetValueAsync();
            var lockoutSecs = await _securitySettings.DefaultAccountLockoutSeconds.GetValueAsync();
            Options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromSeconds(lockoutSecs);
            Options.Lockout.MaxFailedAccessAttempts = await _securitySettings.MaxFailedAccessAttemptsBeforeLockout.GetValueAsync();

            //Password complexity
            Options.Password.RequireDigit = await _passwordComplexitySettings.RequireDigit.GetValueAsync();
            Options.Password.RequireLowercase = await _passwordComplexitySettings.RequireLowercase.GetValueAsync();
            Options.Password.RequireNonAlphanumeric = await _passwordComplexitySettings.RequireNonAlphanumeric.GetValueAsync();
            Options.Password.RequireUppercase = await _passwordComplexitySettings.RequireUppercase.GetValueAsync();
            Options.Password.RequiredLength = await _passwordComplexitySettings.RequiredLength.GetValueAsync();
        }
    }
}
