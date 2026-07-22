using Shesha.Modules;
using Shesha;
using Boxfusion.SheshaFunctionalTests.Common;

namespace Boxfusion.SheshaFunctionalTest.DisabledModule
{

    /// <summary>
    /// The module is intended for testing in FunctionalTest only.
    /// </summary>

    public class SheshaFunctionalTestsDisabledModule : SheshaModule
    {
        public override SheshaModuleInfo ModuleInfo => new SheshaModuleInfo("Boxfusion.SheshaFunctionalTests.DisabledModule")
        {
            FriendlyName = "Shesha Functional Tests Disabled Module",
            Publisher = "Boxfusion",
            Alias = "functionalTestsDisabledModule",
            Hierarchy = [typeof(SheshaFunctionalTestsCommonModule), typeof(SheshaFrameworkModule)],
        };
    }
}
