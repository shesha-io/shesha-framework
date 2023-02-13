using Microsoft.AspNetCore.Mvc.ApplicationModels;
using System;

namespace Shesha.DynamicEntities
{
    /// <summary>
    /// Entity action route provider
    /// </summary>
    public interface IEntityActionRouteProvider
    {
        string GetDynamicAppServiceRoute(Type entityType, ActionModel action);
    }
}
