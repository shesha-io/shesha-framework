using Abp.Authorization.Roles;
using Abp.Authorization.Users;
using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Reflection;
using Abp.Web.Models;
using Castle.Core.Logging;
using Microsoft.AspNetCore.Mvc;
using NHibernate;
using Shesha.Bootstrappers;
using Shesha.Controllers.Dtos;
using Shesha.Domain.Attributes;
using Shesha.DynamicEntities;
using Shesha.Extensions;
using Shesha.Migrations;
using Shesha.Reflection;
using Shesha.Services;
using Shesha.Settings;
using Shesha.Utilities;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Reflection;
using System.Reflection.PortableExecutable;
using System.Runtime.InteropServices;
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
        [Consumes("multipart/form-data")]
        [DontWrapResult]
        public IList ExecuteHql([FromForm] ExecuteHqlInput input)
        {
            var sessionFactory = StaticContext.IocManager.Resolve<ISessionFactory>();
            var session = sessionFactory.GetCurrentSession();
            var list = session.CreateQuery(input.Query).List();
            return list;
        }

        /// <summary>
        /// NOTE: to be removed
        /// </summary>
        [HttpGet]
        [DontWrapResult]
        public string TestEntities()
        {
            try
            {
                var typeFinder = StaticContext.IocManager.Resolve<ITypeFinder>();
                var sessionFactory = StaticContext.IocManager.Resolve<ISessionFactory>();
                var migrationGenerator = StaticContext.IocManager.Resolve<IMigrationGenerator>();

                var types = typeFinder.FindAll().Where(t => t.IsEntityType() 
                    && t != typeof(AggregateRoot)
                    && t != typeof(UserPermissionSetting)
                    && t != typeof(RolePermissionSetting)
                    ).ToList();

                var errors = new Dictionary<Type, Exception>();

                var session = sessionFactory.GetCurrentSession();

                foreach (var type in types)
                {
                    try
                    {
                        var hql = $"from {type.FullName}";
                        var list = session.CreateQuery(hql).SetMaxResults(1).List();
                    }
                    catch (Exception e)
                    {
                        errors.Add(type, e);
                    }
                }

                var typesToMap = errors.Select(e => e.Key).Where(t => !t.Namespace.StartsWith("Abp") && !t.HasAttribute<ImMutableAttribute>()).ToList();

                var migration = migrationGenerator.GenerateMigrations(typesToMap);

                var grupped = migrationGenerator.GroupByPrefixes(typesToMap);
                var grouppedMigrations = grupped.Select(g => new { Prefix = g.Key, Migration = migrationGenerator.GenerateMigrations(g.Value) })
                    .ToList();

                return migration;
            }
            catch (Exception)
            {
                throw;
            }
        }

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
    }
}