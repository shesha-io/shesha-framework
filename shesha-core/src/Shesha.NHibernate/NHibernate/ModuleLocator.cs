using Shesha.FluentMigrator;
using Shesha.Reflection;
using System;

namespace Shesha.NHibernate
{
    /// <summary>
    /// Module locator
    /// </summary>
    public class ModuleLocator : IModuleLocator
    {
        /// inheritedDoc
        public string GetModuleName(Type migrationType)
        {
            return migrationType.GetConfigurableModuleName();
        }
    }
}
