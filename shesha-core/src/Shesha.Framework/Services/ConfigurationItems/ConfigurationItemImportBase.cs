using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using System.Threading.Tasks;
using System;
using Abp.Domain.Repositories;
using Shesha.Domain.ConfigurationItems;
using Abp.Domain.Uow;

namespace Shesha.Services.ConfigurationItems
{
    /// <summary>
    /// Base class of the configuration item importer
    /// </summary>
    public abstract class ConfigurationItemImportBase
    {
        protected IRepository<Module, Guid> ModuleRepo { get; private set; }
        protected IRepository<FrontEndApp, Guid> FrontendAppRepo { get; private set; }
        public IUnitOfWorkManager UnitOfWorkManager { get; set; }

        public ConfigurationItemImportBase(IRepository<Module, Guid> _moduleRepo, IRepository<FrontEndApp, Guid> _frontendAppRepo)
        {
            ModuleRepo = _moduleRepo;
            FrontendAppRepo = _frontendAppRepo;
        }

        /// <summary>
        /// Get module by name
        /// </summary>
        /// <param name="name">Module name</param>
        /// <param name="context">Import context</param>
        /// <returns></returns>
        /// <exception cref="NotSupportedException"></exception>
        protected async Task<Module> GetModuleAsync(string name, IConfigurationItemsImportContext context)
        {
            if (string.IsNullOrWhiteSpace(name))
                return null;

            var module = await ModuleRepo.FirstOrDefaultAsync(m => m.Name == name);
            if (module == null)
            {
                if (context.CreateModules)
                {
                    module = new Module { Name = name, IsEnabled = true };
                    await ModuleRepo.InsertAsync(module);
                    await UnitOfWorkManager.Current.SaveChangesAsync();
                }
                else
                    throw new NotSupportedException($"Module `{name}` is missing");
            }

            return module;
        }

        /// <summary>
        /// Get front-end application by appKey
        /// </summary>
        /// <param name="appKey">AppKey of the front-end application</param>
        /// <param name="context">Import context</param>
        /// <returns></returns>
        /// <exception cref="NotSupportedException"></exception>
        protected async Task<FrontEndApp> GetFrontEndAppAsync(string appKey, IConfigurationItemsImportContext context)
        {
            if (string.IsNullOrWhiteSpace(appKey))
                return null;

            var application = await FrontendAppRepo.FirstOrDefaultAsync(m => m.AppKey == appKey);
            if (application == null)
            {
                if (context.CreateFrontEndApplications)
                {
                    application = new FrontEndApp { AppKey = appKey, Name = appKey };
                    await FrontendAppRepo.InsertAsync(application);
                }
                else
                    throw new NotSupportedException($"Front-end application `{appKey}` is missing");
            }

            return application;
        }
    }
}
