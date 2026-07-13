using Abp.AspNetCore.Mvc.Authorization;
using Abp.Domain.Uow;
using Abp.Reflection;
using Abp.Web.Models;
using Microsoft.AspNetCore.Mvc;
using Shesha.Authorization;
using Shesha.Bootstrappers;
using Shesha.ConfigurationItems;
using Shesha.Controllers.Dtos;
using Shesha.DynamicEntities;
using Shesha.Elmah;
using Shesha.Extensions;
using Shesha.Modules;
using Shesha.Reflection;
using Shesha.Services;
using Shesha.Settings;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Controllers
{
    [AbpMvcAuthorize(ShaPermissionNames.Pages_Maintenance)]
    public class MaintenanceAppService : SheshaAppServiceBase
    {
        [HttpPost]
        [UnitOfWork(IsDisabled = true)]
        public async Task<string> BootstrapModulesAsync(bool force)
        {
            var bootstrapper = StaticContext.IocManager.Resolve<ConfigurableModuleBootstrapper>();
            await bootstrapper.ProcessAsync(force);
            return "Bootstrapped successfully";
        }

        [HttpPost]
        public async Task<string> BootstrapReferenceListsAsync(bool force)
        {
            var bootstrapper = StaticContext.IocManager.Resolve<ReferenceListBootstrapper>();
            await bootstrapper.ProcessAsync(force);
            return "Bootstrapped successfully";
        }

        [HttpPost]
        public async Task<string> BootstrapSettingsAsync(bool force)
        {
            var bootstrapper = StaticContext.IocManager.Resolve<SettingsBootstrapper>();
            await bootstrapper.ProcessAsync(force);
            return "Bootstrapped successfully";
        }


        [HttpGet]
        [DontWrapResult]
        public List<AssemblyInfoDto> Assemblies(string searchString)
        {
            var assemblies = AppDomain.CurrentDomain.GetAssemblies().Where(a =>
            {
                try
                {
                    return !a.IsDynamic && a.GetTypes().Any();
                }
                catch
                {
                    // GetTypes can throw exception, skip assembly
                    return false;
                }
            })
                .Distinct<Assembly>(new AssemblyFullNameComparer())
                .Where(a => string.IsNullOrWhiteSpace(searchString) || !string.IsNullOrWhiteSpace(a.FullName) && a.FullName.Contains(searchString, StringComparison.InvariantCultureIgnoreCase))
                .OrderBy(a => a.FullName);

            var result = assemblies.Select(a => {
                string architecture = "unknown";
                if (a.Modules.Any())
                {
                    a.Modules.First().GetPEKind(out var pekind, out var machine);
                    architecture = machine.ToString();
                }
                var descriptionAttribute = a
                    .GetCustomAttributes(typeof(AssemblyDescriptionAttribute), false)
                    .OfType<AssemblyDescriptionAttribute>()
                    .FirstOrDefault();

                return new AssemblyInfoDto
                {
                    FullName = a.GetName().Name,
                    Location = a.Location,
                    Version = a.GetName()?.Version?.ToString() ?? "unknown",
                    Architecture = architecture,
                    Description = descriptionAttribute?.Description,
                };
            })
                .ToList();

            return result;
        }

        [HttpGet]
        [DontWrapResult]
        public FileContentResult DynamicAssemblies()
        {
            var loadedAssemblies = AppDomain.CurrentDomain.GetAssemblies();

            var assemblies = loadedAssemblies.Where(a => a.IsDynamic).OrderBy(a => a.FullName).ToList();

            var assembliesText = assemblies.Select(a => $"{a.FullName};{a.IsDynamic}").Delimited("\r\n");
            var bytes = Encoding.UTF8.GetBytes(assembliesText);

            return new FileContentResult(bytes, "text/csv");
        }

        [HttpPost]
        [DontWrapResult]
        public Task BootstrapEntityConfigsAsync(bool force)
        {
            var bootstrapper = IocManager.Resolve<EntityConfigsBootstrapper>();
            return bootstrapper.ProcessAsync(force);
        }

        public class ExceptionInput
        {
            public bool GenerateException { get; set; }
            public string? Message { get; set; }
        }

        [HttpGet]
        [DontWrapResult]
        public List<ModuleHierarchyInfo> ModulesHierarchy()
        {
            var typeFinder = IocManager.Resolve<ITypeFinder>();
            var moduleTypes = typeFinder.FindModuleTypes().ToList();

            var modules = moduleTypes.Select(t => {
                var instance = IocManager.Resolve(t).ForceCastAs<SheshaModule>();
                var moduleInfo = instance.ModuleInfo;

                var baseModules = moduleInfo.Hierarchy.Select(t => IocManager.Resolve(t).ForceCastAs<SheshaModule>()).ToList();

                return new ModuleHierarchyInfo
                {
                    Name = moduleInfo.Name,
                    BaseModules = baseModules.Select(m => m.ModuleInfo.Name).ToList()
                };
            }).ToList();

            return modules;
        }

        public class ModuleHierarchyInfo
        {
            public string Name { get; set; }
            public List<string> BaseModules { get; set; }
        }

        #region Elmah

        public string DisableElmahLogging()
        {
            SheshaElmahSettings.IsLoggingDisabled = true;
            return "Disabled";
        }

        public string EnableElmahLogging()
        {
            SheshaElmahSettings.IsLoggingDisabled = false;
            return "Enabled";
        }

        public bool IsElmahLoggingDisabled() => SheshaElmahSettings.IsLoggingDisabled;

        public string DisableElmahFetching()
        {
            SheshaElmahSettings.IsFetchingDisabled = true;
            return "Disabled";
        }

        public string EnableElmahFetching()
        {
            SheshaElmahSettings.IsFetchingDisabled = false;
            return "Enabled";
        }

        public bool IsElmahFetchingDisabled() => SheshaElmahSettings.IsFetchingDisabled;

        #endregion
    }
}