using Abp.Dependency;
using Abp.Domain.Uow;
using Abp.Modules;
using Abp.Reflection;
using Shesha.ConfigurationItems;
using Shesha.Reflection;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Module = Shesha.Domain.Module;

namespace Shesha.Permissions
{
    public class PermissionedObjectProviderBase : ITransientDependency
    {
        protected readonly IAssemblyFinder _assembleFinder;
        protected readonly IModuleManager _moduleManager;
        protected readonly IUnitOfWorkManager _unitOfWorkManager;

        public PermissionedObjectProviderBase(
            IAssemblyFinder assembleFinder,
            IModuleManager moduleManager,
            IUnitOfWorkManager unitOfWorkManager
            )
        {
            _assembleFinder = assembleFinder;
            _moduleManager = moduleManager;
            _unitOfWorkManager = unitOfWorkManager;
        }

        protected string GetMd5(PermissionedObjectDto dto)
        {
            return $"{dto.Hardcoded}|{dto.Access?.ToString() ?? "null"}|{dto.PermissionsDelimited}|{dto.ModuleId}|{dto.Parent}|{dto.Name}|{string.Join("|", dto.AdditionalParameters.Select(x => x.Key + "@" + x.Value))}"
                .ToMd5Fingerprint();
        }

        private Dictionary<Assembly, Module?> _modules = new Dictionary<Assembly, Module?>();

        protected async Task<Module?> GetModuleOfAssemblyAsync(Assembly assembly)
        {
            if (_modules.TryGetValue(assembly, out var module))
                return module;

            module = await _moduleManager.GetOrCreateModuleAsync(assembly);
            _modules.Add(assembly, module);
            return module;
        }

        protected Type? GetModuleOfType(Type type)
        {
            return type.Assembly.GetTypes().FirstOrDefault(t => t.IsPublic && !t.IsAbstract && typeof(AbpModule).IsAssignableFrom(t));
        }

        protected string GetName(Type service, string? defaultName = null)
        {
            var name = service.GetCustomAttribute<DisplayNameAttribute>()?.DisplayName;
            return string.IsNullOrEmpty(name) ? defaultName ?? service.Name : name;
        }

        protected string GetDescription(Type service)
        {
            var description = service.GetCustomAttribute<DescriptionAttribute>()?.Description;
            if (string.IsNullOrEmpty(description))
            {
                var documentation = DocsByReflection.XMLFromType(service);
                description = documentation?["summary"]?.InnerText.Trim();
                if (string.IsNullOrEmpty(description))
                {
                    description = service.Name.ToFriendlyName();
                }
            }

            return description;
        }

        protected string GetName(MethodInfo method, string? defaultName = null)
        {
            var name = method.GetCustomAttribute<DisplayNameAttribute>()?.DisplayName;
            return string.IsNullOrEmpty(name) ? defaultName ?? method.Name : name;
        }

        protected string GetDescription(MethodInfo method)
        {
            var description = method.GetCustomAttribute<DescriptionAttribute>()?.Description;
            if (string.IsNullOrEmpty(description))
            {
                var documentation = DocsByReflection.XMLFromMember(method);
                description = documentation?["summary"]?.InnerText.Trim();
                if (string.IsNullOrEmpty(description))
                {
                    description = method.Name.ToFriendlyName().Replace(" Async", "");
                }
            }

            return description;
        }
    }
}