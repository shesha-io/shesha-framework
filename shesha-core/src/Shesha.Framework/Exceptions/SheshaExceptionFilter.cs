using Abp.AspNetCore.Configuration;
using Abp.AspNetCore.Mvc.ExceptionHandling;
using Abp.Authorization;
using Abp.Web.Configuration;
using Abp.Web.Models;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Globalization;
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
            return context.Exception switch
            {
                ContentNotModifiedException => (int)HttpStatusCode.NotModified,
                TooManyRequestsException => (int)HttpStatusCode.TooManyRequests,
                VerificationFailedException => (int)HttpStatusCode.BadRequest,
                BadRequestException => (int)HttpStatusCode.BadRequest,
                _ => base.GetStatusCode(context, wrapOnError),
            };
        }

        protected override void HandleAndWrapException(ExceptionContext context, WrapResultAttribute wrapResultAttribute)
        {
            // the base class clears context.Exception once it has wrapped the error
            var exception = context.Exception;

            base.HandleAndWrapException(context, wrapResultAttribute);

            // like the framework rate limiter's 429 responses, tell the client when it may try again
            if (exception is TooManyRequestsException { RetryAfterSeconds: > 0 } tooManyRequests)
                context.HttpContext.Response.Headers["Retry-After"] = tooManyRequests.RetryAfterSeconds.Value.ToString(CultureInfo.InvariantCulture);

            // prevent `Writing to the response body is invalid for responses with status code 304.` exception
            if (context.HttpContext.Response.StatusCode == (int)HttpStatusCode.NotModified)
                context.Result = null;

            if (context.Exception is AbpAuthorizationException
                && context.HttpContext.Response.StatusCode != (int)HttpStatusCode.Unauthorized
                && context.HttpContext.Response.StatusCode != (int)HttpStatusCode.Forbidden
                )
            {
                context.HttpContext.Response.StatusCode = context.HttpContext.User.Identity?.IsAuthenticated ?? false
                    ? (int)HttpStatusCode.Forbidden
                    : (int)HttpStatusCode.Unauthorized;
                context.ExceptionHandled = true;
            }
        }
    }
}
