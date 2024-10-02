using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Reflection;
using Castle.Core.Logging;
using Shesha.Domain;
using Shesha.Exceptions;
using Shesha.Extensions;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace Shesha.Startup
{
    public class ApplicationStartupSession : IApplicationStartupSession, ISingletonDependency
    {
        private readonly IRepository<ApplicationStartup, Guid> _startupRepository;
        private readonly IRepository<ApplicationStartupAssembly, Guid> _assemblyRepository;
        private readonly IAssemblyFinder _assemblyFinder;
        private readonly IUnitOfWorkManager _uowManager;

        /// <summary>
        /// Gets or sets the logger.
        /// </summary>
        public ILogger Logger { get; set; }

        public ApplicationStartupDto PreviousStartup { get; private set; }
        public ApplicationStartupDto CurrentStartup { get; private set; }
        public bool AllAssembliesStayUnchanged { get; private set; }

        private List<ApplicationStartupAssemblyDto> _unchangedAssemblies;

        private bool _hasStarted = false;

        public ApplicationStartupSession(
            IRepository<ApplicationStartup, Guid> startupRepository,
            IRepository<ApplicationStartupAssembly, Guid> assemblyRepository,
            IAssemblyFinder assemblyFinder,
            IUnitOfWorkManager uowManager
        )
        {
            _startupRepository = startupRepository;
            _assemblyRepository = assemblyRepository;
            _assemblyFinder = assemblyFinder;
            _uowManager = uowManager;
        }

        private async Task<ApplicationStartup> LogStartupAsync(LogApplicationStartArgs arguments)
        {
            if (_hasStarted)
                throw new Exception("Application startup already registered");
            _hasStarted = true;

            PreviousStartup = await GetPreviousStartupDetailsAsync();

            var startup = new ApplicationStartup {
                Status = Domain.Enums.ApplicationStartupStatus.InProgress,
                StartedOn = DateTime.Now,
                MachineName = Environment.MachineName,
                Account = Environment.UserName,
                Folder = Environment.CurrentDirectory,

                BootstrappersDisabled = arguments.BootstrappersDisabled,
                MigrationsDisabled = arguments.MigrationsDisabled,
            };
            await _startupRepository.InsertAsync(startup);
            return startup;
        }

        private async Task<List<ApplicationStartupAssembly>> LogAssembliesAsync(ApplicationStartup startup)
        {
            var assemblyDtos = GetAllManagedAssemblies();
            var assemblies = new List<ApplicationStartupAssembly>();
            foreach (var assemblyDto in assemblyDtos)
            {
                var startupAssembly = new ApplicationStartupAssembly {
                    ApplicationStartup = startup,
                    FileName = assemblyDto.FileName,
                    FilePath = assemblyDto.FilePath,
                    FileMD5 = assemblyDto.FileMD5,
                    FileVersion = assemblyDto.FileVersion,
                    ProductVersion = assemblyDto.ProductVersion,
                };
                await _assemblyRepository.InsertAsync(startupAssembly);
                assemblies.Add(startupAssembly);
            }
            return assemblies;
        }

        private List<AssemblyDto> GetAllManagedAssemblies()
        {
            var assemblies = _assemblyFinder.GetAllAssemblies().Where(a => !a.IsDynamic && a.GetTypes().Any()).ToList();
            var dtos = assemblies.Select(a => GetAssemblyDto(a)).ToList();
            return dtos;
        }

        private AssemblyDto GetAssemblyDto(Assembly assembly)
        {
            var fileVersionInfo = FileVersionInfo.GetVersionInfo(assembly.Location);

            return new AssemblyDto
            {
                FileName = Path.GetFileName(assembly.Location),
                FilePath = Path.GetDirectoryName(assembly.Location),
                FileMD5 = FileHelper.GetMD5(assembly.Location),
                FileVersion = fileVersionInfo.FileVersion,
                ProductVersion = fileVersionInfo.ProductVersion,
            };
        }

        public async Task<bool> DbIsReadyForLoggingAsync()
        {
            try
            {
                using (var uow = _uowManager.Begin())
                {
                    // try to fetch one row from both tables to check readiness of the DB structure
                    await _startupRepository.GetAll().OrderByDescending(a => a.StartedOn).FirstOrDefaultAsync();
                    await _assemblyRepository.GetAll().OrderByDescending(a => a.ApplicationStartup.StartedOn).ThenBy(a => a.FileName).FirstOrDefaultAsync();

                    await uow.CompleteAsync();
                }
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<ApplicationStartupDto> LogApplicationStartAsync(LogApplicationStartArgs arguments)
        {
            using (var uow = _uowManager.Begin())
            {
                var startup = await LogStartupAsync(arguments);
                var assemblies = await LogAssembliesAsync(startup);
                await uow.CompleteAsync();

                CurrentStartup = MapStartupToDto(startup, assemblies);
                FillUnchangedAssemblies();
                return CurrentStartup;
            }
        }

        private void FillUnchangedAssemblies() 
        {
            // don't fill the list if previous startup is missing or not full and successful
            if (PreviousStartup == null || PreviousStartup.MigrationsDisabled || PreviousStartup.BootstrappersDisabled || PreviousStartup.Status != Domain.Enums.ApplicationStartupStatus.Success) 
            {
                _unchangedAssemblies = new List<ApplicationStartupAssemblyDto>();
                AllAssembliesStayUnchanged = false;
                return;
            }
                
            _unchangedAssemblies = CurrentStartup.Assemblies.Where(curr => 
                PreviousStartup.Assemblies.Any(prev => prev.FileName == curr.FileName && 
                    prev.FileVersion == curr.FileVersion && 
                    prev.ProductVersion == curr.ProductVersion &&
                    prev.FileMD5 == curr.FileMD5
                    )
                )
                .ToList();
            
            AllAssembliesStayUnchanged = _unchangedAssemblies.Count() == CurrentStartup.Assemblies.Count() &&
                CurrentStartup.Assemblies.Count() == PreviousStartup.Assemblies.Count();
        }

        private ApplicationStartupDto MapStartupToDto(ApplicationStartup startup, List<ApplicationStartupAssembly> assemblies)
        {
            return startup != null
                ? new ApplicationStartupDto()
                {
                    Id = startup.Id,
                    Status = startup.Status,
                    MigrationsDisabled = startup.MigrationsDisabled,
                    BootstrappersDisabled = startup.BootstrappersDisabled,
                    Assemblies = assemblies.Select(a => MapAssemblyToDto(a)).ToList(),
                }
                : null;
        }

        private ApplicationStartupAssemblyDto MapAssemblyToDto(ApplicationStartupAssembly assembly)
        {
            return new ApplicationStartupAssemblyDto {
                Id = assembly.Id,
                FileMD5 = assembly.FileMD5,
                FileName = assembly.FileName,
                FileVersion = assembly.FileVersion,                
                ProductVersion = assembly.ProductVersion,
            };
        }

        public async Task StartupSuccessAsync(Guid id)
        {
            using (var uow = _uowManager.Begin())
            {
                await _startupRepository.UpdateAsync(id, startup => {
                    startup.FinishedOn = DateTime.Now;
                    startup.Status = Domain.Enums.ApplicationStartupStatus.Success;

                    return Task.CompletedTask;
                });
                await uow.CompleteAsync();
            }
        }

        public async Task StartupFailedAsync(Guid id, Exception e)
        {
            try
            {
                using (var uow = _uowManager.Begin())
                {
                    await _startupRepository.UpdateAsync(id, startup => {
                        startup.FinishedOn = DateTime.Now;
                        startup.Status = Domain.Enums.ApplicationStartupStatus.Failed;
                        startup.ErrorMessage = e.FullMessage();

                        return Task.CompletedTask;
                    });
                    await uow.CompleteAsync();
                }
            }
            catch (Exception loggingException)
            {
                Logger.Error("Failed to mark application start as failed", loggingException);
            }
        }

        private async Task<ApplicationStartupDto> GetPreviousStartupDetailsAsync()
        {
            ApplicationStartupDto result = null;
            using (var uow = _uowManager.Begin()) 
            {
                var prevStartup = await _startupRepository.GetAll().OrderByDescending(s => s.StartedOn).FirstOrDefaultAsync();
                if (prevStartup != null) 
                {
                    var prevAssemblies = await _assemblyRepository.GetAll().Where(a => a.ApplicationStartup == prevStartup).OrderByDescending(s => s.FileName).ToListAsync();
                    result = MapStartupToDto(prevStartup, prevAssemblies);
                }

                await uow.CompleteAsync();
            }
            return result;
        }

        public bool AssemblyStaysUnchanged(Assembly assembly)
        {
            var fileName = Path.GetFileName(assembly.Location);

            return _unchangedAssemblies.Any(a => a.FileName == fileName);
        }
    }
}
