using FluentMigrator.Builders;
using FluentMigrator.Infrastructure;

namespace Shesha.FluentMigrator.Notifications
{
    public class NotificationTemplateExpressionBuilderBase<TExpr, TNext>: ExpressionBuilderBase<TExpr> where TExpr: NotificationExpressionBase where TNext: class
    {
        protected readonly IMigrationContext _context;

        public NotificationTemplateExpressionBuilderBase(TExpr expression, IMigrationContext context) : base(expression)
        {
            _context = context;
        }

        private TNext NextExpression => this as TNext ?? throw new Exception($"Type mismatch. Expected {typeof(TNext).FullName}, actual: {this.GetType().FullName}");

        public TNext AddEmailTemplate(Guid id, string name, string subject, string body)
        {
            var template = new NotificationTemplateDefinition();
            template.Id.Set(id);
            template.Name.Set(name);
            template.Subject.Set(subject);
            template.Body.Set(body);

            template.IsEnabled.Set(true);
            template.SendType.Set(NotificationSendType.Email);
            template.BodyFormat.Set(NotificationTemplateType.Html);

            _context.Expressions.Add(new AddNotificationTemplateExpression(Expression.Namespace, Expression.Name)
            {
                Template = template
            });

            return NextExpression;
        }

        public TNext AddPushTemplate(Guid id, string name, string subject, string body)
        {
            var template = new NotificationTemplateDefinition();
            template.Id.Set(id);
            template.Name.Set(name);
            template.Subject.Set(subject);
            template.Body.Set(body);

            template.IsEnabled.Set(true);
            template.SendType.Set(NotificationSendType.Push);
            template.BodyFormat.Set(NotificationTemplateType.PlainText);

            _context.Expressions.Add(new AddNotificationTemplateExpression(Expression.Namespace, Expression.Name)
            {
                Template = template
            });

            return NextExpression;
        }

        public TNext AddSmsTemplate(Guid id, string name, string body)
        {
            var template = new NotificationTemplateDefinition();
            template.Id.Set(id);
            template.Name.Set(name);
            template.Body.Set(body);

            template.IsEnabled.Set(true);
            template.SendType.Set(NotificationSendType.SMS);
            template.BodyFormat.Set(NotificationTemplateType.PlainText);

            _context.Expressions.Add(new AddNotificationTemplateExpression(Expression.Namespace, Expression.Name)
            {
                Template = template
            });

            return NextExpression;
        }
    }
}
