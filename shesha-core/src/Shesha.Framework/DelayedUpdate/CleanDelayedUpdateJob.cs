using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Shesha.Domain;
using Shesha.Scheduler;
using Shesha.Scheduler.Attributes;
using Shesha.Scheduler.Domain.Enums;
using Shesha.Services;
using Shesha.Services.StoredFiles;
using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading;
using System.Threading.Tasks;

namespace Shesha.DelayedUpdate
{
    [ScheduledJob("B72BE830-7EA9-4124-85C7-165F7E35DA1D", StartUpMode.Manual, "0 0 * * *")]
    public class CleanDelayedUpdateJob : ScheduledJobBase<ScheduledJobStatistic>, ITransientDependency
    {
        private readonly IRepository<StoredFile, Guid> _fileRepository;
        private readonly IStoredFileService _storedFileService;
        private readonly IUnitOfWorkManager _unitOfWorkManager;

        public CleanDelayedUpdateJob(IRepository<StoredFile, Guid> fileRepository, IStoredFileService storedFileService, IUnitOfWorkManager unitOfWorkManager)
        {
            _fileRepository = fileRepository;
            _storedFileService = storedFileService;
            _unitOfWorkManager = unitOfWorkManager;
        }

        public override Task DoExecuteAsync(CancellationToken cancellationToken)
        {
            var date = DateTime.Now.AddDays(-2);
            var files = _fileRepository.GetAll().Where(x => x.Temporary && x.CreationTime < date).ToList();

            for (int i = 0; i < files.Count; i++)
            {
                Log?.Info($"processing {i + 1} of {files.Count}");

                try
                {
                    _storedFileService.Delete(files[i]);
                    JobStatistics.NumSucceeded = JobStatistics.NumSucceeded + 1;
                }
                catch (Exception e)
                {
                    Log?.Error(e.Message, e);
                }
            }

            return Task.CompletedTask;
        }
    }
}
