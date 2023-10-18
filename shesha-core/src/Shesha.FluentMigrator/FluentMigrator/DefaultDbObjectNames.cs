namespace Shesha.FluentMigrator
{
    public class DefaultDbObjectNames : IDbObjectNames
    {
        public string CreationTimeColumn => DatabaseConsts.CreationTimeColumn;

        public string CreatorUserId => DatabaseConsts.CreatorUserId;

        public string IsDeletedColumn => DatabaseConsts.IsDeletedColumn;

        public string DeletionTimeColumn => DatabaseConsts.DeletionTimeColumn;

        public string DeleterUserIdColumn => DatabaseConsts.DeleterUserIdColumn;

        public string TenantIdColumn => DatabaseConsts.TenantIdColumn;

        public string LastModificationTimeColumn => DatabaseConsts.LastModificationTimeColumn;

        public string LastModifierUserIdColumn => DatabaseConsts.LastModifierUserIdColumn;
    }
}
