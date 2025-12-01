using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Castle.Core.Logging;
using Shesha.Bootstrappers;
using Shesha.Domain;
using Shesha.DynamicEntities.ErrorHandler;
using Shesha.Extensions;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities.DbGenerator
{
    public class GenerateDynamicEntitiesDb : IInitializatorFromDb, ITransientDependency
    {
        public ILogger Logger { get; set; }

        public readonly IIocManager _ioc;
        public readonly IDynamicEntitiesDbGenerator _dbGenerator;
        private readonly IRepository<EntityConfig, Guid> _entityConfigRepository;
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly IDynamicEntitiesErrorHandler _errorHandler;

        public GenerateDynamicEntitiesDb(
            IIocManager ioc,
            ILogger logger,
            IDynamicEntitiesDbGenerator dbGenerator,
            IRepository<EntityConfig, Guid> entityConfigRepository,
            IUnitOfWorkManager unitOfWorkManager,
            IDynamicEntitiesErrorHandler errorHandler
        )
        {
            Logger = NullLogger.Instance;

            _ioc = ioc;
            _dbGenerator = dbGenerator;
            _entityConfigRepository = entityConfigRepository;
            _unitOfWorkManager = unitOfWorkManager;
            _errorHandler = errorHandler;
        }

        public async Task ProcessAsync()
        {
            Logger.Warn($"DB changes for Dynamic Entities");

            using (var unitOfWork = _unitOfWorkManager.Begin())
            {
                var configs = await _entityConfigRepository.GetAll()
                    .Where(x => x.Source == Domain.Enums.MetadataSourceType.UserDefined && x.EntityConfigType == Domain.Enums.EntityConfigTypes.Class)
                    .ToListAsync();

                var allCount = configs.Count;
                var sortedToAdd = configs.Where(x => configs.All(y => x.InheritedFrom != y)).ToList();
                var nextLevel = configs.Where(x => sortedToAdd.Any(y => x.InheritedFrom == y)).ToList();
                while (sortedToAdd.Count < allCount && nextLevel.Count > 0)
                {
                    sortedToAdd.AddRange(nextLevel);
                    nextLevel = configs.Where(x => !sortedToAdd.Contains(x) && sortedToAdd.Any(y => x.InheritedFrom == y)).ToList();
                }

                foreach (var config in sortedToAdd)
                {
                    try
                    {
                        await _dbGenerator.ProcessEntityConfigAsync(config);
                    }
                    catch (Exception e)
                    {
                        await _errorHandler.HandleInitializationErrorAsync(e);
                    }
                }
                await unitOfWork.CompleteAsync();
            }

            _errorHandler.Complete();

            Logger.Warn($"DB changes for Dynamic Entities - finished");
        }
    }
}
