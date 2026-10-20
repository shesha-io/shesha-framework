using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using Shesha.Domain.Interfaces;
using Shesha.Reflection;
using System;
using System.Linq;
using System.Reflection;

namespace Shesha.Utilities
{
    public static class EntityCrudHelper
    {
        public static IEntityCrudConfig GetHardcodedEntityCrudConfig(Type entityType)
        {
            var config = entityType.GetAttribute<EntityAttribute>()?.GetCrudConfig() ?? EntityCrudConfig.Default;
            var customActionsAttributes = entityType.GetCustomAttributes<EntityAuthorizeAttribute>();
            if (customActionsAttributes.Any())
            {
                foreach (var attr in customActionsAttributes)
                {
                    config = EntityCrudConfigWithCustomActions.ApplyActionRules(config, attr.Action, attr);
                }
            }
            // disallow update and delete actions for immutable entities
            var imMutable = entityType.HasAttribute<ImMutableAttribute>(true);
            if (imMutable)
                config.MakeImmutable();
            return config;
        }

        public static bool IsActionDisabled(IEntityCrudConfig config, CrudAction crudAction)
        {
            return (config.CrudActions & (CrudActions)crudAction) == 0;
        }

        public static bool IsCrudActionDisabledByCode(Type entityType, CrudAction crudAction)
        {
            var config = GetHardcodedEntityCrudConfig(entityType);

            var disabled = IsActionDisabled(config, crudAction);
            return disabled;
        }

        public static bool IsCrudActionsConfigurable(Type entityType) 
        {
            var config = GetHardcodedEntityCrudConfig(entityType);
            return config.IsConfigurable;
        }

        public static ICrudActionConfig GetCodebasedCrudActionConfig(Type entityType, CrudAction crudAction)
        {
            var config = GetHardcodedEntityCrudConfig(entityType);

            var customConfig = config is IHasCustomActionConfig withCustom && withCustom.CustomActionConfig.TryGetValue(crudAction, out var customActionConfig)
                ? customActionConfig
                : null;

            var result = new CrudActionConfig
            {
                CrudActionsAccess = customConfig != null
                    ? customConfig.CrudActionsAccess
                    : config.CrudActionsAccess,
                CrudActionsPermissions = customConfig != null
                    ? customConfig.CrudActionsPermissions
                    : config.CrudActionsPermissions
            };
            return result;
        }

        /// <summary>
        /// Returns true if APIs for all actions are disabled
        /// </summary>
        public static bool IsApisTotallyDisabledInCode(Type entityType)
        {
            var config = GetHardcodedEntityCrudConfig(entityType);
            return !config.IsConfigurable && config.CrudActions == CrudActions.None;
        }
    }
}
