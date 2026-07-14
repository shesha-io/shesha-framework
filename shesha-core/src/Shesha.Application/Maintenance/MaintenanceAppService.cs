using Abp.AspNetCore.Mvc.Authorization;
using Abp.Web.Models;
using Microsoft.AspNetCore.Mvc;
using Shesha.Authorization;
using Shesha.Bootstrappers;
using Shesha.Controllers.Dtos;
using Shesha.DynamicEntities;
using Shesha.Elmah;
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

namespace Shesha.Maintenance
{
    [AbpMvcAuthorize(ShaPermissionNames.Pages_Maintenance)]
    public class MaintenanceAppService: SheshaAppServiceBase
    {
        [HttpPost]
        public async Task<string> BootstrapReferenceListsAsync()
        {
            var bootstrapper = StaticContext.IocManager.Resolve<ReferenceListBootstrapper>();
            await bootstrapper.ProcessAsync();
            return "Bootstrapped successfully";
        }

        [HttpPost]
        public async Task<string> BootstrapSettingsAsync()
        {
            var bootstrapper = StaticContext.IocManager.Resolve<SettingsBootstrapper>();
            await bootstrapper.ProcessAsync();
            return "Bootstrapped successfully";
        }

        [HttpPost]
        [DontWrapResult]
        public async Task BootstrapEntityConfigsAsync()
        {
            var bootstrapper = IocManager.Resolve<EntityConfigsBootstrapper>();
            await bootstrapper.ProcessAsync();
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
                .Where(a => string.IsNullOrWhiteSpace(searchString) || a.FullName.Contains(searchString, StringComparison.InvariantCultureIgnoreCase))
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
                    Version = a.GetName().Version.ToString(),
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

        public string EnableElmahFetching() { 
            SheshaElmahSettings.IsFetchingDisabled = false;
            return "Enabled";
        }

        public bool IsElmahFetchingDisabled() => SheshaElmahSettings.IsFetchingDisabled;

        #endregion
    }
}
