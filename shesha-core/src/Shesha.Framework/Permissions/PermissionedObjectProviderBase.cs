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
using System.Xml;
using Module = Shesha.Domain.ConfigurationItems.Module;

namespace Shesha.Permissions
{
    public class PermissionedObjectProviderBase
    {
        protected readonly IAssemblyFinder _assembleFinder;
        protected readonly IModuleManager _moduleManager;

        public PermissionedObjectProviderBase(IAssemblyFinder assembleFinder, IModuleManager moduleManager)
        {
            _assembleFinder = assembleFinder;
            _moduleManager = moduleManager;
        }

        protected string GetName(Type service, string defaultName = null)
        {
            var name = service.GetCustomAttribute<DisplayNameAttribute>()?.DisplayName;
            return string.IsNullOrEmpty(name) ? defaultName ?? service.Name : name;
        }

        protected string GetDescription(Type service)
        {
            var description = service.GetCustomAttribute<DescriptionAttribute>()?.Description;
            if (string.IsNullOrEmpty(description))
            {
                XmlElement documentation = DocsByReflection.XMLFromType(service);
                description = documentation?["summary"]?.InnerText.Trim();
                if (string.IsNullOrEmpty(description))
                {
                    description = service.Name.ToFriendlyName();
                }
            }

            return description;
        }

        protected string GetName(MethodInfo method, string defaultName = null)
        {
            var name = method.GetCustomAttribute<DisplayNameAttribute>()?.DisplayName;
            return string.IsNullOrEmpty(name) ? defaultName ?? method.Name : name;
        }

        protected string GetDescription(MethodInfo method)
        {
            var description = method.GetCustomAttribute<DescriptionAttribute>()?.Description;
            if (string.IsNullOrEmpty(description))
            {
                XmlElement documentation = DocsByReflection.XMLFromMember(method);
                description = documentation?["summary"]?.InnerText.Trim();
                if (string.IsNullOrEmpty(description))
                {
                    description = method.Name.ToFriendlyName().Replace(" Async", "");
                }
            }

            return description;
        }

        private Dictionary<Assembly, Module> _modules = new Dictionary<Assembly, Module>();

        protected async Task<Module> GetModuleOfAssemblyAsync(Assembly assembly)
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

        protected virtual string GetMd5(PermissionedObjectDto dto)
        {
            return $"{dto.Hardcoded}|{dto.Access?.ToString() ?? "null"}|{string.Join(',', dto.Permissions)}|{dto.ModuleId}|{dto.Parent}|{dto.Name}|{string.Join("|", dto.AdditionalParameters.Select(x => x.Key + "@" + x.Value))}"
                .ToMd5Fingerprint();
        }
    }
}