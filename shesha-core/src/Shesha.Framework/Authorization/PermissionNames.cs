namespace Shesha.Authorization
{
    public static class PermissionNames
    {
        private const string Prefix = "";

        /* to be removed
        public const string Pages_ShaRoles = "pages:shaRoles";
        */
        public const string Application_Configure = Prefix + "Application-Configure"; // app:Configurator
        public const string Application_Administer = Prefix + "Application-Administer";
        public const string Application_Settings = Prefix + "Application-Settings"; // pages:applicationSettings
        public const string Application_Maintenance = Prefix + "Application-Maintenance"; // pages:maintenance

        public const string Hangfire_Dashboard = Prefix + "Hangfire-Dashboard"; // Pages.Hangfire

        public const string User_View = Prefix + "User-View"; // Pages.Users
        public const string User_Manage = Prefix + "User-Manage"; // Pages.Users
        public const string User_ResetPassword = Prefix + "User-ResetPassword"; // users:resetPassword

        public const string Role_Manage = Prefix + "Role-Manage"; // Pages.Roles

        public const string Account_View = Prefix + "Account-View";
        public const string Account_Create = Prefix + "Account-Create";
        public const string Account_Update = Prefix + "Account-Update";
        public const string Account_Delete = Prefix + "Account-Delete";

        public const string Person_View = Prefix + "Person-View";
        public const string Person_Create = Prefix + "Person-Create";
        public const string Person_Update = Prefix + "Person-Update";
        public const string Person_Delete = Prefix + "Person-Delete";

        public const string Organisation_View = Prefix + "Organisation-View";
        public const string Organisation_Create = Prefix + "Organisation-Create";
        public const string Organisation_Update = Prefix + "Organisation-Update";
        public const string Organisation_Delete = Prefix + "Organisation-Delete";
    }
}
