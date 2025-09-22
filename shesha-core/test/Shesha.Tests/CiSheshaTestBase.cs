using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Shesha.Domain;
using Shesha.Extensions;
using Shesha.Tests.Fixtures;
using System;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace Shesha.Tests
{
    public class CiSheshaTestBase : SheshaNhTestBase
    {
        public CiSheshaTestBase(IDatabaseFixture fixture) : base(fixture)
        {
        }

        private static async Task UpdateWhereAsync<T, TId>(IRepository<T, TId> repo, Expression<Func<T, bool>> predicate, Action<T> updater) where T: Entity<TId>
        {
            var entities = await repo.GetAll().Where(predicate).ToListAsync();
            foreach (var entity in entities)
            {
                updater(entity);
                await repo.UpdateAsync(entity);
            }
        }

        protected async Task DeleteFormAsync(string moduleName, string formName)
        {
            var repo = Resolve<IRepository<FormConfiguration, Guid>>();
            var revisionRepo = Resolve<IRepository<ConfigurationItemRevision, Guid>>();
            var uowManager = Resolve<IUnitOfWorkManager>();

            await DeleteActionAsync(async () => {
                var revisions = await revisionRepo.GetAll().Where(e => e.ConfigurationItem.Module != null && e.ConfigurationItem.Module.Name == moduleName && e.ConfigurationItem.Name == formName).ToListAsync();
                foreach (var revision in revisions) 
                {
                    await UpdateWhereAsync(repo, e => e.ExposedFromRevision == revision, form => {
                        form.ExposedFrom = null;
                        form.ExposedFromRevision = null;
                    });
                    await UpdateWhereAsync(repo, e => e.LatestRevision == revision, form => {
                        form.LatestRevision = null!;
                    });
                    await UpdateWhereAsync(repo, e => e.LatestImportedRevisionId == revision.Id, form => {
                        form.LatestImportedRevisionId = null;
                    });

                    await uowManager.Current.SaveChangesAsync();
                }
            });

            await DeleteActionAsync(async () => {
                var revisions = await revisionRepo.GetAll().Where(e => e.ConfigurationItem.Module != null && e.ConfigurationItem.Module.Name == moduleName && e.ConfigurationItem.Name == formName).ToListAsync();
                foreach (var revision in revisions)
                {
                    await revisionRepo.HardDeleteAsync(revision);
                }
            });


            await DeleteActionAsync(async () => {
                await repo.HardDeleteAsync(e => e.Module != null && e.Module.Name == moduleName && e.Name == formName);
            });
        }

        protected async Task DeleteFormFromAllModulesAsync(string formName)
        {
            var repo = Resolve<IRepository<FormConfiguration, Guid>>();
            var revisionRepo = Resolve<IRepository<ConfigurationItemRevision, Guid>>();
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
                var forms = await repo.GetAll().Where(e => e.LatestRevision != null && e.LatestRevision.ConfigurationItem.Name == formName)
                    .ToListAsync();
                foreach (var form in forms)
                {
                    form.LatestRevision = null!;
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
