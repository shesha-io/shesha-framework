using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using Abp.Application.Services;
using Abp.AspNetCore.Mvc.Extensions;
using Abp.Modules;
using Abp.Reflection;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Shesha.Extensions;
using Shesha.Utilities;

namespace Shesha.Permissions
{
    public class ApiPermissionedObjectProvider : PermissionedObjectProviderBase, IPermissionedObjectProvider
    {

        private readonly IApiDescriptionGroupCollectionProvider _apiDescriptionsProvider;

        public ApiPermissionedObjectProvider(IAssemblyFinder assembleFinder, IApiDescriptionGroupCollectionProvider apiDescriptionsProvider) : base(assembleFinder)
        {
            _apiDescriptionsProvider = apiDescriptionsProvider;
        }

        private Dictionary<string, string> CrudMethods = new Dictionary<string, string>
        {
            { "Get", "Get" },
            { "GetAll", "Get" },
            { "Create", "Create" },
            { "Update", "Update" },
            { "Delete", "Delete" },
            { "Remove", "Delete" }
        };

        public List<string> GetObjectTypes()
        {
            return new List<string>() { PermissionedObjectsSheshaTypes.WebApi, PermissionedObjectsSheshaTypes.WebCrudApi };
        }

        private bool IsCrud(Type type)
        {
            if (type.Name.Contains("Crud"))
                return true;
            if (type.BaseType != null)
                return IsCrud(type.BaseType);
            return false;
        }

        public string GetObjectType(Type type)
        {
            var shaServiceType = typeof(ApplicationService);
            var controllerType = typeof(ControllerBase);

            return !(type.IsPublic && !type.IsAbstract
                                 && (shaServiceType.IsAssignableFrom(type) || controllerType.IsAssignableFrom(type)))
                   ? null // if not controller
                   : IsCrud(type)
                        ? PermissionedObjectsSheshaTypes.WebCrudApi
                        : PermissionedObjectsSheshaTypes.WebApi;
        }

        private string GetMethodType(string parentType)
        {
            return parentType == PermissionedObjectsSheshaTypes.WebApi
                ? PermissionedObjectsSheshaTypes.WebApiAction
                : parentType == PermissionedObjectsSheshaTypes.WebCrudApi
                    ? PermissionedObjectsSheshaTypes.WebCrudApiAction
                    : null;
        }

        private Type GetModuleOfType(Type type)
        {
            return type.Assembly.GetTypes().FirstOrDefault(t => t.IsPublic && !t.IsAbstract && typeof(AbpModule).IsAssignableFrom(t));
        }


        public List<PermissionedObjectDto> GetAll(string objectType = null)
        {
            if (objectType != null && !GetObjectTypes().Contains(objectType)) return new List<PermissionedObjectDto>();

            var api = _apiDescriptionsProvider.ApiDescriptionGroups.Items.SelectMany(g => g.Items.Select(a =>
            {
                var descriptor = a.ActionDescriptor.AsControllerActionDescriptor();
                var module = GetModuleOfType(descriptor.ControllerTypeInfo.AsType());
                return new ApiDescriptor()
                {
                    Description = a,
                    Module = module,
                    Service = descriptor.ControllerTypeInfo.AsType(),
                    HttpMethod = a.HttpMethod,
                    Endpoint = a.RelativePath,
                    Action = descriptor.MethodInfo
                };
            })).ToList();

            var allApiPermissions = new List<PermissionedObjectDto>();

            var modules = api.Select(x => x.Module).Distinct().ToList();
            foreach (var module in modules)
            {
                var services = api.Where(a => a.Module == module).Select(x => x.Service).Distinct().ToList();

                foreach (var service in services)
                {
                    var isDynamic = service.GetInterfaces().Any(x =>
                        x.IsGenericType &&
                        x.GetGenericTypeDefinition() == typeof(IDynamicCrudAppService<,,>));

                    var objType = isDynamic
                        ? PermissionedObjectsSheshaTypes.WebCrudApi
                        : GetObjectType(service);

                    if (objectType != null && objType != objectType) continue;

                    string name = null;
                    string fullName = null;
                    string description = null;
                    Type eModule = null;

                    Type entityType = null;
                    if (objType == PermissionedObjectsSheshaTypes.WebCrudApi)
                    {
                        entityType = service.FindBaseGenericType(typeof(AbpAsyncCrudAppService<,,,,,,,>))?.GetGenericArguments()[0];
                        if (isDynamic && entityType != null)
                        {
                            name = $"{entityType.Name}DynamicCrudAppService";
                            fullName = $"{entityType.Namespace}.Dynamic{entityType.Name}CrudAppService";
                            description = $"CRUD API service for {entityType.Name} entity";
                            eModule = GetModuleOfType(entityType);
                        }
                    }


                    var parent = new PermissionedObjectDto()
                    {
                        Object = fullName ?? service.FullName,
                        Module = (eModule ?? module)?.FullName ?? "",
                        Name = name ?? GetName(service),
                        Type = objType,
                        Description = description ?? GetDescription(service),
                        Dependency = entityType != null
                    ? entityType.FullName
                    : null
                    };
                    allApiPermissions.Add(parent);

                    var methods = api.Where(a => a.Module == module && a.Service == service).ToList();

                    foreach (var methodInfo in methods)
                    {
                        var methodName = methodInfo.Action.Name.RemovePostfix("Async");

                        var child = new PermissionedObjectDto()
                        {
                            Object = parent.Object + "@" + methodInfo.Action.Name,
                            Module = parent.Module,
                            Name = GetName(methodInfo.Action),
                            Type = GetMethodType(objType),
                            Parent = parent.Object,
                            Description = GetDescription(methodInfo.Action),
                            Dependency = entityType != null && CrudMethods.ContainsKey(methodName)
                                ? entityType.FullName + "@" + CrudMethods.GetValueOrDefault(methodName)
                                : null,
                        };

                        child.AdditionalParameters.Add("HttpMethod", methodInfo.HttpMethod);
                        child.AdditionalParameters.Add("Endpoint", methodInfo.Endpoint);
                        //parent.Child.Add(child);
                        allApiPermissions.Add(child);
                    }
                }
            }

            return allApiPermissions;
        }

        private class ApiDescriptor
        {
            public ApiDescription Description { get; set; }
            public Type Module { get; set; }
            public Type Service { get; set; }
            public MethodInfo Action { get; set; }
            public string HttpMethod { get; set; }
            public string Endpoint { get; set; }

        }
    }
}