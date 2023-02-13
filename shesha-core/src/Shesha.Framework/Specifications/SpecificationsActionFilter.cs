using Abp.AspNetCore.Mvc.Extensions;
using Abp.Dependency;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Specifications
{
    /// <summary>
    /// Specifications action filter. Allows to automatically apply specifications to endpoints
    /// </summary>
    public class SpecificationsActionFilter : IAsyncActionFilter, ITransientDependency
    {
        private readonly ISpecificationManager _specificationsManager;

        public SpecificationsActionFilter(ISpecificationManager specificationsManager)
        {
            _specificationsManager = specificationsManager;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            if (!context.ActionDescriptor.IsControllerAction())
            {
                await next();
                return;
            }

            var attributes = context.ActionDescriptor.GetMethodInfo().GetCustomAttributes(true);
            var disabled = attributes.OfType<DisableSpecificationsAttribute>().Any();
            if (disabled)
            {
                using (_specificationsManager.DisableSpecifications()) 
                {
                    await next();
                    return;
                }
            }

            var specifications = attributes
                .OfType<ApplySpecificationsAttribute>()
                .SelectMany(a => a.SpecificationTypes)
                .ToArray();

            if (specifications.Any())
            {
                using (_specificationsManager.Use(specifications)) 
                {
                    await next();
                    return;
                }
            }
            else {
                await next();
                return;
            }
        }
    }
}
