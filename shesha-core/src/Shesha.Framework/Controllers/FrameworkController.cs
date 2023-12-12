using Abp.Dependency;
using Abp.Web.Models;
using Castle.Core.Logging;
using Microsoft.AspNetCore.Mvc;
using Shesha.Bootstrappers;
using Shesha.Controllers.Dtos;
using Shesha.DynamicEntities;
using Shesha.Extensions;
using Shesha.Reflection;
using Shesha.Services;
using Shesha.Settings;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class FrameworkController: ControllerBase, ITransientDependency
    {
        public ILogger Logger { get; set; } = new NullLogger();
        public IIocManager IocManager { get; set; }

        [HttpPost]
        public async Task<string> BootstrapReferenceLists()
        {
            var bootstrapper = StaticContext.IocManager.Resolve<ReferenceListBootstrapper>();
            await bootstrapper.ProcessAsync();
            return "Bootstrapped successfully";
        }

        [HttpPost]
        public async Task<string> BootstrapSettings()
        {
            var bootstrapper = StaticContext.IocManager.Resolve<SettingsBootstrapper>();
            await bootstrapper.ProcessAsync();
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
                .Where(a => string.IsNullOrWhiteSpace(searchString) || a.FullName.Contains(searchString, StringComparison.InvariantCultureIgnoreCase))
                .OrderBy(a => a.FullName);

            var result = assemblies.Select(a => {
                string architecture = "unknown";
                if (a.Modules.Any()) {
                    a.Modules.First().GetPEKind(out var pekind, out var machine);
                    architecture = machine.ToString();
                }

                return new AssemblyInfoDto
                {
                    FullName = a.GetName().Name,
                    Location = a.Location,
                    Version = a.GetName().Version.ToString(),
                    Architecture = architecture
                };
            })
                .ToList();
            
            return result;
        }

        [HttpGet]
        [DontWrapResult]
        public long CurrentRamUsage()
        {
            var process = Process.GetCurrentProcess();
            process.Refresh();
            return process.WorkingSet64;
        }

        [HttpPost]
        [DontWrapResult]
        public string TestException(ExceptionInput input)
        {
            if (input.GenerateException)
                throw new Exception(input.Message);

            return input.Message;
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
        public async Task BootstrapEntityConfigsAsync()
        {
            var bootstrapper = IocManager.Resolve<EntityConfigsBootstrapper>();
            await bootstrapper.ProcessAsync();
        }

        public class ExceptionInput 
        { 
            public bool GenerateException { get; set; }
            public string Message { get; set; }
        }
    }
}