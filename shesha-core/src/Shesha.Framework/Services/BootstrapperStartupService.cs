using Abp.Dependency;
using Abp.Domain.Repositories;
using Shesha.Bootstrappers;
using Shesha.Domain;
using Shesha.Extensions;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Services
{
    public class BootstrapperStartupService : IBootstrapperStartupService, ITransientDependency
    {
        private readonly IRepository<BootstrapperStartup, Guid> _repository;

        public BootstrapperStartupService(IRepository<BootstrapperStartup, Guid> repository)
        {
            _repository = repository;
        }

        public async Task<bool> IsForcedAsync(Type bootstrapper)
        {
            return await IsForcedAsync(bootstrapper.Name);
        }

        private async Task<BootstrapperStartup> GetLastAsync(string bootstrapperName)
        {
            return await _repository.GetAll()
                .Where(x => x.BootstrapperName == bootstrapperName)
                .OrderByDescending(x => x.CreationTime)
                .FirstOrDefaultAsync();
        }

        public async Task<bool> IsForcedAsync(string bootstrapperName)
        {
            var last = await GetLastAsync(bootstrapperName);
            // Check if last forced and not completed
            return (last?.Force ?? false) && last?.Status != BootstrapperStartupStatus.Completed;
        }

        public async Task SkipBootstrapperAsync(Type bootstrapper, string? result = null, BootstrapperStartupContext? context = null)
        {
            await SkipBootstrapperAsync(bootstrapper.Name, result, context);
        }

        public async Task SkipBootstrapperAsync(string bootstrapperName, string? result = null, BootstrapperStartupContext? context = null)
        {
            var entity = new BootstrapperStartup
            {
                CreationTime = DateTime.Now,
                BootstrapperName = bootstrapperName,
                Status = BootstrapperStartupStatus.Skipped,
                Result = result,
                Context = context
            };

            await _repository.InsertAsync(entity);
        }

        /*public async Task<BootstrapperStartup> StartBootstrapperAsync(BootstrapperStartup entity)
        {
            entity = await _repository.GetAsync(entity.Id) ?? await StartBootstrapperAsync(entity.BootstrapperName);
            entity.StartedOn = DateTime.Now;
            entity.Status = BootstrapperStartupStatus.Started;
            return await _repository.InsertOrUpdateAsync(entity);
        }*/

        public async Task<BootstrapperStartup> StartBootstrapperAsync(string bootstrapperName)
        {
            var last = await GetLastAsync(bootstrapperName);

            var entity = (last?.Force ?? false) && last?.Status == BootstrapperStartupStatus.Unknown
                ? last
                : new BootstrapperStartup { CreationTime = DateTime.Now, BootstrapperName = bootstrapperName };

            entity.StartedOn = DateTime.Now;
            entity.Status = BootstrapperStartupStatus.Started;
            return await _repository.InsertOrUpdateAsync(entity); ;
        }

        public async Task<BootstrapperStartup> StartBootstrapperAsync(Type bootstrapper)
        {
            return await StartBootstrapperAsync(bootstrapper.Name);
        }

        public async Task CompleteBootstrapperAsync(BootstrapperStartup entity, string? result = null, BootstrapperStartupContext? context = null)
        {
            entity = await _repository.GetAsync(entity.Id) ?? await StartBootstrapperAsync(entity.BootstrapperName);
            entity.FinishedOn = DateTime.Now;
            entity.Status = BootstrapperStartupStatus.Completed;
            entity.Result = result;
            entity.Context = context;
            await _repository.InsertOrUpdateAsync(entity);
        }

        public async Task FailedBootstrapperAsync(BootstrapperStartup entity, string? result = null, BootstrapperStartupContext? context = null)
        {
            entity = await _repository.GetAsync(entity.Id) ?? await StartBootstrapperAsync(entity.BootstrapperName);
            entity.FinishedOn = DateTime.Now;
            entity.Status = BootstrapperStartupStatus.Failed;
            entity.Result = result;
            entity.Context = context;
            await _repository.InsertOrUpdateAsync(entity);
        }

    }
}
