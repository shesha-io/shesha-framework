using Abp;
using Abp.Dependency;
using Abp.UI;
using Shesha.Abp.Authorization;
using System;

namespace Shesha.Authorization
{
    public class ShaLoginResultTypeHelper : AbpServiceBase, ITransientDependency
    {
        public ShaLoginResultTypeHelper()
        {
            LocalizationSourceName = SheshaConsts.LocalizationSourceName;
        }

        public Exception CreateExceptionForFailedLoginAttempt(ShaLoginResultType result, string usernameOrEmailAddress, string? tenancyName)
        {
            switch (result)
            {
                case ShaLoginResultType.Success:
                    return new Exception("Don't call this method with a success result!");
                case ShaLoginResultType.InvalidUserNameOrEmailAddress:
                case ShaLoginResultType.InvalidPassword:
                    return new SheshaAuthorizationException(L("InvalidUserNameOrPassword"));
                case ShaLoginResultType.InvalidTenancyName:
                    return new SheshaAuthorizationException(L("ThereIsNoTenantDefinedWithName{0}", tenancyName));
                case ShaLoginResultType.TenantIsNotActive:
                    return new SheshaAuthorizationException(L("TenantIsNotActive", tenancyName));
                case ShaLoginResultType.UserIsNotActive:
                    return new SheshaAuthorizationException(L("UserIsNotActiveAndCanNotLogin", usernameOrEmailAddress));
                case ShaLoginResultType.UserEmailIsNotConfirmed:
                    return new SheshaAuthorizationException(L("UserEmailIsNotConfirmedAndCanNotLogin"));
                case ShaLoginResultType.LockedOut:
                    return new SheshaAuthorizationException(L("UserLockedOutMessage"));
                case ShaLoginResultType.DeviceNotRegistered:
                    return new SheshaAuthorizationException(L("DeviceNotRegisteredMessage"));
                case ShaLoginResultType.UserNotFound:
                    return new SheshaAuthorizationException(L("UserNotFound"));
                case ShaLoginResultType.InvalidOTP:
                    return new SheshaAuthorizationException(L("InvalidOTP"));
                case ShaLoginResultType.ForbiddenFrontend:
                    return new SheshaAuthorizationException(L("ForbiddenFrontend"));

                default: // Can not fall to default actually. But other result types can be added in the future and we may forget to handle it
                    Logger.Warn("Unhandled login fail reason: " + result);
                    return new UserFriendlyException(L("LoginFailed"));
            }
        }
    }
}
