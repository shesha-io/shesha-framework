using Abp.Dependency;
using Castle.MicroKernel.Registration;
using System;

namespace Shesha.Settings.Ioc
{
    /// <summary>
    /// Settings IoC extensions
    /// </summary>
    public static class IocManagerExtensions
    {
        /// <summary>
        /// Register settings accessot
        /// </summary>
        /// <typeparam name="TAccessor">Interface of the settings group. Must implement the <see cref="ISettingAccessors"/> interface</typeparam>
        /// <param name="iocManager">IoC Manager</param>
        /// <param name="initializer">Initializer of the setting instance. Is used to provide default values of the settings</param>
        public static void RegisterSettingAccessor<TAccessor>(this IIocManager iocManager, Action<TAccessor> initializer = null) where TAccessor: class, ISettingAccessors
        {
            if (!iocManager.IsRegistered<ISettingsAccessorFactory>())
                iocManager.IocContainer.Register(
                    Component.For<ISettingsAccessorFactory>().ImplementedBy<SettingsAccessorFactory>()
                );

            iocManager.IocContainer.Register(
                Component.For<TAccessor>()
                    .Forward<ISettingAccessors>()
                    .UsingFactoryMethod((kernel, context) => {
                        var factory = kernel.Resolve<ISettingsAccessorFactory>();

                        var instance = factory.BuildAccessor<TAccessor>();
                        
                        // call initializer to set default values
                        initializer?.Invoke(instance);

                        return instance;
                    })
                    .LifestyleSingleton()
            );
        }
    }
}
