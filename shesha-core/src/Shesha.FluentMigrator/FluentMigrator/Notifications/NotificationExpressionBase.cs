using FluentMigrator.Expressions;

namespace Shesha.FluentMigrator.Notifications
{
    public abstract class NotificationExpressionBase: MigrationExpressionBase
    {
        public string Name { get; set; }
        public string Namespace { get; set; }

        protected NotificationExpressionBase(string @namespace, string name)
        {
            Namespace = @namespace;
            Name = name;
        }
    }
}
