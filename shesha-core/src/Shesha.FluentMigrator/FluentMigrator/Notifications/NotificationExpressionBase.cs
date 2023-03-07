using FluentMigrator;
using FluentMigrator.Expressions;

namespace Shesha.FluentMigrator.Notifications
{
    public abstract class NotificationExpressionBase: MigrationExpressionBase
    {
        public string Name { get; set; }
        public string Namespace { get; set; }
    }
}
