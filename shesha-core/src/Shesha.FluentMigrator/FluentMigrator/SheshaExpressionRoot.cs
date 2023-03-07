using FluentMigrator;
using FluentMigrator.Infrastructure;
using Shesha.FluentMigrator.Notifications;
using Shesha.FluentMigrator.ReferenceLists;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.FluentMigrator
{
    /// <summary>
    /// ReferenceList fluent interface
    /// </summary>
    public class SheshaExpressionRoot : IFluentSyntax
    {
        private readonly IMigrationContext _context;

        /// <summary>
        /// Initializes a new instance of the <see cref="SheshaExpressionRoot"/> class.
        /// </summary>
        /// <param name="context">The migration context</param>
        public SheshaExpressionRoot(IMigrationContext context)
        {
            _context = context;
        }

        #region Reference Lists

        [Obsolete]
        public IAddReferenceListSyntax ReferenceListCreate(string @namespace, string name) 
        {
            var expression = new AddReferenceListExpression(_context.QuerySchema) { Namespace = @namespace, Name = name };
            
            _context.Expressions.Add(expression);

            return new AddReferenceListExpressionBuilder(expression, _context);
        }

        [Obsolete]
        public IDeleteReferenceListSyntax ReferenceListDelete(string @namespace, string name)
        {
            var expression = new DeleteReferenceListExpression(_context.QuerySchema) { Namespace = @namespace, Name = name };

            _context.Expressions.Add(expression);

            return new DeleteReferenceListExpressionBuilder(expression, _context);
        }

        [Obsolete]
        public IUpdateReferenceListSyntax ReferenceListUpdate(string @namespace, string name)
        {
            var expression = new UpdateReferenceListExpression(_context.QuerySchema) { Namespace = @namespace, Name = name };

            _context.Expressions.Add(expression);

            return new UpdateReferenceListExpressionBuilder(expression, _context);
        }

        #endregion


        #region Notifications and templates

        public IAddNotificationSyntax NotificationCreate(string @namespace, string name)
        {
            var expression = new AddNotificationExpression { Namespace = @namespace, Name = name };

            _context.Expressions.Add(expression);

            return new AddNotificationExpressionBuilder(expression, _context);
        }

        public IDeleteNotificationSyntax NotificationDelete(string @namespace, string name)
        {
            var expression = new DeleteNotificationExpression { Namespace = @namespace, Name = name };

            _context.Expressions.Add(expression);

            return new DeleteNotificationExpressionBuilder(expression, _context);
        }

        public IUpdateNotificationSyntax NotificationUpdate(string @namespace, string name)
        {
            var expression = new UpdateNotificationExpression { Namespace = @namespace, Name = name };

            _context.Expressions.Add(expression);

            return new UpdateNotificationExpressionBuilder(expression, _context);
        }

        
        public IAddNotificationTemplateSyntax NotificationTemplateCreate(string @namespace, string name)
        {
            var expression = new AddNotificationTemplateExpression { Namespace = @namespace, Name = name };

            _context.Expressions.Add(expression);

            return new AddNotificationTemplateExpressionBuilder(expression, _context);
        }

        public IDeleteNotificationTemplateSyntax NotificationTemplateDelete(Guid id)
        {
            var expression = new DeleteNotificationTemplateExpression { TemplateId = id };

            _context.Expressions.Add(expression);

            return new DeleteNotificationTemplateExpressionBuilder(expression, _context);
        }

        public IUpdateNotificationTemplateSyntax NotificationTemplateUpdate(Guid id)
        {
            var expression = new UpdateNotificationTemplateExpression { Id = id };

            _context.Expressions.Add(expression);

            return new UpdateNotificationTemplateExpressionBuilder(expression, _context);
        }

        #endregion
    }
}
