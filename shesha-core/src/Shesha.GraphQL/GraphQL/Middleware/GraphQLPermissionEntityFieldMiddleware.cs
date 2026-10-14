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
                if (permissionedEntityProvider != null && permissionedEntityProvider.IsEntityTypePermissioned(context.Source))
                {
                    var newContext = new ResolveFieldContext(context)
                    {
                        Source = permissionedEntityProvider.GetPermissionedEntity(context.Source)
                    };
                    return await next(newContext);
                }
            }

            return await next(context);
        }
    }
}
