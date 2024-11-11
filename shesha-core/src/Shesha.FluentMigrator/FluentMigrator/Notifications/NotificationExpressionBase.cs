using FluentMigrator;

namespace Shesha.FluentMigrator.Notifications
{
    public abstract class NotificationExpressionBase: SheshaMigrationExpressionBase
    {
        public string Name { get; private set; }
        public string Namespace { get; private set; }

        protected NotificationExpressionBase(DbmsType dbmsType, IQuerySchema querySchema, string @namespace, string name) : base(dbmsType, querySchema)
        {
            Namespace = @namespace;
            Name = name;
        }
    }
}
