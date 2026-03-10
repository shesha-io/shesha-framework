using Shesha.Modules;
using System;

namespace Shesha.ConfigurationItems.Exceptions
{
    /// <summary>
    /// Indicates that top level module is not defined and application requires code changes
    /// </summary>
    public class TopLevelModuleIsNotDefined : Exception
    {
        public TopLevelModuleIsNotDefined() : base($"Top level module is not defined. Make sure that root module defined in the web project is inherited from '{nameof(SheshaModule)}'")
        {
        }
    }
}
