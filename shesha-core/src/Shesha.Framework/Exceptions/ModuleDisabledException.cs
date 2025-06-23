using System;

namespace Shesha.Exceptions
{
    /// <summary>
    /// Indicates that specified module is disabled and all operations on this module are prohibited
    /// </summary>
    public class ModuleDisabledException: Exception
    {
        public string ModuleName { get; private set; }

        public ModuleDisabledException(string moduleName): base($"Module `{moduleName}` is disabled")
        {
            ModuleName = moduleName;
        }
    }
}
