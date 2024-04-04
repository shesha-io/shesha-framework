using FluentMigrator;
using FluentMigrator.Expressions;

namespace Shesha.FluentMigrator.Notifications
{
    /// <summary>
    /// Notification update expression
    /// </summary>
    public class UpdateNotificationExpression : NotificationExpressionBase
    {
        public PropertyUpdateDefinition<string> Description { get; set; } = new PropertyUpdateDefinition<string>();

        public override void ExecuteWith(IMigrationProcessor processor)
        {
            var exp = new PerformDBOperationExpression() { Operation = (connection, transaction) => 
                {
                    var helper = new NotificationDbHelper(connection, transaction);
                    var id = helper.GetNotificationId(Namespace, Name);
                    if (id == null)
                        return;

                    if (Description.IsSet)
                        helper.UpdateNotificationDescription(id, Description.Value);
                } 
            };
            processor.Process(exp);
        }

        public UpdateNotificationExpression(string @namespace, string name) : base(@namespace, name) 
        { 
        }
    }
}
