using Abp.Authorization;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Localization;
using Shesha.Domain;
using Shesha.Reflection;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Shesha.Authorization
{
    public class SheshaAuthorizationProvider : AuthorizationProvider
    {
        private readonly IRepository<Module, Guid> _moduleRepository;
        private readonly IUnitOfWorkManager _unitOfWorkManager;

        public SheshaAuthorizationProvider(IUnitOfWorkManager unitOfWorkManager, IRepository<Module, Guid> moduleRepository)
        {
            _unitOfWorkManager = unitOfWorkManager;
            _moduleRepository = moduleRepository;
        }

        public override void SetPermissions(IPermissionDefinitionContext context)
        {
            var moduleName = this.GetType().GetConfigurableModuleName();
            if (string.IsNullOrWhiteSpace(moduleName))
                throw new Exception($"'{nameof(SheshaAuthorizationProvider)}' must be a part of Shesha module.");

            var moduleId = GetModuleId(moduleName);

            void CreatePermission(string name, ILocalizableString? label = null, ILocalizableString? description = null)
            {
                NewPermission(context, moduleId, name, label, description);
            }

            CreatePermission(PermissionNames.Application_Configure, L("Application Configure"));
            CreatePermission(PermissionNames.Application_Administer, L("Application Administer"));
            CreatePermission(PermissionNames.Application_Settings, L("Application Settings"));
            CreatePermission(PermissionNames.Application_Maintenance, L("Application Maintenance"));

            CreatePermission(PermissionNames.Hangfire_Dashboard, L("Hangfire Dashboard"));

            CreatePermission(PermissionNames.User_View, L("User: View"));
            CreatePermission(PermissionNames.User_Manage, L("User: Manage"));
            CreatePermission(PermissionNames.User_ResetPassword, L("User: ResetPassword"));

            CreatePermission(PermissionNames.Role_Manage, L("Role: Manage"));

            CreatePermission(PermissionNames.Account_View, L("Account: View"));
            CreatePermission(PermissionNames.Account_Create, L("Account: Create"));
            CreatePermission(PermissionNames.Account_Update, L("Account: Update"));
            CreatePermission(PermissionNames.Account_Delete, L("Account: Delete"));

            CreatePermission(PermissionNames.Person_View, L("Person: View"));
            CreatePermission(PermissionNames.Person_Create, L("Person: Create"));
            CreatePermission(PermissionNames.Person_Update, L("Person: Update"));
            CreatePermission(PermissionNames.Person_Delete, L("Person: Delete"));

            CreatePermission(PermissionNames.Organisation_View, L("Organisation: View"));
            CreatePermission(PermissionNames.Organisation_Create, L("Organisation: Create"));
            CreatePermission(PermissionNames.Organisation_Update, L("Organisation: Update"));
            CreatePermission(PermissionNames.Organisation_Delete, L("Organisation: Delete"));
        }

        // TODO: move to IModuleManager
        private Guid GetModuleId(string moduleName)
        {
            if (string.IsNullOrWhiteSpace(moduleName))
                throw new ArgumentNullException(nameof(moduleName));

            using (var uow = _unitOfWorkManager.Begin())
            {
                var module = _moduleRepository.GetAll().FirstOrDefault(m => m.Name == moduleName);
                if (module == null)
                {
                    module = new Module
                    {
                        Name = moduleName,
                        IsEnabled = true,
                    };
                    _moduleRepository.Insert(module);
                }

                uow.Complete();

                return module.Id;
            }
        }

        private static ILocalizableString L(string name)
        {
            return new LocalizableString(name, SheshaConsts.LocalizationSourceName);
        }

        private void NewPermission(IPermissionDefinitionContext context, Guid moduleId, string name, ILocalizableString? label = null, ILocalizableString? description = null)
        {
            var newPermission = context.CreatePermission(
                name,
                label,
                description,
                properties: new Dictionary<string, object>()
                {
                    { "IsDbPermission", false },
                    { "ModuleId", moduleId },
                }
            );
        }
    }
}
