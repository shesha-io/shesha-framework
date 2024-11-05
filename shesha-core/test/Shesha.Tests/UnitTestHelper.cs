using Abp.Dependency;
using Castle.MicroKernel.Registration;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Moq;
using NSubstitute;
using Swashbuckle.AspNetCore.Swagger;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Collections.Generic;
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

        public static void MockApiExplorer(this IIocManager iocManager)
        {
            var actionDescriptorCollectionProviderMock = new Mock<IActionDescriptorCollectionProvider>();
            actionDescriptorCollectionProviderMock.Setup(m => m.ActionDescriptors).Returns(new ActionDescriptorCollection(new List<ActionDescriptor>(), 0));

            iocManager.IocContainer.Register(
                Component.For<IActionDescriptorCollectionProvider>()
                    .Instance(actionDescriptorCollectionProviderMock.Object)
                    .LifestyleSingleton()
            );

            var actionGroupDescriptorCollectionProviderMock = new Mock<IApiDescriptionGroupCollectionProvider>();
            actionGroupDescriptorCollectionProviderMock.Setup(m => m.ApiDescriptionGroups).Returns(new ApiDescriptionGroupCollection(new List<ApiDescriptionGroup>(), 1));
            iocManager.IocContainer.Register(
                Component.For<IApiDescriptionGroupCollectionProvider>()
                    .Instance(actionGroupDescriptorCollectionProviderMock.Object)
                    .LifestyleSingleton()
            );


            var swaggerProviderMock = new Mock<ISwaggerProvider>();
            iocManager.IocContainer.Register(
                Component.For<ISwaggerProvider>()
                    .Instance(swaggerProviderMock.Object)
                    .LifestyleSingleton()
            );

            var schemaGeneratorMock = new Mock<ISchemaGenerator>();
            iocManager.IocContainer.Register(
                Component.For<ISchemaGenerator>()
                    .Instance(schemaGeneratorMock.Object)
                    .LifestyleSingleton()
            );            
        }
    }
}
