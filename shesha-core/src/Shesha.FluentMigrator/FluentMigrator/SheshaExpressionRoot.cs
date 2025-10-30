using FluentMigrator;
using FluentMigrator.Expressions;
using FluentMigrator.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Shesha.FluentMigrator.Modules;
using Shesha.FluentMigrator.Notifications;
using Shesha.FluentMigrator.ReferenceLists;
using Shesha.FluentMigrator.Settings;
using System.Reflection;

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

        private DbmsType DbmsType
        {
            get {
                var dbType = _context.QuerySchema is IMigrationProcessor mp
                    ? mp.DatabaseType
                    : null;
                return dbType switch {
                    "PostgreSQL" or "Postgres" => DbmsType.PostgreSQL,                     
                    "SQLServer" => DbmsType.SQLServer,
                    _ => DbmsType.SQLServer,
                };
            }
        }

        #region Reference Lists

    [Obsolete]
        public IAddReferenceListSyntax ReferenceListCreate(string @namespace, string name) 
        {
            var expression = new AddReferenceListExpression(DbmsType, _context.QuerySchema, @namespace, name);
            
            _context.Expressions.Add(expression);

            return new AddReferenceListExpressionBuilder(DbmsType, expression, _context);
        }

        [Obsolete]
        public IDeleteReferenceListSyntax ReferenceListDelete(string @namespace, string name)
        {
            var expression = new DeleteReferenceListExpression(DbmsType, _context.QuerySchema, @namespace, name);

            _context.Expressions.Add(expression);

            return new DeleteReferenceListExpressionBuilder(expression, _context);
        }

        [Obsolete]
        public IUpdateReferenceListSyntax ReferenceListUpdate(string @namespace, string name)
        {
            var expression = new UpdateReferenceListExpression(DbmsType, _context.QuerySchema, @namespace, name);

            _context.Expressions.Add(expression);

            return new UpdateReferenceListExpressionBuilder(DbmsType, expression, _context);
        }

        #endregion


        #region Notifications and templates

        public IAddNotificationSyntax NotificationCreate(string @namespace, string name)
        {
            var expression = new AddNotificationExpression(DbmsType, _context.QuerySchema, @namespace, name);

            _context.Expressions.Add(expression);

            return new AddNotificationExpressionBuilder(DbmsType, _context.QuerySchema, expression, _context);
        }

        public IDeleteNotificationSyntax NotificationDelete(string @namespace, string name)
        {
            var expression = new DeleteNotificationExpression(DbmsType, _context.QuerySchema, @namespace, name);

            _context.Expressions.Add(expression);

            return new DeleteNotificationExpressionBuilder(expression, _context);
        }

        public IUpdateNotificationSyntax NotificationUpdate(string @namespace, string name)
        {
            var expression = new UpdateNotificationExpression(DbmsType, _context.QuerySchema, @namespace, name);

            _context.Expressions.Add(expression);

            return new UpdateNotificationExpressionBuilder(DbmsType, _context.QuerySchema, expression, _context);
        }

        
        public IAddNotificationTemplateSyntax NotificationTemplateCreate(string @namespace, string name)
        {
            var expression = new AddNotificationTemplateExpression(DbmsType, _context.QuerySchema, @namespace, name);

            _context.Expressions.Add(expression);

            return new AddNotificationTemplateExpressionBuilder(expression, _context);
        }

        public IDeleteNotificationTemplateSyntax NotificationTemplateDelete(Guid id)
        {
            var expression = new DeleteNotificationTemplateExpression(DbmsType, _context.QuerySchema) { TemplateId = id };

            _context.Expressions.Add(expression);

            return new DeleteNotificationTemplateExpressionBuilder(expression, _context);
        }

        public IUpdateNotificationTemplateSyntax NotificationTemplateUpdate(Guid id)
        {
            var expression = new UpdateNotificationTemplateExpression(DbmsType, _context.QuerySchema) { Id = id };

            _context.Expressions.Add(expression);

            return new UpdateNotificationTemplateExpressionBuilder(expression, _context);
        }

        #endregion

        #region Settings

        public IAddSettingConfigurationSyntax SettingCreate(string name, string displayName)
        {
            var moduleLocator = _context.ServiceProvider.GetRequiredService<IModuleLocator>();
            var moduleName = moduleLocator.GetModuleName(_migration.GetType());

            var expression = new AddSettingConfigurationExpression(DbmsType, _context.QuerySchema, moduleName, name, displayName);

            _context.Expressions.Add(expression);
            
            return new AddSettingConfigurationExpressionBuilder(expression, _context);
        }

        public IUpdateSettingConfigurationSyntax SettingUpdate(string name) 
        {
            var moduleLocator = _context.ServiceProvider.GetRequiredService<IModuleLocator>();
            var moduleName = moduleLocator.GetModuleName(_migration.GetType());

            var expression = new UpdateSettingConfigurationExpression(DbmsType, _context.QuerySchema, moduleName, name);

            _context.Expressions.Add(expression);

            return new UpdateSettingConfigurationExpressionBuilder(expression, _context);
        }

        public IDeleteSettingConfigurationSyntax SettingDelete(string name)
        {
            var moduleLocator = _context.ServiceProvider.GetRequiredService<IModuleLocator>();
            var moduleName = moduleLocator.GetModuleName(_migration.GetType());

            var expression = new DeleteSettingConfigurationExpression(DbmsType, _context.QuerySchema, moduleName, name);

            _context.Expressions.Add(expression);

            return new DeleteSettingConfigurationExpressionBuilder(expression, _context);
        }

        #endregion

        #region modules

        public Guid ModuleEnsureExists(string name)
        {
            Guid? moduleId = null;

            var processor = _context.ServiceProvider.GetRequiredService<IMigrationProcessor>();
            var exp = new PerformDBOperationExpression()
            {
                Operation = (connection, transaction) =>
                {
                    var helper = new ModuleDbHelper(DbmsType, connection, transaction, _context.QuerySchema);
                    moduleId = helper.EnsureModuleExists(name);
                }
            };
            processor.Process(exp);

            return moduleId != null
                ? moduleId.Value
                : throw new Exception($"Failed to get/create module '{name}'");
        }

        #endregion

        #region Foreign keys

        public void MoveForeignKeys(string oldTable, string? oldSchema, string oldColumn, string newTable, string? newSchema, string newColumn)
        {
            var processor = _context.ServiceProvider.GetRequiredService<IMigrationProcessor>();
            var exp = new PerformDBOperationExpression()
            {
                Operation = (connection, transaction) =>
                {
                    var helper = new SchemaDbHelper(DbmsType, connection, transaction, _context.QuerySchema);
                    helper.MoveForeignKeys(oldTable, oldSchema, oldColumn, newTable, newSchema, newColumn);
                }
            };
            processor.Process(exp);
        }

        #endregion
    }
}
