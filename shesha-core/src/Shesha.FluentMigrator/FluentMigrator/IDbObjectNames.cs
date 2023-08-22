namespace Shesha.FluentMigrator
{
    /// <summary>
    /// Standard names of the DB objects (framework tables and columns)
    /// </summary>
    public interface IDbObjectNames
    {
        string CreationTimeColumn { get; }
        string CreatorUserId { get; }
        string IsDeletedColumn { get; }
        string DeletionTimeColumn { get; }
        string DeleterUserIdColumn { get; }
        string TenantIdColumn { get; }
        string LastModificationTimeColumn { get; }
        string LastModifierUserIdColumn { get; }
    }
}
