namespace Shesha.FluentMigrator
{
    public class SnakeCaseDbObjectNames : IDbObjectNames
    {
        public string CreationTimeColumn => "creation_time";

        public string CreatorUserId => "creator_user_id";

        public string IsDeletedColumn => "is_deleted";

        public string DeletionTimeColumn => "deletion_time";

        public string DeleterUserIdColumn => "deleter_user_id";

        public string TenantIdColumn => "tenant_id";

        public string LastModificationTimeColumn => "last_modification_time";

        public string LastModifierUserIdColumn => "last_modifier_user_id";

        public static SnakeCaseDbObjectNames Instance = new SnakeCaseDbObjectNames();
    }
}
