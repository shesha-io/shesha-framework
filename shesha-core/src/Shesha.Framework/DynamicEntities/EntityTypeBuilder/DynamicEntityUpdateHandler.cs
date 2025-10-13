using Abp.Dependency;
using Abp.Domain.Uow;
using Abp.Reflection;
using Shesha.Reflection;
using System.Collections.Generic;
using System;
using System.Linq;
using System.Threading.Tasks;
using Shesha.Attributes;

namespace Shesha.DynamicEntities.EntityTypeBuilder
{
    public class DynamicEntityUpdateHandler : IDynamicEntityUpdateHandler, ITransientDependency
    {
        private readonly ITypeFinder _typeFinder;
        private readonly IocManager _ioc;

        public DynamicEntityUpdateHandler(
            ITypeFinder typeFinder,
            IocManager ioc
        )
        {
            _typeFinder = typeFinder;
            _ioc = ioc;
        }

        public async Task ProcessAsync()
        {
            // find all updaters and run them
            var updaters = _typeFinder.Find(t => typeof(IDynamicEntityUpdateEvent).IsAssignableFrom(t) && t.IsClass).ToList();
            updaters = SortByDependencies(updaters);

            foreach (var updater in updaters)
            {
                if (_ioc.IsRegistered(updater) && _ioc.Resolve(updater) is IDynamicEntityUpdateEvent initializator)
                {

                    var method = updater.GetRequiredMethod(nameof(IDynamicEntityUpdateEvent.ProcessAsync));
                    var unitOfWorkAttribute = method.GetAttributeOrNull<UnitOfWorkAttribute>(true);
                    var useDefaultUnitOfWork = unitOfWorkAttribute == null || !unitOfWorkAttribute.IsDisabled;

                    if (useDefaultUnitOfWork)
                    {
                        var uowManager = _ioc.Resolve<IUnitOfWorkManager>();
                        using (var unitOfWork = uowManager.Begin())
                        {
                            await initializator.ProcessAsync();
                            await unitOfWork.CompleteAsync();
                        }
                    }
                    else
                        await initializator.ProcessAsync();
                }
            }

        }

        private List<Type> SortByDependencies(List<Type> types)
        {
            var withDeps = types.Select(t => new
            {
                Type = t,
                Dependencies = t.GetAttributeOrNull<DependsOnTypesAttribute>()?.DependedTypes?.ToList()
            })
                .ToList();

            var result = new List<Type>();

            while (withDeps.Count > 0)
            {
                var i = 0;
                var emptyLoop = true;
                while (i <= withDeps.Count - 1)
                {
                    var current = withDeps[i];
                    if (current.Dependencies == null || current.Dependencies.All(t => result.Contains(t)))
                    {
                        result.Add(current.Type);
                        withDeps.RemoveAt(i);
                        emptyLoop = false;
                    }
                    else
                        i++;
                }

                if (emptyLoop)
                    break;
            }

            return result;
        }
    }
}
