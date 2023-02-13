using System.Reflection;

namespace Shesha.Startup
{
    /// <summary>
    /// Dynamic Application Service registration
    /// </summary>
    public class DynamicAppServiceRegistration
    {
        public Assembly Assembly { get; set; }
        public string ModuleName { get; set; }
    }
}
