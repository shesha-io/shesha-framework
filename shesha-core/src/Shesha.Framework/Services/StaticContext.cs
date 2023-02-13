using Abp.Dependency;

namespace Shesha.Services
{
    /// <summary>
    /// Static context, is used as a temporary solution for unit tests
    /// </summary>
    public static class StaticContext
    {
        private static IIocManager _iocManager;

        /// <summary>
        /// Ioc manager
        /// </summary>
        public static IIocManager IocManager => _iocManager ?? Abp.Dependency.IocManager.Instance;

        /// <summary>
        /// Set IocManager, is used in unit tests only
        /// </summary>
        /// <param name="iocManager"></param>
        public static void SetIocManager(IIocManager iocManager)
        {
            _iocManager = iocManager;
        }
    }
}
