using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Microsoft.AspNetCore.SignalR;
using Shesha.Domain;
using Shesha.Exceptions;
using Shesha.Scheduler;
using Shesha.Scheduler.Domain;
using Shesha.Scheduler.SignalR;
using Shesha.Services;

namespace Shesha.Import
{
    //public class ImportJob<TI, TR> : ScheduledJobBase where TI : IImport<TR> where TR : ImportResult
    //{
    //    private readonly IIocResolver _iocResolver;
    //    protected readonly IRepository<TR, Guid> _resultRepository;
    //    protected readonly IStoredFileService _fileService;

    //    public ImportJob(IIocResolver iocResolver, IRepository<ScheduledJob, Guid> jobRepository, IRepository<ScheduledJobTrigger, Guid> triggerRepository, IRepository<ScheduledJobExecution, Guid> jobExecutionRepository, IStoredFileService fileService, IHubContext<SignalrAppenderHub> hubContext, IUnitOfWorkManager unitOfWorkManager, IRepository<TR, Guid> resultRepository) : base(jobRepository, triggerRepository, jobExecutionRepository, fileService, hubContext, unitOfWorkManager)
    //    {
    //        _iocResolver = iocResolver;
    //        _resultRepository = resultRepository;
    //        _fileService = fileService;
    //    }

    //    public override void DoExecuteAsync(CancellationToken cancellationToken)
    //    {
    //        try
    //        {
    //            Log.Info("Import job started");

    //            Guid? importResultId = null;

    //            var result = importResultId != null
    //                ? _resultRepository.Get(importResultId.Value)
    //                : null;
    //            if (result == null)
    //                throw new Exception($"Import results record not found. id = {importResultId}");

    //            var importer = _iocResolver.Resolve<TI>(new {logger = Log, logGroupName = Name});

    //            /*
    //            importer.Import(result, CancellationToken, out var errorMessage);

    //            if (string.IsNullOrWhiteSpace(errorMessage))
    //                Log.Info("Import successfully started");
    //            else
    //                Log.Warn("Import process has not been started: " + errorMessage);
    //                */
    //        }
    //        catch (Exception e)
    //        {
    //            e.LogToElmah();
    //            Log.FatalFormat("Fatal Error was occured during import process: {0}", e.Message);
    //        }
    //    }

    //    protected static List<string> GetLocalFiles(string path, string wildcard, bool scanSubfolders)
    //    {
    //        return Directory.GetFiles(path, wildcard, scanSubfolders ? SearchOption.AllDirectories : SearchOption.TopDirectoryOnly).ToList();
    //    }
    //}
}
