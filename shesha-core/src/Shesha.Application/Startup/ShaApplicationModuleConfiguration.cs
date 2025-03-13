using Abp.Dependency;
using System;
using System.Collections.Generic;
using System.Reflection;

namespace Shesha.Startup
{
    /// <summary>
    /// Configuration of the <see cref="SheshaApplicationModule"/>
    /// </summary>
    public class ShaApplicationModuleConfiguration : IShaApplicationModuleConfiguration
    {
        public List<DynamicAppServiceRegistration> DynamicApplicationServiceRegistrations { get; private set; }
        public IIocManager IocManager { get; set; } = default!;

        public ShaApplicationModuleConfiguration()
        {
            DynamicApplicationServiceRegistrations = new List<DynamicAppServiceRegistration>();
        }

        [Obsolete("Do not use, all AppServices for entities should be configured through Configuration Manager")]
        public void CreateAppServicesForEntities(Assembly assembly, string moduleName)
        {
        }

        [Obsolete("Do not use, all AppServices for entities should be configured through Configuration Manager")]
        public void RegisterDynamicApplicationServices(Assembly assembly, string moduleName)
        {
            DynamicApplicationServiceRegistrations.Add(new DynamicAppServiceRegistration
            {
                Assembly = assembly,
                ModuleName = moduleName,
            });
        }
    }
}
