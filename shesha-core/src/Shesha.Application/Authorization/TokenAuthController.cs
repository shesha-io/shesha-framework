using Abp.Authorization;
using Abp.Authorization.Users;
using Abp.Domain.Repositories;
using Abp.MultiTenancy;
using Abp.Runtime.Security;
using Abp.UI;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Shesha.Authentication.External;
using Shesha.Authentication.JwtBearer;
using Shesha.Authorization.Models;
using Shesha.Authorization.Users;
using Shesha.Controllers;
using Shesha.Domain;
using Shesha.Extensions;
using Shesha.Models.TokenAuth;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Shesha.Authorization
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    [AllowAnonymous]
    public class TokenAuthController : SheshaControllerBase
    {
        private readonly LogInManager _logInManager;
        private readonly ITenantCache _tenantCache;
        private readonly ShaLoginResultTypeHelper _shaLoginResultTypeHelper;
        private readonly TokenAuthConfiguration _configuration;
        private readonly IRepository<ShaUserRegistration, Guid> _userRegistration;
        private readonly IExternalAuthConfiguration _externalAuthConfiguration;
        private readonly IExternalAuthManager _externalAuthManager;
        private readonly UserRegistrationManager _userRegistrationManager;
        private readonly IRepository<Person, Guid> _personRepository;
        private readonly IRepository<MobileDevice, Guid> _mobileDeviceRepository;

        public TokenAuthController(
            LogInManager logInManager,
            ITenantCache tenantCache,
            ShaLoginResultTypeHelper ShaLoginResultTypeHelper,
            TokenAuthConfiguration configuration,
            IExternalAuthConfiguration externalAuthConfiguration,
            IExternalAuthManager externalAuthManager,
            UserRegistrationManager userRegistrationManager,
            IRepository<Person, Guid> personRepository,
            IRepository<ShaUserRegistration, Guid> userRegistration,
            IRepository<MobileDevice, Guid> mobileDeviceRepository)
        {
            _logInManager = logInManager;
            _tenantCache = tenantCache;
            _shaLoginResultTypeHelper = ShaLoginResultTypeHelper;
            _configuration = configuration;
            _externalAuthConfiguration = externalAuthConfiguration;
            _externalAuthManager = externalAuthManager;
            _userRegistrationManager = userRegistrationManager;
            _personRepository = personRepository;
            _mobileDeviceRepository = mobileDeviceRepository;
            _userRegistration = userRegistration;
        }

        [HttpPost]
        public async Task<AuthenticateResultModel> Authenticate([FromBody] AuthenticateModel model)
        {
            // Check for user registration status
            var registration = await _userRegistration.FirstOrDefaultAsync(e => e.UserNameOrEmailAddress == model.UserNameOrEmailAddress);

            if (registration != null && !registration.IsComplete)
            {
                // Return a result indicating a client-side redirect
                return new AuthenticateResultModel
                {
                    ResultType = AuthenticateResultType.RedirectNoAuth,
                    RedirectModule = registration.AdditionalRegistrationInfoForm.Module,
                    RedirectForm = registration.AdditionalRegistrationInfoForm.Name
                };
            }

            // Attempt login authentication
            var loginResult = await GetLoginResultAsync(
                model.UserNameOrEmailAddress,
                model.Password,
                model.IMEI,
                GetTenancyNameOrNull()
            );

            // Return the authenticate result
            var authenticateResult = await GetAuthenticateResultAsync(loginResult, model.IMEI);
            return authenticateResult;
        }

        private async Task<AuthenticateResultModel> GetAuthenticateResultAsync(ShaLoginResult<User> loginResult, string imei) 
        {
            var accessToken = CreateAccessToken(CreateJwtClaims(loginResult.Identity));

            var expireInSeconds = (int)_configuration.Expiration.TotalSeconds;

            var personId = loginResult?.User != null
                ? _personRepository.GetAll()
                    .Where(p => p.User == loginResult.User)
                    .OrderBy(p => p.CreationTime)
                    .Select(p => p.Id).FirstOrDefault()
                : (Guid?)null;
            var device = !string.IsNullOrWhiteSpace(imei)
                ? await _mobileDeviceRepository.FirstOrDefaultAsync(e => e.IMEI == imei.Trim())
                : null;

            return new AuthenticateResultModel
            {
                AccessToken = accessToken,
                EncryptedAccessToken = GetEncryptedAccessToken(accessToken),
                ExpireInSeconds = expireInSeconds,
                ExpireOn = DateTime.Now.AddSeconds(expireInSeconds),
                UserId = loginResult.User.Id,
                PersonId = personId,
                DeviceName = device?.Name,
                ResultType = AuthenticateResultType.Success
            };
        }

        [HttpPost]
        public bool SignOff()
        {
            return true;
        }

        #region OTP Login

        /// <summary>
        /// Send authentication one-time pin to the user with a specified <paramref name="userNameOrMobileNo"/>
        /// </summary>
        [AbpAllowAnonymous]
        [HttpPost]
        public async Task<OtpAuthenticateSendPinResponse> OtpAuthenticateSendPin(string userNameOrMobileNo)
        {
            var persons = await _personRepository.GetAll().Where(u => u.MobileNumber1 == userNameOrMobileNo || u.User.UserName == userNameOrMobileNo).ToListAsync();
            if (!persons.Any())
                throw new UserFriendlyException("User with the specified mobile number not found");
            if (persons.Count() > 1)
                throw new UserFriendlyException("Found more that one user with the specified mobile number");

            var person = persons.First();

            if (person.User == null)
                throw new UserFriendlyException("User with the specified mobile has no internal account");

            var sendPinResponse = await _logInManager.SendLoginOtpAsync(person.User, person.MobileNumber1);

            return new OtpAuthenticateSendPinResponse
            {
                OperationId = sendPinResponse.OperationId
            };
        }

        [HttpPost]
        public async Task<AuthenticateResultModel> OtpAuthenticate([FromBody] OtpAuthenticateModel model)
        {
            var tenancyName = GetTenancyNameOrNull();
            var loginResult = await _logInManager.LoginViaOtpAsync(model.MobileNo, model.OperationId, model.Code, model.IMEI, tenancyName);

            switch (loginResult.Result)
            {
                case ShaLoginResultType.Success:
                    return await GetAuthenticateResultAsync(loginResult, model.IMEI);
                default:
                    throw _shaLoginResultTypeHelper.CreateExceptionForFailedLoginAttempt(loginResult.Result, model.MobileNo, tenancyName);
            }
        }

        #endregion

        [HttpGet]
        public List<ExternalLoginProviderInfoModel> GetExternalAuthenticationProviders()
        {
            return ObjectMapper.Map<List<ExternalLoginProviderInfoModel>>(_externalAuthConfiguration.Providers);
        }

        [HttpPost]
        public async Task<ExternalAuthenticateResultModel> ExternalAuthenticate([FromBody] ExternalAuthenticateModel model)
        {
            var externalUser = await GetExternalUserInfo(model);

            var loginResult = await _logInManager.LoginAsync(new UserLoginInfo(model.AuthProvider, model.ProviderKey, model.AuthProvider), GetTenancyNameOrNull());

            switch (loginResult.Result)
            {
                case ShaLoginResultType.Success:
                    {
                        var accessToken = CreateAccessToken(CreateJwtClaims(loginResult.Identity));
                        return new ExternalAuthenticateResultModel
                        {
                            AccessToken = accessToken,
                            EncryptedAccessToken = GetEncryptedAccessToken(accessToken),
                            ExpireInSeconds = (int)_configuration.Expiration.TotalSeconds
                        };
                    }
                case ShaLoginResultType.UnknownExternalLogin:
                    {
                        var newUser = await RegisterExternalUserAsync(externalUser);
                        if (!newUser.IsActive)
                        {
                            return new ExternalAuthenticateResultModel
                            {
                                WaitingForActivation = true
                            };
                        }

                        // Try to login again with newly registered user!
                        loginResult = await _logInManager.LoginAsync(new UserLoginInfo(model.AuthProvider, model.ProviderKey, model.AuthProvider), GetTenancyNameOrNull());
                        if (loginResult.Result != ShaLoginResultType.Success)
                        {
                            throw _shaLoginResultTypeHelper.CreateExceptionForFailedLoginAttempt(
                                loginResult.Result,
                                model.ProviderKey,
                                GetTenancyNameOrNull()
                            );
                        }

                        return new ExternalAuthenticateResultModel
                        {
                            AccessToken = CreateAccessToken(CreateJwtClaims(loginResult.Identity)),
                            ExpireInSeconds = (int)_configuration.Expiration.TotalSeconds
                        };
                    }
                default:
                    {
                        throw _shaLoginResultTypeHelper.CreateExceptionForFailedLoginAttempt(
                            loginResult.Result,
                            model.ProviderKey,
                            GetTenancyNameOrNull()
                        );
                    }
            }
        }

        private async Task<User> RegisterExternalUserAsync(ExternalAuthUserInfo externalUser)
        {
            var user = await _userRegistrationManager.RegisterAsync(
                externalUser.Name,
                externalUser.Surname,
                externalUser.EmailAddress,
                externalUser.EmailAddress,
                Authorization.Users.User.CreateRandomPassword(),
                true
            );

            user.Logins = new List<UserLogin>
            {
                new UserLogin
                {
                    LoginProvider = externalUser.Provider,
                    ProviderKey = externalUser.ProviderKey,
                    TenantId = user.TenantId
                }
            };

            await CurrentUnitOfWork.SaveChangesAsync();

            return user;
        }

        private async Task<ExternalAuthUserInfo> GetExternalUserInfo(ExternalAuthenticateModel model)
        {
            var userInfo = await _externalAuthManager.GetUserInfoAsync(model.AuthProvider, model.ProviderAccessCode);
            if (userInfo.ProviderKey != model.ProviderKey)
            {
                throw new UserFriendlyException(L("CouldNotValidateExternalUser"));
            }

            return userInfo;
        }

        [DebuggerStepThrough]
        private string GetTenancyNameOrNull()
        {
            if (!AbpSession.TenantId.HasValue)
            {
                return null;
            }

            return _tenantCache.GetOrNull(AbpSession.TenantId.Value)?.TenancyName;
        }

        private async Task<ShaLoginResult<User>> GetLoginResultAsync(string usernameOrEmailAddress, string password, string imei, string tenancyName)
        {
            var loginResult = await _logInManager.LoginAsync(usernameOrEmailAddress, password, imei, tenancyName);

            switch (loginResult.Result)
            {
                case ShaLoginResultType.Success:
                    return loginResult;
                default:
                    throw _shaLoginResultTypeHelper.CreateExceptionForFailedLoginAttempt(loginResult.Result, usernameOrEmailAddress, tenancyName);
            }
        }

        private string CreateAccessToken(IEnumerable<Claim> claims, TimeSpan? expiration = null)
        {
            var now = DateTime.UtcNow;

            var jwtSecurityToken = new JwtSecurityToken(
                issuer: _configuration.Issuer,
                audience: _configuration.Audience,
                claims: claims,
                notBefore: now,
                expires: now.Add(expiration ?? _configuration.Expiration),
                signingCredentials: _configuration.SigningCredentials
            );

            return new JwtSecurityTokenHandler().WriteToken(jwtSecurityToken);
        }

        private static List<Claim> CreateJwtClaims(ClaimsIdentity identity)
        {
            var claims = identity.Claims.ToList();
            var nameIdClaim = claims.First(c => c.Type == ClaimTypes.NameIdentifier);

            // Specifically add the jti (random nonce), iat (issued timestamp), and sub (subject/user) claims.
            claims.AddRange(new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, nameIdClaim.Value),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.Now.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)
            });

            return claims;
        }

        private string GetEncryptedAccessToken(string accessToken)
        {
            return SimpleStringCipher.Instance.Encrypt(accessToken, AppConsts.DefaultPassPhrase);
        }
    }
}
