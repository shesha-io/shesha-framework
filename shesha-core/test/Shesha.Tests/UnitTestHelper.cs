using Abp.Dependency;
using Castle.MicroKernel.Registration;
using Microsoft.AspNetCore.Hosting;
using Moq;
using NSubstitute;
using System.IO;
using System.Reflection;

namespace Shesha.Tests
{
    public static class UnitTestHelper
    {
        /// <summary>
        /// Mock <see cref="IWebHostEnvironment"/>
        /// </summary>
        /// <param name="iocManager"></param>
        public static void MockWebHostEnvirtonment(this IIocManager iocManager)
        {
            var hostingEnvironment = new Mock<IWebHostEnvironment>();
            hostingEnvironment.Setup(x => x.ApplicationName).Returns("test");
            hostingEnvironment.Setup(x => x.EnvironmentName).Returns("test");

            var rootPath = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
            hostingEnvironment.Setup(x => x.ContentRootPath).Returns(rootPath);
            var hh = hostingEnvironment.As<IWebHostEnvironment>().Object;

            iocManager.IocContainer.Register(
                Component.For<IWebHostEnvironment>()
                    .Instance(hh)
                    .LifestyleSingleton()
            );
        }

        /// <summary>
        /// Register fake service
        /// </summary>
        /// <typeparam name="TService"></typeparam>
        /// <param name="iocManager"></param>
        public static void RegisterFakeService<TService>(this IIocManager iocManager) where TService : class
        {
            iocManager.IocContainer.Register(
                Component.For<TService>()
                    .UsingFactoryMethod(() => Substitute.For<TService>())
                    .LifestyleSingleton()
            );
        }
    }
}
