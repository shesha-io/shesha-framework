using Shesha.Modules;

namespace Shesha.Tests.ModuleB
{
    public class SheshaTestsModuleB : SheshaModule
    {
        public const string ModuleName = "Shesha.Tests.ModuleB";

        public override SheshaModuleInfo ModuleInfo => new SheshaModuleInfo(ModuleName)
        {
            FriendlyName = "Shesha Tests Module B",
            Publisher = "Boxfusion",
            Alias = "shaTestModuleB"
        };
    }
}
