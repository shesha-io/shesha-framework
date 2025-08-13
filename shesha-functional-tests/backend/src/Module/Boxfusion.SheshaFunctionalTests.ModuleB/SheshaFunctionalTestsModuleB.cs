using Shesha.Modules;

namespace Boxfusion.SheshaFunctionalTests.ModuleB
{
    public class SheshaFunctionalTestsModuleB : SheshaModule
    {
        public override SheshaModuleInfo ModuleInfo => new SheshaModuleInfo("Boxfusion.SheshaFunctionalTests.ModuleB")
        {
            FriendlyName = "Shesha Functional Tests Module B",
            Publisher = "Boxfusion",
            Alias = "sftModuleB"
        };
    }
}
