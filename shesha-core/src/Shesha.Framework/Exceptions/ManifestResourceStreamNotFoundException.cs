using System;
using System.Reflection;

namespace Shesha.Exceptions
{
    /// <summary>
    /// Indicates that embedded resource not found in the specified assembly
    /// </summary>
    public class ManifestResourceStreamNotFoundException: Exception
    {
        public Assembly Assembly { get; private set; }
        public string RecourceName { get; private set; }
        public ManifestResourceStreamNotFoundException(Assembly assembly, string resourceName): base($"Embedded resource '{resourceName}' not found in assembly '{assembly.FullName}'")
        {
            Assembly = assembly;
            RecourceName = resourceName;
        }
    }
}
