using Abp.Application.Services.Dto;
using Abp.Domain.Uow;
using Castle.Core.Logging;
using GraphQL;
using GraphQL.MicrosoftDI;
using GraphQL.SystemTextJson;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Shesha.GraphQL.Middleware;
using Shesha.GraphQL.Provider.GraphTypes;
using Shesha.GraphQL.Provider.Queries;
using Shesha.GraphQL.UnitOfWork;
using System.Threading.Tasks;

namespace Shesha.GraphQL
{
    /// <summary>
    /// ServiceCollection extensions
    /// </summary>
    public static class ServiceCollectionExtensions
    {
        /// <summary>
        /// Integrates Shesha GraphQL to AspNet Core.
        /// </summary>
        public static void AddSheshaGraphQL(this IServiceCollection services)
        {
            // Add GraphQL services and configure options
            services.AddGraphQL(builder => builder
                .ConfigureExecutionOptions(options =>
                {
                    options.EnableMetrics = true;// Environment.IsDevelopment();
                    var logger = options.RequestServices.GetService<ILogger>();

                    var unitOfWorkManager = options.RequestServices.GetRequiredService<IUnitOfWorkManager>();

                    options.Listeners.Add(new GraphQLUnitOfWorkListener(unitOfWorkManager));

                    options.UnhandledExceptionDelegate = ctx =>
                    {
                        logger?.Error($"{ctx.OriginalException.Message} occurred", ctx.OriginalException);
                        return Task.CompletedTask;
                    };
                })
                // Add required services for GraphQL request/response de/serialization
                .AddSystemTextJson() // For .NET Core 3+
            );

            services.AddSingleton<GraphQLMiddleware>();
            services.AddSingleton(new GraphQLSettings
            {
                BuildUserContext = ctx => new GraphQLUserContext
                {
                    User = ctx.User
                },
                EnableMetrics = true
            });
            services.TryAddTransient(typeof(EntityQuery<,>));
            services.TryAddTransient(typeof(GraphQLGenericType<>));
            services.TryAddTransient(typeof(PagedResultDtoType<>));
            services.TryAddTransient(typeof(PagedAndSortedResultRequestDto));
            services.TryAddTransient(typeof(GraphQLInputGenericType<>));
        }
    }
}
