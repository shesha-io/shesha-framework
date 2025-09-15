using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Castle.Core.Logging;
using Shesha.Bootstrappers;
using Shesha.Domain;
using Shesha.DynamicEntities.DbGenerator;
using Shesha.Extensions;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha
{
    public class GenerateDynamicEntitiesDb : IInitializatorFromDb, ITransientDependency
    {
        public readonly IIocManager _ioc;
        public readonly IDynamicEntitiesDbGenerator _dbGenerator;
        private readonly IRepository<EntityConfig, Guid> _entityConfigRepository;
        private readonly IRepository<EntityProperty, Guid> _entityPropertyRepository;
        private readonly ILogger _logger;
        private readonly IUnitOfWorkManager _unitOfWorkManager;

        public GenerateDynamicEntitiesDb(
            IIocManager ioc,
            ILogger logger,
            IDynamicEntitiesDbGenerator dbGenerator,
            IRepository<EntityConfig, Guid> entityConfigRepository,
            IRepository<EntityProperty, Guid> entityPropertyRepository,
            IUnitOfWorkManager unitOfWorkManager
        ) 
        {
            _ioc = ioc;
            _logger = logger;
            _dbGenerator = dbGenerator;
            _entityConfigRepository = entityConfigRepository;
            _entityPropertyRepository = entityPropertyRepository;
            _unitOfWorkManager = unitOfWorkManager;
        }

        public async Task ProcessAsync()
        {
            _logger.Warn($"DB changes for Dynamic Entities");

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

                var otherConfigs = sortedToAdd.Where(x => x.CreatedInDb);
                // check for properties
                foreach (var config in otherConfigs)
                {
                    var properties = await _entityPropertyRepository.GetAll()
                        .Where(x => 
                            x.EntityConfig.Id == config.Id
                            && !x.CreatedInDb 
                            && (x.InheritedFrom == null || x.InheritedFrom.IsDeleted)
                            && x.ParentProperty == null 
                            && x.Name != "Id")
                        .ToListAsync();
                    foreach (var property in properties)
                    {
                        await _dbGenerator.ProcessEntityPropertyAsync(property);
                    }
                }

                var createTableConfigs = sortedToAdd.Where(x => !x.CreatedInDb);
                foreach (var config in createTableConfigs)
                {
                    await _dbGenerator.ProcessEntityConfigAsync(config);
                }
                await unitOfWork.CompleteAsync();
            }
            _logger.Warn($"DB changes for Dynamic Entities - finished");
        }
    }
}
