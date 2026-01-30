using Abp.Application.Services;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Runtime.Validation;
using Hangfire;
using Microsoft.AspNetCore.Mvc;
using Shesha.Domain;
using Shesha.Exceptions;
using Shesha.Import.Dto;
using Shesha.Services;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Transactions;

namespace Shesha.Import
{
    public abstract class ImportApplicationService<TImport, TResult> : ApplicationService
        where TResult : ImportResult, new()
        where TImport : IAsyncImport<TResult>
    {
        protected IStoredFileService _fileService;
        protected IRepository<TResult, Guid> _importResultsRepository;
        protected readonly IUnitOfWorkManager _unitOfWorkManager;

        protected ImportApplicationService(IStoredFileService fileService, IRepository<TResult, Guid> importResultsRepository, IUnitOfWorkManager unitOfWorkManager)
        {
            _fileService = fileService;
            _importResultsRepository = importResultsRepository;
            _unitOfWorkManager = unitOfWorkManager;
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        [DisableRequestSizeLimit]
        public virtual async Task<bool> StartImportAsync([FromForm] StartImportInput input)
        {
            try
            {
                var validationResults = new List<ValidationResult>();

                if (input.File == null)
                    validationResults.Add(new ValidationResult("File not selected"));
                    
                if (validationResults.Any())
                    throw new AbpValidationException("Failed to start import", validationResults);

                var fileName = input.File.FileName.CleanupFileName();
                await using (var fileStream = input.File.OpenReadStream())
                {
                    var startResult = await StartAsync(fileName, fileStream);
                    return startResult.IsSuccess;
                }
            }
            catch (Exception e)
            {
                Logger.Error(e.Message, e);
                throw;
            }
        }

        protected async Task<ImportStartResult> StartAsync(string fileName, Stream stream)
        {
            var result = new ImportStartResult();
            /*
             todo: implement `in progress` check
             note: it should support multitenancy
            if (SchedulerUtility.IsJobInProgress(typeof(TJ)))
            {
                errorMessage = "Import already in progress";
                return false;
            }
            */

            // Create log file
            var logFileName = Path.ChangeExtension(fileName, ".log");

            var importResultId = Guid.NewGuid();

            // Save info about the import to the DB (including imported file and log file)
            using (var uow = _unitOfWorkManager.Begin(TransactionScopeOption.RequiresNew))
            {
                var importResult = Activator.CreateInstance<TResult>();
                importResult.Id = importResultId;
                importResult.SourceType = RefListImportSourceType.File;
                importResult.StartedOn = DateTime.Now;
                importResult.ImportedFile = await _fileService.SaveFileAsync(stream, fileName);
                importResult.ImportedFileMD5 = FileHelper.GetMD5(stream);
                //importResult.LogFile = logFileName;
                
                await _importResultsRepository.InsertAsync(importResult);
                await uow.CompleteAsync();
            }

            try
            {
                BackgroundJob.Enqueue<TImport>(i => i.ImportAsync(importResultId, CancellationToken.None));

                result.IsSuccess = true;
            }
            catch (Exception e)
            {
                result.ErrorMessage = e.FullMessage();
                result.IsSuccess = false;
            }

            return result;
        }
    }

    public class ImportStartResult
    {
        public bool IsSuccess { get; set; }
        public string ErrorMessage { get; set; }
    }
}
