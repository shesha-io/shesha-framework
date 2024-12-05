using Abp.Application.Services;
using Abp.AspNetCore.Mvc.Authorization;
using Abp.AspNetCore.Mvc.Extensions;
using Abp.Authorization;
using Abp.Collections.Extensions;
using Abp.Modules;
using Abp.Reflection;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Shesha.Authorization;
using Shesha.ConfigurationItems;
using Shesha.Extensions;
using Shesha.Reflection;
using Shesha.Startup;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Module = Shesha.Domain.ConfigurationItems.Module;

namespace Shesha.Permissions
{
    public class ApiPermissionedObjectProvider : PermissionedObjectProviderBase, IPermissionedObjectProvider
    {

        private readonly IApiDescriptionGroupCollectionProvider _apiDescriptionsProvider;
        private readonly IModuleManager _moduleManager;
        private readonly IApplicationStartupSession _startupSession;

        public ApiPermissionedObjectProvider(
            IAssemblyFinder assembleFinder,
            IApiDescriptionGroupCollectionProvider apiDescriptionsProvider,
            IModuleManager moduleManager,
            IApplicationStartupSession startupSession
            ) : base(assembleFinder)
        {
            _apiDescriptionsProvider = apiDescriptionsProvider;
            _moduleManager = moduleManager;
            _startupSession = startupSession;
        }

        public List<string> GetObjectTypes()
        {
            return new List<string>() { ShaPermissionedObjectsTypes.WebApi };
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
                        ? ShaPermissionedObjectsTypes.WebCrudApi
                        : ShaPermissionedObjectsTypes.WebApi;
        }

        private string GetMethodType(string parentType)
        {
            return parentType == ShaPermissionedObjectsTypes.WebApi
                ? ShaPermissionedObjectsTypes.WebApiAction
                : parentType == ShaPermissionedObjectsTypes.WebCrudApi
                    ? ShaPermissionedObjectsTypes.WebCrudApiAction
                    : null;
        }

        private Type GetModuleOfType(Type type)
        {
            return type.Assembly.GetTypes().FirstOrDefault(t => t.IsPublic && !t.IsAbstract && typeof(AbpModule).IsAssignableFrom(t));
        }

        private Dictionary<Assembly, Module> _modules = new Dictionary<Assembly, Module>();

        private async Task<Module> GetModuleOfAssemblyAsync(Assembly assembly)
        {
            Module module = null;
            if (_modules.TryGetValue(assembly, out module))
            {
                return module;
            }
            module = await _moduleManager.GetOrCreateModuleAsync(assembly);
            _modules.Add(assembly, module);
            return module;
        }

        private string GetMd5(PermissionedObjectDto dto)
        {
            return $"{dto.Hardcoded}|{dto.Access?.ToString() ?? "null"}|{string.Join(',', dto.Permissions)}|{dto.ModuleId}|{dto.Parent}|{dto.Name}|{string.Join("|", dto.AdditionalParameters.Select(x => x.Key + "@" + x.Value))}"
                .ToMd5Fingerprint();
        }

        public async Task<List<PermissionedObjectDto>> GetAllAsync(string objectType = null, bool skipUnchangedAssembly = false)
        {
            if (objectType != null && !GetObjectTypes().Contains(objectType)) return new List<PermissionedObjectDto>();

            var modules = (await _apiDescriptionsProvider.ApiDescriptionGroups.Items.SelectManyAsync(async g => await g.Items.SelectAsync(async a =>
            {
                var descriptor = a.ActionDescriptor.AsControllerActionDescriptor();
                var service = descriptor.ControllerTypeInfo.AsType();
                var module = GetModuleOfType(service);
                var name = service.Name;
                var isDynamic = service.GetInterfaces().Any(x => x.IsGenericType && x.GetGenericTypeDefinition() == typeof(IDynamicCrudAppService<,,>));

                if (isDynamic || skipUnchangedAssembly && _startupSession.AssemblyStaysUnchanged(module.Assembly))
                    return null;

                return new ApiDescriptor()
                {
                    Description = a,
                    Module = await GetModuleOfAssemblyAsync(module.Assembly),
                    Service = service,
                    HttpMethod = a.HttpMethod,
                    Endpoint = a.RelativePath,
                    Action = descriptor.MethodInfo,
                    Assembly = module.Assembly,
                };
            })))
            .Where(x => x != null)
            .GroupBy(x => x.Module);

            var allApiPermissions =
                new List<PermissionedObjectDto>();

            foreach (var module in modules)
            {
                var services = module.Select(x => x.Service).Distinct().ToList();

                foreach (var service in services)
                {
                    if (objectType != null && objectType != ShaPermissionedObjectsTypes.WebApi) continue;

                    var hardcoded = false;
                    var access = Domain.Enums.RefListPermissionedAccess.Inherited;
                    var permissions = new List<string>();
                    var shaAttr = service.GetCustomAttribute<SheshaAuthorizeAttribute>(true);
                    if (shaAttr != null)
                    {
                        access = shaAttr.Access;
                        if (shaAttr.Access == Domain.Enums.RefListPermissionedAccess.RequiresPermissions)
                        {
                            access = shaAttr.Permissions.Any()
                                ? Domain.Enums.RefListPermissionedAccess.RequiresPermissions
                                : Domain.Enums.RefListPermissionedAccess.AnyAuthenticated;
                            permissions = shaAttr.Permissions.ToList();
                        }
                    }
                    var abpAttr = service.GetCustomAttribute<AbpAuthorizeAttribute>(true);
                    if (abpAttr != null)
                    {
                        access = abpAttr.Permissions.Any()
                            ? Domain.Enums.RefListPermissionedAccess.RequiresPermissions
                            : Domain.Enums.RefListPermissionedAccess.AnyAuthenticated;
                        permissions = abpAttr.Permissions.ToList();
                        hardcoded = true;
                    }
                    var abpMvcAttr = service.GetCustomAttribute<AbpMvcAuthorizeAttribute>(true);
                    if (abpMvcAttr != null)
                    {
                        access = abpMvcAttr.Permissions.Any()
                            ? Domain.Enums.RefListPermissionedAccess.RequiresPermissions
                            : Domain.Enums.RefListPermissionedAccess.AnyAuthenticated;
                        permissions = abpMvcAttr.Permissions.ToList();
                        hardcoded = true;
                    }
                    if (service.HasAttribute<AllowAnonymousAttribute>(true))
                    {
                        access = Domain.Enums.RefListPermissionedAccess.AllowAnonymous;
                        hardcoded = true;
                    }

                    var serviceName = service.Name;
                    serviceName = serviceName.EndsWith("AppService") ? serviceName.Replace("AppService", "") : serviceName;
                    serviceName = serviceName.EndsWith("Controller") ? serviceName.Replace("Controller", "") : serviceName;

                    var parent = new PermissionedObjectDto()
                    {
                        Object = service.FullName,
                        ModuleId = module.Key?.Id,
                        Module = module.Key?.Name,
                        Name = GetName(service, serviceName),
                        Type = ShaPermissionedObjectsTypes.WebApi,
                        Description = GetDescription(service),
                        Access = access,
                        Permissions = permissions,
                        Hardcoded = hardcoded,
                    };
                    parent.Md5 = GetMd5(parent);
                    allApiPermissions.Add(parent);

                    var methods = module.Where(a => a.Service == service).ToList();

                    foreach (var methodInfo in methods)
                    {
                        var methodName = methodInfo.Action.Name.RemovePostfix("Async");
                        var methodHardcoded = hardcoded;
                        access = Domain.Enums.RefListPermissionedAccess.Inherited;
                        permissions = new List<string>();
                        shaAttr = methodInfo.Action.GetCustomAttribute<SheshaAuthorizeAttribute>(true);
                        if (shaAttr != null)
                        {
                            access = shaAttr.Access;
                            if (shaAttr.Access == Domain.Enums.RefListPermissionedAccess.RequiresPermissions)
                            {
                                access = shaAttr.Permissions.Any()
                                    ? Domain.Enums.RefListPermissionedAccess.RequiresPermissions
                                    : Domain.Enums.RefListPermissionedAccess.AnyAuthenticated;
                                permissions = shaAttr.Permissions.ToList();
                            }
                        }
                        abpAttr = methodInfo.Action.GetCustomAttribute<AbpAuthorizeAttribute>(true);
                        if (abpAttr != null)
                        {
                            access = abpAttr.Permissions.Any()
                                ? Domain.Enums.RefListPermissionedAccess.RequiresPermissions
                                : Domain.Enums.RefListPermissionedAccess.AnyAuthenticated;
                            permissions = abpAttr.Permissions.ToList();
                            methodHardcoded = true;
                        }
                        abpMvcAttr = methodInfo.Action.GetCustomAttribute<AbpMvcAuthorizeAttribute>(true);
                        if (abpMvcAttr != null)
                        {
                            access = abpMvcAttr.Permissions.Any()
                                ? Domain.Enums.RefListPermissionedAccess.RequiresPermissions
                                : Domain.Enums.RefListPermissionedAccess.AnyAuthenticated;
                            permissions = abpMvcAttr.Permissions.ToList();
                            methodHardcoded = true;
                        }
                        if (methodInfo.Action.HasAttribute<AllowAnonymousAttribute>(true))
                        {
                            access = Domain.Enums.RefListPermissionedAccess.AllowAnonymous;
                            methodHardcoded = true;
                        }

                        var child = new PermissionedObjectDto()
                        {
                            Object = parent.Object + "@" + methodName,
                            Module = parent.Module,
                            ModuleId = parent.ModuleId,
                            Name = GetName(methodInfo.Action, methodName),
                            Type = ShaPermissionedObjectsTypes.WebApiAction,
                            Parent = parent.Object,
                            Description = GetDescription(methodInfo.Action),
                            Access = access,
                            Permissions = permissions,
                            Hardcoded = methodHardcoded,
                        };

                        child.AdditionalParameters.Add("HttpMethod", methodInfo.HttpMethod);
                        child.AdditionalParameters.Add("Endpoint", methodInfo.Endpoint);

                        //parent.Child.Add(child);
                        child.Md5 = GetMd5(child);
                        allApiPermissions.Add(child);
                    }
                }
            }

            return allApiPermissions;
        }

        private class ApiDescriptor
        {
            public ApiDescription Description { get; set; }
            public Module Module { get; set; }
            public Type Service { get; set; }
            public MethodInfo Action { get; set; }
            public string HttpMethod { get; set; }
            public string Endpoint { get; set; }
            public Assembly Assembly { get; set; }
        }
    }
}