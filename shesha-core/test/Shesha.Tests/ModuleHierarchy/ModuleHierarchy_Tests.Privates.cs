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

            await WithUnitOfWorkAsync(async () => {
                var forms = await repo.GetAll().Where(e => e.ExposedFromRevision != null && e.ExposedFromRevision.ConfigurationItem.Name == formName ||
                        e.ExposedFrom != null && e.ExposedFrom.Name == formName)
                    .ToListAsync();
                foreach (var form in forms)
                {
                    form.ExposedFromRevision = null;
                    await repo.UpdateAsync(form);
                }
            });

            await WithUnitOfWorkAsync(async () => {
                await revisionRepo.HardDeleteAsync(e => e.ConfigurationItem.Name == formName);
            });

            await WithUnitOfWorkAsync(async () => {
                await repo.HardDeleteAsync(e => e.Name == formName);
            });
        }
    }
}
