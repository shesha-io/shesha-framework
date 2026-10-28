using Abp.Modules;
using System.Reflection;

namespace Shesha.Elmah
{
    /// <summary>
    /// Shesha Elmah module
    /// </summary>
    public class SheshaElmahModule : AbpModule
    {
        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(Assembly.GetExecutingAssembly());
        }
    }
}
