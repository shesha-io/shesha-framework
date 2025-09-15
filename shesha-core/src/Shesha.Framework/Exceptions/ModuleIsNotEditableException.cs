using System;

namespace Shesha.Exceptions
{
    /// <summary>
    /// Indicates that specified module is not editable and any configuration operations on this module are prohibited
    /// </summary>
    public class ModuleIsNotEditableException : Exception
    {
        public string ModuleName { get; private set; }

        public ModuleIsNotEditableException(string moduleName): base($"Module `{moduleName}` is not editable")
        {
            ModuleName = moduleName;
        }
    }
}
