using Abp.AspNetCore.Configuration;
using Abp.AspNetCore.Mvc.ExceptionHandling;
using Abp.AspNetCore.Mvc.Results;
using Abp.Authorization;
using Abp.Dependency;
using Abp.Web.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Versioning;
using Microsoft.OpenApi;
using Shesha.Application.Services;
using Shesha.Authorization;
using Shesha.Domain.Enums;
using Shesha.Extensions;
using Shesha.Reflection;
using Shesha.Utilities;
using Swashbuckle.AspNetCore.SwaggerGen;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Reflection;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Shesha.Swagger
{
    public class SwaggerOperationFilter : IOperationAsyncFilter
    {
        private readonly IAbpAspNetCoreConfiguration _configuration;
        private readonly IIocManager _iocManager;

        public SwaggerOperationFilter(IAbpAspNetCoreConfiguration configuration, IIocManager iocManager)
        {
            _configuration = configuration;
            _iocManager = iocManager;
        }

        public Task ApplyAsync(OpenApiOperation operation, OperationFilterContext context, CancellationToken cancellationToken)
        {
            if (context.ApiDescription.ActionDescriptor is ControllerActionDescriptor descriptor)
            {
                if (descriptor.ControllerTypeInfo.ImplementsGenericInterface(typeof(IEntityAppService<,>)))
                {
                    // change operationId to avoid duplicated operations for Entities with the same name but different Assemblies
                    var entityType = descriptor.ControllerTypeInfo.GetGenericInterfaces(typeof(IEntityAppService<,>)).FirstOrDefault()?.GetGenericArguments()[0];
                    operation.OperationId = entityType != null ? entityType.Assembly.GetName().Name + ":" + operation.OperationId : operation.OperationId;
                }
            }

            // Add "properties" parameter to CRUD Create and Update actions to support Gql requests
            // This is working only with RequestToGqlMiddleware
            AddPropertiesToCrudCreateUpdate(operation, context);

            // Decorate wrapped responses
            DecorateWrappedResponses(operation, context);

            // Decorate operation parameters
            DecorateOperaionParameters(operation, context);

            // Decorate operation with security requirements
            AddSecurityRequirements(operation, context);

            return Task.CompletedTask;
        }

        private T? GetOperationAttribute<T>(OpenApiOperation operation, OperationFilterContext context) where T : Attribute
        {
            if (context.MethodInfo.HasAttribute<T>())
                return context.MethodInfo.GetAttribute<T>();
            if (context.MethodInfo.DeclaringType != null && context.MethodInfo.DeclaringType.HasAttribute<T>())
                return context.MethodInfo.DeclaringType.GetAttribute<T>();
            return null;
        }

        private void AddSecurityRequirements(OpenApiOperation operation, OperationFilterContext context)
        {
            var shashaAuthorizeAttribute = GetOperationAttribute<SheshaAuthorizeAttribute>(operation, context);

            var sb = new StringBuilder();
            void addRow(string label, string value) => sb.AppendLine($"<div><label>{label}:</label> {value}</div>");

            var allowAnonymousAttribute = GetOperationAttribute<AllowAnonymousAttribute>(operation, context);
            bool? isAnonymous = allowAnonymousAttribute != null ? true : null;
            var permissions = new List<string>();
            if (allowAnonymousAttribute != null)
            {
                addRow("AllowAnonymousAttribute", "yes");
            }
            else
            {
                if (shashaAuthorizeAttribute != null)
                {
                    addRow("SheshaAuthorize", "yes");
                    addRow("IsConfigurable", shashaAuthorizeAttribute.IsConfigurable ? "yes" : "no");
                    addRow("Access", shashaAuthorizeAttribute.Access.ToString());
                    if (shashaAuthorizeAttribute.Permissions != null && shashaAuthorizeAttribute.Permissions.Any())
                    {
                        addRow("Permissions", shashaAuthorizeAttribute.Permissions.Delimited(","));
                        permissions.AddRange(shashaAuthorizeAttribute.Permissions);
                    }

                    if (isAnonymous == null)
                        isAnonymous = shashaAuthorizeAttribute.Access == RefListPermissionedAccess.AllowAnonymous;
                }

                var abpAuthorizeAttribute = GetOperationAttribute<AbpAuthorizeAttribute>(operation, context);
                if (abpAuthorizeAttribute != null)
                {
                    addRow("AbpAuthorize", "yes");
                    addRow("Permissions", abpAuthorizeAttribute.Permissions.Delimited(","));
                    if (abpAuthorizeAttribute.Permissions != null)
                        permissions.AddRange(abpAuthorizeAttribute.Permissions);
                    addRow("RequireAllPermissions", abpAuthorizeAttribute.RequireAllPermissions ? "yes" : "no");
                    isAnonymous = false;
                }
                var authorizeAttribute = GetOperationAttribute<AuthorizeAttribute>(operation, context);
                if (authorizeAttribute != null)
                {
                    addRow("AuthorizeAttribute", "yes");
                    addRow("Policy", authorizeAttribute.Policy ?? "");
                    addRow("Roles", authorizeAttribute.Roles ?? "");
                    isAnonymous = false;
                }
            }
            var securityDescription = sb.ToString();

            if (!string.IsNullOrWhiteSpace(securityDescription))
                operation.Description += securityDescription;

            if (isAnonymous == false)
            {
                var scheme = new OpenApiSecuritySchemeReference("bearerAuth", context.Document);

                operation.Security = new List<OpenApiSecurityRequirement>
                {
                    new OpenApiSecurityRequirement
                    {
                        [scheme] = permissions.Distinct().ToList() // scopes; empty for Bearer/API Key
                    }
                };
            }
        }

        private void AddPropertiesToCrudCreateUpdate(OpenApiOperation operation, OperationFilterContext context)
        {
            if (string.IsNullOrWhiteSpace(context.ApiDescription.RelativePath))
                return;

            if (context.ApiDescription.RelativePath.ToLower().EndsWith("crud/create")
                || context.ApiDescription.RelativePath.ToLower().EndsWith("crud/update"))
            {
                if (operation.Parameters == null)
                    operation.Parameters = [];

                // Add as the first parameter
                operation.Parameters.Insert(0, new OpenApiParameter()
                {
                    Name = "properties",
                    In = ParameterLocation.Query,
                    Description = "List of properties to fetch in GraphQL-like syntax. Supports nested properties",
                    Schema = new OpenApiSchema() { Type = JsonSchemaType.String },
                });
            }
        }

        private void DecorateWrappedResponses(OpenApiOperation operation, OperationFilterContext context)
        {
            var wrapResultAttribute =
                GetSingleAttributeOfMemberOrDeclaringTypeOrDefault(
                    context.MethodInfo,
                    _configuration.DefaultWrapResultAttribute
                );

            if (wrapResultAttribute == null) // shouldn't be null, but we'll check
                return;

            var unwrappedReturnType = context.MethodInfo.ReturnType == typeof(Task)
                ? typeof(AjaxResponseBase)
                : context.MethodInfo.ReturnType.IsSubtypeOfGeneric(typeof(Task<>))
                    ? context.MethodInfo.ReturnType.GenericTypeArguments.First()
                    : context.MethodInfo.ReturnType;

            if (operation.Responses == null)
                operation.Responses = [];

            var okResponse = ((int)HttpStatusCode.OK).ToString();
            if (wrapResultAttribute.WrapOnSuccess &&  // auto-wrapping of success response is enable
                                                      //!operation.Responses.ContainsKey(okResponse) && // OK response is missing
                unwrappedReturnType != typeof(AjaxResponseBase) && // not added manually as AjaxResponseBase
                unwrappedReturnType != typeof(void)
                )
            {
                var wrappedResponseType = typeof(AjaxResponse<>).MakeGenericType(unwrappedReturnType);

                if (operation.Responses.TryGetValue(okResponse, out var oldOkResponse))
                    operation.Responses.Remove(okResponse);

                var schema = context.SchemaGenerator.GenerateSchema(wrappedResponseType, context.SchemaRepository);
                //schema.Reference.Id = unwrappedReturnType.Name; // use not wrapped class name
                //schema.Reference.Id = schema.Reference.Id.RemovePostfix(nameof(AjaxResponse));
                operation.Responses.Add(okResponse, new OpenApiResponse()
                {
                    Description = string.IsNullOrWhiteSpace(oldOkResponse?.Description)
                        ? $"Wrapped with {nameof(AjaxResponse)}<> by {nameof(AbpResultFilter)}"
                        : oldOkResponse.Description,
                    Content = new Dictionary<string, OpenApiMediaType>
                    {
                        ["application/json"] = new OpenApiMediaType
                        {
                            Schema = schema
                        }
                    }
                });
            }

            var badResponse = ((int)HttpStatusCode.BadRequest).ToString();
            if (wrapResultAttribute.WrapOnError && // auto-wrapping of error response is enable
                !operation.Responses.ContainsKey(badResponse) && // BadRequest response is missing
                unwrappedReturnType != typeof(AjaxResponseBase) && // not added manually as AjaxResponseBase
                unwrappedReturnType != typeof(void)
                )
            {
                var responseType = typeof(AjaxResponseBase);

                if (operation.Responses.ContainsKey(badResponse))
                    operation.Responses.Remove(badResponse);

                var schema = context.SchemaGenerator.GenerateSchema(responseType, context.SchemaRepository);
                operation.Responses.Add(badResponse, new OpenApiResponse()
                {
                    Description = $"Generated by {nameof(AbpExceptionFilter)}",
                    Content = new Dictionary<string, OpenApiMediaType>
                    {
                        ["application/json"] = new OpenApiMediaType
                        {
                            Schema = schema
                        }
                    }
                });
            }
        }

        /// <summary>
        /// Copied from ABP
        /// Tries to gets an of attribute defined for a class member and it's declaring type including inherited attributes.
        /// Returns default value if it's not declared at all.
        /// </summary>
        /// <typeparam name="TAttribute">Type of the attribute</typeparam>
        /// <param name="memberInfo">MemberInfo</param>
        /// <param name="defaultValue">Default value (null as default)</param>
        /// <param name="inherit">Inherit attribute from base classes</param>
        public static TAttribute GetSingleAttributeOfMemberOrDeclaringTypeOrDefault<TAttribute>(MemberInfo memberInfo, TAttribute defaultValue, bool inherit = true)
            where TAttribute : class
        {
            return memberInfo.GetCustomAttributes(true).OfType<TAttribute>().FirstOrDefault()
                   ?? memberInfo.ReflectedType?.GetTypeInfo().GetCustomAttributes(true).OfType<TAttribute>().FirstOrDefault()
                   ?? defaultValue;
        }

        private void DecorateOperaionParameters(OpenApiOperation operation, OperationFilterContext context)
        {
            var apiDescription = context.ApiDescription;
            var apiVersion = apiDescription.GetApiVersion();
            var model = apiDescription.ActionDescriptor.GetApiVersionModel(ApiVersionMapping.Explicit | ApiVersionMapping.Implicit);

            operation.Deprecated = model.DeprecatedApiVersions.Contains(apiVersion);

            if (operation.Parameters == null) return;

            foreach (var parameter in operation.Parameters)
            {
                var description = apiDescription.ParameterDescriptions.FirstOrDefault(p => p.Name.Equals(parameter.Name, StringComparison.InvariantCultureIgnoreCase));

                if (description != null)
                {
                    parameter.Description ??= description?.ModelMetadata?.Description;

                    parameter.SetRequired(description != null && description.IsRequired);
                }
            }
        }
    }
}
