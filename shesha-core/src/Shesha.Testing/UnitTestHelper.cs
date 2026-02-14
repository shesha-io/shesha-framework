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

namespace Shesha.Testing
{
    public static class UnitTestHelper
    {
        /// <summary>
        /// Mock <see cref="IWebHostEnvironment"/> using a concrete <see cref="TestWebHostEnvironment"/>.
        /// </summary>
        public static void MockWebHostEnvironment(this IIocManager iocManager)
        {
            if (!iocManager.IsRegistered<IWebHostEnvironment>())
            {
                iocManager.IocContainer.Register(
                    Component.For<IWebHostEnvironment>()
                        .ImplementedBy<TestWebHostEnvironment>()
                        .LifestyleSingleton()
                );
            }
        }

        /// <summary>
        /// Register fake service using NSubstitute.
        /// </summary>
        public static void RegisterFakeService<TService>(this IIocManager iocManager) where TService : class
        {
            iocManager.IocContainer.Register(
                Component.For<TService>()
                    .UsingFactoryMethod(() => Substitute.For<TService>())
                    .LifestyleSingleton()
            );
        }

        /// <summary>
        /// Mock ASP.NET Core API explorer and Swagger infrastructure to prevent errors during test module initialization.
        /// </summary>
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
