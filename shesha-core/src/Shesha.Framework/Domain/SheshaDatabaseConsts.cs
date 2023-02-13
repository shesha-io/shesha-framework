namespace Shesha.Domain
{
    public static class SheshaDatabaseConsts
    {
        public static string IdColumn => "Id";

        public static string CreatorUserId => "CreatorUserId";
        public static string CreationTimeColumn => "CreationTime";

        public static string LastModificationTimeColumn => "LastModificationTime";
        public static string LastModifierUserIdColumn => "LastModifierUserId";


        public static string IsActiveColumn => "IsActive";

        public static string IsDeletedColumn => "IsDeleted";
        public static string DeletionTimeColumn => "DeletionTime";
        public static string DeleterUserIdColumn => "DeleterUserId";
        
        public static string TenantIdColumn => "TenantId";
        
        /// <summary>
        /// Entity link columns (for many-to-many link tables). ID
        /// </summary>
        public static string EntityIdColumn => "EntityId";

        /// <summary>
        /// Entity link columns (for many-to-many link tables). Type alias
        /// </summary>
        public static string EntityTypeColumn => "EntityType";

        public static string OwnerIdColumn => "Frwk_OwnerId";
        public static string OwnerTypeColumn => "Frwk_OwnerType";

        public static string DiscriminatorColumn => "Frwk_Discriminator";

        #region Framework Tables
        public static string TenantsTable => "AbpTenants";
        public static string UsersTable => "AbpUsers";
        #endregion

        public static int DiscriminatorMaxSize = 100;
    }
}
