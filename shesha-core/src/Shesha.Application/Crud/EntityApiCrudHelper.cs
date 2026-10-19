using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.AspNetCore.Mvc.Controllers;
using Shesha.Application.Services;
using Shesha.Attributes;
using Shesha.Domain.Enums;
using Shesha.DynamicEntities;
using Shesha.Reflection;
using Shesha.Services;
using Shesha.Utilities;
using System;
using System.Reflection;
using System.Threading.Tasks;

namespace Shesha
{
    /// <summary>
    /// Entity CRUD helper
    /// </summary>
    public static class EntityApiCrudHelper
    {
        public static bool IsRelatedToObsoleteEntity(ApiDescription apiDescription) 
        {
            if (apiDescription.ActionDescriptor is not ControllerActionDescriptor actionDescriptor)
                return false;

            if (!AppServiceHelper.IsDynamicAppService(actionDescriptor.ControllerTypeInfo))
                return false;

            var entityType = AppServiceHelper.GetEntityTypeFromDynamicAppService(actionDescriptor.ControllerTypeInfo);
            return entityType.HasAttribute<ObsoleteAttribute>(true);
        }

        /// <summary>
        /// Returns true if API is disabled via code and can't be enabled by configration
        /// </summary>
        /// <param name="apiDescription">API description</param>
        /// <returns></returns>
        public static bool IsApiTotallyDisabled(ApiDescription apiDescription)
        {
            if (apiDescription.ActionDescriptor is not ControllerActionDescriptor actionDescriptor)
                return false;

            if (!AppServiceHelper.IsDynamicAppService(actionDescriptor.ControllerTypeInfo))
                return false;

            var entityActionAttribute = actionDescriptor.MethodInfo.GetAttribute<EntityActionAttribute>(true);
            if (entityActionAttribute == null)
                return false;

            var crudAction = GetCrudAction(actionDescriptor.MethodInfo);
            if (crudAction == null)
                return false;

            var entityType = AppServiceHelper.GetEntityTypeFromDynamicAppService(actionDescriptor.ControllerTypeInfo);

            var config = EntityCrudHelper.GetHardcodedEntityCrudConfig(entityType);
            return !config.IsConfigurable && EntityCrudHelper.IsActionDisabled(config, crudAction.Value);
        }

        public static async Task<bool> IsApiDisabledByConfigAsync(ApiDescription apiDescription) 
        {
            if (apiDescription.ActionDescriptor is not ControllerActionDescriptor actionDescriptor)
                return false;

            if (!AppServiceHelper.IsDynamicAppService(actionDescriptor.ControllerTypeInfo))
                return false;

            var entityType = AppServiceHelper.GetEntityTypeFromDynamicAppService(actionDescriptor.ControllerTypeInfo);
            
            var entityConfigManager = StaticContext.IocManager.Resolve<IModelConfigurationManager>();
            var model = await entityConfigManager.GetCachedModelConfigurationOrNullAsync(null, entityType.Namespace, entityType.Name, true);
            return model == null || !model.GenerateAppService;
        }

        private static CrudAction? GetCrudAction(MethodInfo methodInfo)
        {
            var entityActionAttribute = methodInfo.GetAttribute<EntityActionAttribute>(true);
            if (entityActionAttribute == null)
                return null;

            switch (entityActionAttribute.Action)
            {
                case StandardEntityActions.Create:
                    return CrudAction.Create;
                case StandardEntityActions.Update:
                    return CrudAction.Update;
                case StandardEntityActions.Delete:
                    return CrudAction.Delete;
                case StandardEntityActions.List:
                case StandardEntityActions.Read:
                    return CrudAction.Read;
                default:
                    return null;
            }
        }

    }
}
