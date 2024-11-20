using FluentMigrator;
using FluentMigrator.Expressions;

namespace Shesha.FluentMigrator.Notifications
{
    /// <summary>
    /// Notification delete expression
    /// </summary>
    public class DeleteNotificationExpression : SheshaMigrationExpressionBase
    {
        public string Name { get; private set; }
        public string Namespace { get; private set; }

        public override void ExecuteWith(IMigrationProcessor processor)
        {
            var exp = new PerformDBOperationExpression() { Operation = (connection, transaction) => 
                {
                    var helper = new NotificationDbHelper(DbmsType, connection, transaction, QuerySchema);
                    helper.DeleteNotificationTemplates(Namespace, Name);
                    helper.DeleteNotification(Namespace, Name);
                } 
            };
            processor.Process(exp);
        }

        public DeleteNotificationExpression(DbmsType dbmsType, IQuerySchema querySchema, string @namespace, string name) : base(dbmsType, querySchema)
        {
            Namespace = @namespace;
            Name = name;
        }
    }
}
