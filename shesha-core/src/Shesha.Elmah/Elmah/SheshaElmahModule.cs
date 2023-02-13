using System.Reflection;
using Abp.Modules;

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
