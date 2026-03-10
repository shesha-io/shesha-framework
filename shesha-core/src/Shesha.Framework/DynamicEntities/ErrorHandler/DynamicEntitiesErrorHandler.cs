using Abp.Dependency;
using Abp.Domain.Repositories;
using Castle.Core.Logging;
using Shesha.Domain;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities.ErrorHandler
{
    public class DynamicEntitiesErrorHandler : IDynamicEntitiesErrorHandler, ISingletonDependency
    {
        public ILogger Logger { get; set; }

        private readonly IRepository<EntityConfig, Guid> _entityConfigRepo;
        private readonly IRepository<EntityProperty, Guid> _propertyRepo;

        private readonly ConcurrentBag<Exception> _exceptions = new ConcurrentBag<Exception>();
        public IReadOnlyCollection<Exception> Exceptions => _exceptions.ToList();

        public DateTime LastComplete { get; private set; }

        public DynamicEntitiesErrorHandler(
            IRepository<EntityProperty, Guid> propertyRepo,
            IRepository<EntityConfig, Guid> entityConfigRepo
        )
        {
            Logger = NullLogger.Instance;
            _propertyRepo = propertyRepo;
            _entityConfigRepo = entityConfigRepo;
        }

        public void Complete()
        {
            LastComplete = DateTime.Now;
        }

        public async Task HandleInitializationErrorAsync(Exception exception)
        {
            var message = new StringBuilder();
            message.AppendLine(exception.Message);
            var ex = exception.InnerException;
            var rootMessage = exception.Message;
            while (ex != null)
            {
                message.AppendLine(ex.Message);
                rootMessage = ex.Message;
                ex = ex.InnerException;
            }
            Logger.Error(message.ToString(), exception);

            _exceptions.Add(exception);

            await ProceedAsync(exception, rootMessage);
        }

        private async Task ProceedAsync(Exception? e, string message)
        {
            var error = e;
            while (error != null)
            {
                if (error is EntityDbInitializationException entityDbError)
                    await HandleEntityDbErrorAsync(entityDbError, message);
                else if (error is EntityPropertyDbInitializationException propertyDbError)
                    await HandlePropertyDbErrorAsync(propertyDbError, message);
                else if (error is EntityInitializationException entityError)
                    await HandleEntityErrorAsync(entityError, message);
                else if (error is EntityPropertyInitializationException propertyError)
                    await HandlePropertyErrorAsync(propertyError, message);
                error = error.InnerException;
            }
        }

        private async Task HandlePropertyDbErrorAsync(EntityPropertyDbInitializationException error, string message)
        {
            try
            {
                // Get entity as Session can be closed
                var prop = await _propertyRepo.GetAsync(error.EntityProperty.Id);
                prop.InitStatus |= Enums.EntityInitFlags.DbActionFailed;
                prop.InitMessage = message;

                await _propertyRepo.UpdateAsync(prop);
            }
            catch (Exception ex)
            {
                Logger.Error($"Failed to persist DB error status for EntityProperty {error.EntityProperty.Id}", ex);
            }
        }

        private async Task HandleEntityDbErrorAsync(EntityDbInitializationException error, string message)
        {
            try
            {
                // Get entity as Session can be closed
                var entity = await _entityConfigRepo.GetAsync(error.EntityConfig.Id);
                entity.InitStatus |= Enums.EntityInitFlags.DbActionFailed;
                entity.InitMessage = error.InnerException is EntityPropertyDbInitializationException
                    ? "Check the properties errors"
                    : message;
                entity.IsCodegenPending = true;

                await _entityConfigRepo.UpdateAsync(entity);
            }
            catch (Exception ex)
            {
                Logger.Error($"Failed to persist DB error status for EntityConfig {error.EntityConfig.Id}", ex);
            }
        }

        private async Task HandlePropertyErrorAsync(EntityPropertyInitializationException error, string message)
        {
            if (error.EntityProperty != null)
            {
                try
                {
                    // Get entity as Session can be closed
                    var prop = await _propertyRepo.GetAsync(error.EntityProperty.Id);
                    prop.InitStatus |= Enums.EntityInitFlags.InitializationFailed;
                    prop.InitMessage = message;

                    await _propertyRepo.UpdateAsync(prop);
                }
                catch (Exception ex)
                {
                    Logger.Error($"Failed to persist error status for EntityProperty {error.EntityProperty.Id}", ex);
                }

            }
        }

        private async Task HandleEntityErrorAsync(EntityInitializationException error, string message)
        {
            try
            {
                // Get entity as Session can be closed
                var entity = await _entityConfigRepo.GetAsync(error.EntityConfig.Id);
                entity.InitStatus |= Enums.EntityInitFlags.InitializationFailed;
                entity.InitMessage = error.InnerException is EntityPropertyInitializationException
                    ? "Check the properties errors"
                    : message;
                entity.IsCodegenPending = true;

                await _entityConfigRepo.UpdateAsync(entity);
            }
            catch (Exception ex)
            {
                Logger.Error($"Failed to persist error status for EntityConfig {error.EntityConfig.Id}", ex);
            }

        }
    }
}
