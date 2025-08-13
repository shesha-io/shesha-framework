using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Shesha.Domain;
using Shesha.Extensions;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Tests.ModuleHierarchy
{
    public partial class ModuleHierarchy_Tests : SheshaNhTestBase
    {
        private async Task DeleteFormIfExistsAsync(string formName)
        {
            var repo = Resolve<IRepository<FormConfiguration, Guid>>();
            var revisionRepo = Resolve<IRepository<FormConfigurationRevision, Guid>>();
            var uowManager = Resolve<IUnitOfWorkManager>();

            // exposed from
            await DeleteActionAsync(async () => {
                var forms = await repo.GetAll().Where(e => e.ExposedFromRevision != null && e.ExposedFromRevision.ConfigurationItem.Name == formName ||
                        e.ExposedFrom != null && e.ExposedFrom.Name == formName)
                    .ToListAsync();
                foreach (var form in forms)
                {
                    form.ExposedFromRevision = null;
                    form.ExposedFrom = null;
                    await repo.UpdateAsync(form);
                }
            });
            // latest revision & active revision
            await DeleteActionAsync(async () => {
                var forms = await repo.GetAll().Where(e => e.LatestRevision != null && e.LatestRevision.ConfigurationItem.Name == formName ||
                        e.ActiveRevision != null && e.ActiveRevision.ConfigurationItem.Name == formName)
                    .ToListAsync();
                foreach (var form in forms)
                {
                    form.LatestRevision = null!;
                    form.ActiveRevision = null;
                    await repo.UpdateAsync(form);
                }
            });

            await DeleteActionAsync(async () => {
                await revisionRepo.HardDeleteAsync(e => e.ConfigurationItem.Name == formName);
            });

            await DeleteActionAsync(async () => {
                await repo.HardDeleteAsync(e => e.Name == formName);
            });
        }

        private async Task DeleteActionAsync(Func<Task> action) 
        {
            var uowManager = LocalIocManager.Resolve<IUnitOfWorkManager>();
            using (var uow = uowManager.Begin()) 
            {
                using (uowManager.Current.DisableFilter(AbpDataFilters.SoftDelete)) 
                {
                    await action();
                    await uow.CompleteAsync();
                }                    
            }
        }
    }
}
