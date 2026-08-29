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
using System;
using System.Threading.Tasks;

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
            var endpoint = context.HttpContext?.GetEndpoint();
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
            // Resolution happens inside the try so that a failure to construct a helper (or anything in its
            // dependency graph) is handled the same way as a failure during AuthorizeAsync, rather than
            // escaping the filter unhandled.
            ISheshaAuthorizationHelper[]? authorizationHelpers = null;
            try
            {
                // ResolveAll registers every resolved helper (and its whole dependency graph: UserManager,
                // RoleManager, stores, repositories, unit-of-work managers, loggers) with Windsor's release
                // policy. It must be paired with Release, otherwise the graph leaks on every authorized request.
                authorizationHelpers = _iocManager.ResolveAll<ISheshaAuthorizationHelper>();

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
                    var identity = context.HttpContext?.User.Identity;
                    context.Result = new ObjectResult(new AjaxResponse(_errorInfoBuilder.BuildForException(ex), true))
                    {
                        StatusCode = identity != null && identity.IsAuthenticated
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
            finally
            {
                // Release the ResolveAll'd helpers and their dependency graph (fixes the per-request leak).
                // Null when ResolveAll itself threw, in which case there is nothing to release.
                if (authorizationHelpers != null)
                {
                    foreach (var authorization in authorizationHelpers)
                    {
                        _iocManager.Release(authorization);
                    }
                }
            }
        }
    }
}