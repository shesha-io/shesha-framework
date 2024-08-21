using FluentMigrator;
using FluentMigrator.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Shesha.FluentMigrator.Notifications;
using Shesha.FluentMigrator.ReferenceLists;
using Shesha.FluentMigrator.Settings;

namespace Shesha.FluentMigrator
{
    /// <summary>
    /// ReferenceList fluent interface
    /// </summary>
    public class SheshaExpressionRoot : IFluentSyntax
    {
        private readonly IMigrationContext _context;
        private readonly MigrationBase _migration;

        /// <summary>
        /// Initializes a new instance of the <see cref="SheshaExpressionRoot"/> class.
        /// </summary>
        /// <param name="context">The migration context</param>
        public SheshaExpressionRoot(IMigrationContext context, MigrationBase migration)
        {
            _context = context;
            _migration = migration;
        }

        #region Reference Lists

        [Obsolete]
        public IAddReferenceListSyntax ReferenceListCreate(string @namespace, string name) 
        {
            var expression = new AddReferenceListExpression(_context.QuerySchema, @namespace, name);
            
            _context.Expressions.Add(expression);

            return new AddReferenceListExpressionBuilder(expression, _context);
        }

        [Obsolete]
        public IDeleteReferenceListSyntax ReferenceListDelete(string @namespace, string name)
        {
            var expression = new DeleteReferenceListExpression(_context.QuerySchema, @namespace, name);

            _context.Expressions.Add(expression);

            return new DeleteReferenceListExpressionBuilder(expression, _context);
        }

        [Obsolete]
        public IUpdateReferenceListSyntax ReferenceListUpdate(string @namespace, string name)
        {
            var expression = new UpdateReferenceListExpression(_context.QuerySchema, @namespace, name);

            _context.Expressions.Add(expression);

            return new UpdateReferenceListExpressionBuilder(expression, _context);
        }

        #endregion


        #region Notifications and templates

        public IAddNotificationSyntax NotificationCreate(string @namespace, string name)
        {
            var expression = new AddNotificationExpression(@namespace, name);

            _context.Expressions.Add(expression);

            return new AddNotificationExpressionBuilder(expression, _context);
        }

        public IDeleteNotificationSyntax NotificationDelete(string @namespace, string name)
        {
            var expression = new DeleteNotificationExpression(@namespace, name);

            _context.Expressions.Add(expression);

            return new DeleteNotificationExpressionBuilder(expression, _context);
        }

        public IUpdateNotificationSyntax NotificationUpdate(string @namespace, string name)
        {
            var expression = new UpdateNotificationExpression (@namespace, name);

            _context.Expressions.Add(expression);

            return new UpdateNotificationExpressionBuilder(expression, _context);
        }

        
        public IAddNotificationTemplateSyntax NotificationTemplateCreate(string @namespace, string name)
        {
            var expression = new AddNotificationTemplateExpression(@namespace, name);

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

        #region Settings

        public IAddSettingConfigurationSyntax SettingCreate(string name, string displayName)
        {
            var moduleLocator = _context.ServiceProvider.GetRequiredService<IModuleLocator>();
            var moduleName = moduleLocator.GetModuleName(_migration.GetType());

            var expression = new AddSettingConfigurationExpression(moduleName, name, displayName);

            _context.Expressions.Add(expression);

            return new AddSettingConfigurationExpressionBuilder(expression, _context);
        }

        public IUpdateSettingConfigurationSyntax SettingUpdate(string name) 
        {
            var moduleLocator = _context.ServiceProvider.GetRequiredService<IModuleLocator>();
            var moduleName = moduleLocator.GetModuleName(_migration.GetType());

            var expression = new UpdateSettingConfigurationExpression(moduleName, name);

            _context.Expressions.Add(expression);

            return new UpdateSettingConfigurationExpressionBuilder(expression, _context);
        }

        public IDeleteSettingConfigurationSyntax SettingDelete(string name)
        {
            var moduleLocator = _context.ServiceProvider.GetRequiredService<IModuleLocator>();
            var moduleName = moduleLocator.GetModuleName(_migration.GetType());

            var expression = new DeleteSettingConfigurationExpression(moduleName, name);

            _context.Expressions.Add(expression);

            return new DeleteSettingConfigurationExpressionBuilder(expression, _context);
        }

        #endregion
    }
}
