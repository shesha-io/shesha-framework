using Shesha.ConfigurationItems.Exceptions;
using Shesha.Web.FormsDesigner.Domain;

namespace Shesha.Web.FormsDesigner.Exceptions
{
    /// <summary>
    /// Configurable Component not found exception
    /// </summary>
    public class ConfigurableComponentNotFoundException : ConfigurationItemNotFoundException
    {
        public ConfigurableComponentNotFoundException(string frontEndApplication, string module, string name): base(ConfigurableComponent.ItemTypeName, module, name, frontEndApplication) 
        {
            FrontEndApplication = frontEndApplication;
            Name = name;
            Module = module;
            Code = 404;
        }
    }
}