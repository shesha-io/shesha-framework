using FluentMigrator;
using FluentMigrator.Expressions;

namespace Shesha.FluentMigrator.Notifications
{
    /// <summary>
    /// Notification delete expression
    /// </summary>
    public class DeleteNotificationExpression : MigrationExpressionBase
    {
        public string Name { get; set; }
        public string Namespace { get; set; }

        public override void ExecuteWith(IMigrationProcessor processor)
        {
            var exp = new PerformDBOperationExpression() { Operation = (connection, transaction) => 
                {
                    var helper = new NotificationDbHelper(connection, transaction);
                    helper.DeleteNotificationTemplates(Namespace, Name);
                    helper.DeleteNotification(Namespace, Name);
                } 
            };
            processor.Process(exp);
        }

    }
}
