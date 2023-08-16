using Abp.Dependency;
using Shesha.FluentMigrator;
using Shesha.Reflection;
using System;

namespace Shesha.NHibernate
{
    /// <summary>
    /// Module locator
    /// </summary>
    public class ModuleLocator : IModuleLocator, ISingletonDependency
    {
        /// inheritedDoc
        public string GetModuleName(Type migrationType)
        {
            return migrationType.GetConfigurableModuleName();
        }
    }
}
