using Shesha.Modules;

namespace Boxfusion.SheshaFunctionalTests.ModuleA
{
    public class SheshaFunctionalTestsModuleA : SheshaModule
    {
        public override SheshaModuleInfo ModuleInfo => new SheshaModuleInfo("Boxfusion.SheshaFunctionalTests.ModuleA")
        {
            FriendlyName = "Shesha Functional Tests Module A",
            Publisher = "Boxfusion",
            Alias = "sftModuleA"
        };
    }
}
