using Abp.Dependency;
using Castle.MicroKernel.Registration;
using Castle.MicroKernel.Resolvers;
using Shesha.Configuration;
using System;

namespace Shesha.Settings.Ioc
{
    public static class IocManagerExtensions
    {
        public static void RegisterSettingAccessor<TAccessor>(this IIocManager iocManager) where TAccessor: class, ISettingAccessors
        {
            if (!iocManager.IsRegistered<ISettingsAccessorFactory>())
                iocManager.IocContainer.Register(
                    Component.For<ISettingsAccessorFactory>().ImplementedBy<SettingsAccessorFactory>()
                );

            iocManager.IocContainer.Register(
                Component.For<TAccessor>()
                    .UsingFactoryMethod((kernel, context) => {
                        var factory = kernel.Resolve<ISettingsAccessorFactory>();

                        return factory.BuildAccessor<TAccessor>();
                    })
                    .LifestyleSingleton()
            );
        }
    }
}
