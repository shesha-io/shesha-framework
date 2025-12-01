using Abp.Dependency;
using Abp.Domain.Repositories;
using Castle.Core.Logging;
using Shesha.Domain;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities.ErrorHandler
{
    public class DynamicEntitiesErrorHandler : IDynamicEntitiesErrorHandler, ISingletonDependency
    {
        public ILogger Logger { get; set; }

        private readonly IRepository<EntityConfig, Guid> _entityConfigRepo;
        private readonly IRepository<EntityProperty, Guid> _propertyRepo;

        public List<Exception> Exceptions { get; private set; } = new List<Exception>();

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

            Exceptions.Add(exception);

            await ProceedAsync(exception, rootMessage);
        }

        private async Task ProceedAsync(Exception? e, string message)
        {
            var error = e;
            while(error != null)
            {
                if (error is EntityDbInitializationException entityDbError)
                    await HandleEntityDbErrorAsync(entityDbError, message);
                if (error is EntityPropertyDbInitializationException propertyDbError)
                    await HandlePropertyDbErrorAsync(propertyDbError, message);
                if (error is EntityInitializationException entityError)
                    await HandleEntityErrorAsync(entityError, message);
                if (error is EntityPropertyInitializationException propertyError)
                    await HandlePropertyErrorAsync(propertyError, message);
                error = error.InnerException;
            }
        }

        private async Task HandlePropertyDbErrorAsync(EntityPropertyDbInitializationException error, string message)
        {
            // Get entity as Session can be closed
            var prop = await _propertyRepo.GetAsync(error.EntityProperty.Id);
            prop.InitStatus |= Enums.EntityInitFlags.DbActionFailed;
            prop.InitMessage = message;

            await _propertyRepo.UpdateAsync(prop);
        }

        private async Task HandleEntityDbErrorAsync(EntityDbInitializationException error, string message)
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

        private async Task HandlePropertyErrorAsync(EntityPropertyInitializationException error, string message)
        {
            if (error.EntityProperty != null)
            {
                // Get entity as Session can be closed
                var prop = await _propertyRepo.GetAsync(error.EntityProperty.Id);
                prop.InitStatus |= Enums.EntityInitFlags.InitializationFailed;
                prop.InitMessage = message;

                await _propertyRepo.UpdateAsync(prop);
            }
        }

        private async Task HandleEntityErrorAsync(EntityInitializationException error, string message)
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
    }
}
