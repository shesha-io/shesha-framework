using Shesha.Modules;

namespace Shesha.Tests.ModuleA
{
    public class SheshaTestsModuleA : SheshaModule
    {
        public const string ModuleName = "Shesha.Tests.ModuleA";
        public override SheshaModuleInfo ModuleInfo => new SheshaModuleInfo(ModuleName)
        {
            FriendlyName = "Shesha Tests Module A",
            Publisher = "Boxfusion",
            Alias = "shaTestModuleA"
        };
    }
}