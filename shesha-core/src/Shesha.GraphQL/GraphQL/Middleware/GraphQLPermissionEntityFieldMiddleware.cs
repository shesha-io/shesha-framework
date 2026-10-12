using Abp.Dependency;
using GraphQL;
using GraphQL.Instrumentation;
using Microsoft.Extensions.DependencyInjection;
using Shesha.Extensions;
using Shesha.Permissions.Entity;
using System.Threading.Tasks;

namespace Shesha.GraphQL.Middleware
{
    public class GraphQLPermissionEntityFieldMiddleware : IFieldMiddleware, ISingletonDependency
    {
        public async ValueTask<object?> ResolveAsync(IResolveFieldContext context, FieldMiddlewareDelegate next)
        {
            if (context.Source.IsEntity() && !(context.Source is IPermissionedEntityProxy))
            {
                var permissionedEntityProvider = context.RequestServices?.GetService<IPermissionedEntityProvider>();
                if (permissionedEntityProvider != null)
                {
                    var newContext = new ResolveFieldContext(context)
                    {
                        Source = permissionedEntityProvider.GetNewProxiedPermissionedEntity(context.Source)
                    };
                    return await next(newContext);
                }
            }

            return await next(context);
        }
    }
}
