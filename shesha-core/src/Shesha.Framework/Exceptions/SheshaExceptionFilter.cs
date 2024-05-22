using Abp.AspNetCore.Configuration;
using Abp.AspNetCore.Mvc.ExceptionHandling;
using Abp.Web.Configuration;
using Abp.Web.Models;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Net;

namespace Shesha.Exceptions
{
    /// <summary>
    /// Shesha exception filter
    /// </summary>
    public class SheshaExceptionFilter : AbpExceptionFilter
    {
        public SheshaExceptionFilter(IErrorInfoBuilder errorInfoBuilder, IAbpAspNetCoreConfiguration configuration, IAbpWebCommonModuleConfiguration abpWebCommonModuleConfiguration) : base(errorInfoBuilder, configuration, abpWebCommonModuleConfiguration)
        {
        }

        protected override int GetStatusCode(ExceptionContext context, bool wrapOnError)
        {
            return context.Exception is ContentNotModifiedException
                ? (int)HttpStatusCode.NotModified
                : base.GetStatusCode(context, wrapOnError);
        }

        protected override void HandleAndWrapException(ExceptionContext context, WrapResultAttribute wrapResultAttribute)
        {
            base.HandleAndWrapException(context, wrapResultAttribute);

            // prevent `Writing to the response body is invalid for responses with status code 304.` exception
            if (context.HttpContext.Response.StatusCode == (int)HttpStatusCode.NotModified)
                context.Result = null;
        }
    }
}
