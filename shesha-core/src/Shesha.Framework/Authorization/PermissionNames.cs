namespace Shesha.Authorization
{
    public static class PermissionNames
    {
        /// <summary>
        /// Application Configurator
        /// </summary>
        public const string Application_Configurator = "app:Configurator";
        public const string Pages_Users = "Pages.Users";
        public const string Pages_Roles = "Pages.Roles";
        public const string Pages_Hangfire = "Pages.Hangfire";
        public const string Pages_Maintenance = "pages:maintenance";
        public const string Users_ResetPassword = "users:resetPassword";
        public const string Pages_ApplicationSettings = "pages:applicationSettings";

        /* to be added
SheshaApplication.Configure
SheshaApplication.Administer
Hangfire-View OR Just regular 'Shesha.System-Administrator'
User.View
User.Manage
Account.Select
Account.View
Account.Create
Account.Update
Account.Delete
Person.View
Person.Select
Person.Create
Person.Update
Person.Delete
Organisation.View
Organisation.Select
Organisation.Create
Organisation.Update
Organisation.Delete
         */

        /* to be removed
        public const string Pages_ShaRoles = "pages:shaRoles";
        */
    }
}
