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
    }
}
