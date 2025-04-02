using System;
using System.Collections.Generic;
using System.Reflection;

namespace Shesha.Startup
{
    /// <summary>
    /// Configuration of the <see cref="SheshaApplicationModule"/>
    /// </summary>
    public interface IShaApplicationModuleConfiguration
    {
        List<DynamicAppServiceRegistration> DynamicApplicationServiceRegistrations { get; }

        [Obsolete("Do not use, all AppServices for entities should be configured through Configuration Manager")]
        void CreateAppServicesForEntities(
            Assembly assembly,
            string moduleName
        );
    }
}
