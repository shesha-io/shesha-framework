using Abp.Application.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shesha.Swagger
{
    /// <summary>
    /// 
    /// </summary>
    public class AbpAppServiceApiVersionSpecification : IApiControllerSpecification
    {
        public bool IsSatisfiedBy(ControllerModel controller)
        {
            var typeInfo = controller.ControllerType;
            var type = controller.ControllerType.AsType();
            if (!typeof(IApplicationService).IsAssignableFrom(type) || !typeInfo.IsPublic)
            {
                return false;
            }
            if (!(controller.Attributes is List<object> attributes))
            {
                return false;
            }
            if (typeInfo.IsDefined(typeof(ApiVersionAttribute), false))
            {
                attributes.Add(new ApiVersionAttribute("1")); //Set default version
            }
            return true;
        }
    }
}
