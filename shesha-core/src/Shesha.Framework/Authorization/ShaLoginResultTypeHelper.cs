using System;
using Abp;
using Abp.Authorization;
using Abp.Dependency;
using Abp.UI;
using Microsoft.AspNetCore.Http;

namespace Shesha.Authorization
{
    public class ShaLoginResultTypeHelper : AbpServiceBase, ITransientDependency
    {
        public ShaLoginResultTypeHelper()
        {
            LocalizationSourceName = SheshaConsts.LocalizationSourceName;
        }

        public Exception CreateExceptionForFailedLoginAttempt(ShaLoginResultType result, string usernameOrEmailAddress, string tenancyName)
        {
            switch (result)
            {
                case ShaLoginResultType.Success:
                    return new Exception("Don't call this method with a success result!");
                case ShaLoginResultType.InvalidUserNameOrEmailAddress:
                case ShaLoginResultType.InvalidPassword:
                    return new AbpAuthorizationException(L("InvalidUserNameOrPassword"));
                case ShaLoginResultType.InvalidTenancyName:
                    return new AbpAuthorizationException(L("ThereIsNoTenantDefinedWithName{0}", tenancyName));
                case ShaLoginResultType.TenantIsNotActive:
                    return new AbpAuthorizationException(L("TenantIsNotActive", tenancyName));
                case ShaLoginResultType.UserIsNotActive:
                    return new AbpAuthorizationException(L("UserIsNotActiveAndCanNotLogin", usernameOrEmailAddress));
                case ShaLoginResultType.UserEmailIsNotConfirmed:
                    return new AbpAuthorizationException(L("UserEmailIsNotConfirmedAndCanNotLogin"));
                case ShaLoginResultType.LockedOut:
                    return new AbpAuthorizationException(L("UserLockedOutMessage"));
                case ShaLoginResultType.DeviceNotRegistered:
                    return new AbpAuthorizationException(L("DeviceNotRegisteredMessage"));
                default: // Can not fall to default actually. But other result types can be added in the future and we may forget to handle it
                    Logger.Warn("Unhandled login fail reason: " + result);
                    return new UserFriendlyException(L("LoginFailed"));
            }
        }

        public string CreateLocalizedMessageForFailedLoginAttempt(ShaLoginResultType result, string usernameOrEmailAddress, string tenancyName)
        {
            switch (result)
            {
                case ShaLoginResultType.Success:
                    throw new Exception("Don't call this method with a success result!");
                case ShaLoginResultType.InvalidUserNameOrEmailAddress:
                case ShaLoginResultType.InvalidPassword:
                    return L("InvalidUserNameOrPassword");
                case ShaLoginResultType.InvalidTenancyName:
                    return L("ThereIsNoTenantDefinedWithName{0}", tenancyName);
                case ShaLoginResultType.TenantIsNotActive:
                    return L("TenantIsNotActive", tenancyName);
                case ShaLoginResultType.UserIsNotActive:
                    return L("UserIsNotActiveAndCanNotLogin", usernameOrEmailAddress);
                case ShaLoginResultType.UserEmailIsNotConfirmed:
                    return L("UserEmailIsNotConfirmedAndCanNotLogin");
                default: // Can not fall to default actually. But other result types can be added in the future and we may forget to handle it
                    Logger.Warn("Unhandled login fail reason: " + result);
                    return L("LoginFailed");
            }
        }
    }
}
