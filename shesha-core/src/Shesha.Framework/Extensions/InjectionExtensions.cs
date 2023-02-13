using Abp.Dependency;
using Castle.MicroKernel.Registration;

namespace Shesha.Extensions
{
    public static class InjectionExtensions
    {
        public static void Register<TType1, TType2, TImpl>(this IIocManager manager, DependencyLifeStyle lifeStyle = DependencyLifeStyle.Singleton)
            where TType1 : class
            where TType2 : class
            where TImpl : class, TType1, TType2
        {
            manager.IocContainer.Register(
                ApplyLifestyle(
                    Component.For<TType1>()
                        .Forward<TType2>()
                        .Forward<TImpl>()
                        .ImplementedBy<TImpl>(),
                    lifeStyle)
                );
        }

        public static void Register<TType1, TType2, TType3, TImpl>(this IIocManager manager, DependencyLifeStyle lifeStyle = DependencyLifeStyle.Singleton)
            where TType1 : class
            where TType2 : class
            where TType3 : class
            where TImpl : class, TType1, TType2, TType3
        {
            manager.IocContainer.Register(
                ApplyLifestyle(
                    Component.For<TType1>()
                        .Forward<TType2>()
                        .Forward<TType3>()
                        .Forward<TImpl>()
                        .ImplementedBy<TImpl>(),
                    lifeStyle)
            );
        }

        private static ComponentRegistration<T> ApplyLifestyle<T>(ComponentRegistration<T> registration, DependencyLifeStyle lifeStyle)
            where T : class
        {
            switch (lifeStyle)
            {
                case DependencyLifeStyle.Transient:
                    return registration.LifestyleTransient();
                case DependencyLifeStyle.Singleton:
                    return registration.LifestyleSingleton();
                default:
                    return registration;
            }
        }
    }
}