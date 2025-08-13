using System;

namespace Shesha.ConfigurationItems.Exceptions
{
    /// <summary>
    /// Indicates that requested module not found in the DB
    /// </summary>
    public class ModuleNotFoundException : Exception
    {
        public string ModuleName { get; set; }
        public ModuleNotFoundException(string moduleName) : base($"Module '{moduleName}' not found")
        {
            ModuleName = moduleName;
        }
    }
}
