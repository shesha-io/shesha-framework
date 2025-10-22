namespace Shesha.Authorization.Roles
{
    public static class StaticRoleNames
    {
        /// <summary>
        /// System Administrator role name
        /// </summary>
        public const string SystemAdministrator = "System Administrator";

        public static class Host
        {
            public const string Admin = "Application Administrator";
            public const string Dev = "Application Developer";
            public const string Config = "Application Configurator";
        }

        public static class Tenants
        {
            public const string Admin = "Application Administrator";
            public const string Dev = "Application Developer";
            public const string Config = "Application Configurator";
        }
    }
}
