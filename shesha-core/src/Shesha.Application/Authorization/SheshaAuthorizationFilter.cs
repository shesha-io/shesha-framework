using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.AspNetCore.Mvc.Authorization;
using Abp.AspNetCore.Mvc.Extensions;
using Abp.AspNetCore.Mvc.Results;
using Abp.Authorization;
using Abp.Dependency;
using Abp.Events.Bus;
using Abp.Events.Bus.Exceptions;
using Abp.Web.Models;
using Castle.Core.Logging;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Shesha.Authorization
{
    // ToDo: fix AbpAuthorizationFilter (use correct ControllerType)
    public class SheshaAuthorizationFilter : IAsyncAuthorizationFilter, ITransientDependency
    {
        public ILogger Logger { get; set; }

        private readonly IErrorInfoBuilder _errorInfoBuilder;
        private readonly IEventBus _eventBus;
        private readonly IocManager _iocManager;

        public SheshaAuthorizationFilter(
            IErrorInfoBuilder errorInfoBuilder,
            IEventBus eventBus,
            IocManager iocManager)
        {
            _errorInfoBuilder = errorInfoBuilder;
            _eventBus = eventBus;
            Logger = NullLogger.Instance;
            _iocManager = iocManager;
        }

        public virtual async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            var endpoint = context?.HttpContext?.GetEndpoint();
            // Allow Anonymous skips all authorization
            if (endpoint?.Metadata.GetMetadata<IAllowAnonymous>() != null)
            {
                return;
            }

            if (!context.ActionDescriptor.IsControllerAction())
            {
                return;
            }

            //TODO: Avoid using try/catch, use conditional checking
            try
            {
                var authorizationHelpers = _iocManager.ResolveAll<ISheshaAuthorizationHelper>();
                foreach (var authorization in authorizationHelpers)
                {
                    await authorization.AuthorizeAsync(
                        context.ActionDescriptor.GetMethodInfo(),
                        context.ActionDescriptor.AsControllerActionDescriptor()?.ControllerTypeInfo.AsType()
                    );
                }
            }
            catch (AbpAuthorizationException ex)
            {
                Logger.Warn(ex.ToString(), ex);

                await _eventBus.TriggerAsync(this, new AbpHandledExceptionData(ex));

                if (ActionResultHelper.IsObjectResult(context.ActionDescriptor.GetMethodInfo().ReturnType))
                {
                    context.Result = new ObjectResult(new AjaxResponse(_errorInfoBuilder.BuildForException(ex), true))
                    {
                        StatusCode = context.HttpContext.User.Identity.IsAuthenticated
                            ? (int)System.Net.HttpStatusCode.Forbidden
                            : (int)System.Net.HttpStatusCode.Unauthorized
                    };
                }
                else
                {
                    context.Result = new ChallengeResult();
                }
            }
            catch (Exception ex)
            {
                Logger.Error(ex.ToString(), ex);

                await _eventBus.TriggerAsync(this, new AbpHandledExceptionData(ex));

                if (ActionResultHelper.IsObjectResult(context.ActionDescriptor.GetMethodInfo().ReturnType))
                {
                    context.Result = new ObjectResult(new AjaxResponse(_errorInfoBuilder.BuildForException(ex)))
                    {
                        StatusCode = (int)System.Net.HttpStatusCode.InternalServerError
                    };
                }
                else
                {
                    //TODO: How to return Error page?
                    context.Result = new StatusCodeResult((int)System.Net.HttpStatusCode.InternalServerError);
                }
            }
        }
    }
}