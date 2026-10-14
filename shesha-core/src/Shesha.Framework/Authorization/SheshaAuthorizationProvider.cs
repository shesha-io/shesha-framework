using Abp.Authorization;
using Abp.Localization;

namespace Shesha.Authorization
{
    public class SheshaAuthorizationProvider : AuthorizationProvider
    {
        public override void SetPermissions(IPermissionDefinitionContext context)
        {
            context.CreatePermission(PermissionNames.Pages_Users, L("Users"));
            context.CreatePermission(PermissionNames.Pages_Roles, L("Roles"));
            context.CreatePermission(PermissionNames.Pages_Hangfire, L("Hangfire"));
            context.CreatePermission(PermissionNames.Application_Configurator, L("ApplicationConfigurator"));
            context.CreatePermission(PermissionNames.Pages_Maintenance, L("Maintenance"));
            context.CreatePermission(PermissionNames.Users_ResetPassword, L("Users_ResetPassword"));
            context.CreatePermission(PermissionNames.Pages_ApplicationSettings, L("ApplicationSettings"));

            //context.CreatePermission(PermissionNames.Pages_ShaRoles, L("ShaRoles"));
        }

        private static ILocalizableString L(string name)
        {
            return new LocalizableString(name, SheshaConsts.LocalizationSourceName);
        }
    }
}
