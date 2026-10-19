using Abp.Reflection;
using Microsoft.AspNetCore.Mvc;
using Shesha;
using Shesha.Configuration.Runtime;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Excel;
using Shesha.JsonEntities;
using Shesha.Reflection;
using Shesha.Utilities;

namespace Boxfusion.SheshaFunctionalTests.Common.Application.Services
{
    public class AccessMatrixAppService: SheshaAppServiceBase
    {
        private readonly IAssemblyFinder _assembleFinder;
        private readonly IExcelUtility _excelUtility;
        private readonly IEntityTypeConfigurationStore _entityConfigurationStore;

        public AccessMatrixAppService(IAssemblyFinder assembleFinder, IExcelUtility excelUtility, IEntityTypeConfigurationStore entityConfigurationStore)
        {
            _assembleFinder = assembleFinder;
            _excelUtility = excelUtility;
            _entityConfigurationStore = entityConfigurationStore;
        }

        public async Task<FileStreamResult> GetAsync() 
        {
            var assemblies = _assembleFinder.GetAllAssemblies()
                .Distinct(new AssemblyFullNameComparer())
                .Where(a => !a.IsDynamic
                            && a.GetTypes().Any(t => MappingHelper.IsEntity(t) || MappingHelper.IsJsonEntity(t) && t != typeof(JsonEntity))
                )
                .ToList();

            var rows = new List<MatrixRow>();

            foreach (var assembly in assemblies) 
            {
                var entityTypes = assembly.GetTypes().Where(t => MappingHelper.IsEntity(t) || MappingHelper.IsJsonEntity(t) && t != typeof(JsonEntity)).ToList();
                foreach (var entityType in entityTypes) 
                {
                    var config = _entityConfigurationStore.Get(entityType);
                    var crudConfig = EntityCrudHelper.GetHardcodedEntityCrudConfig(entityType);

                    var row = new MatrixRow
                    {
                        Module = entityType.GetConfigurableModuleName(),
                        Name = entityType.Name,
                        FriendlyName = config.FriendlyName,
                        IsConfigurable = crudConfig.IsConfigurable,
                        DefaultCrudAccess = crudConfig.CrudActionsAccess,
                        DefaultPermissions = crudConfig.CrudActionsPermissions?.Delimited(",") ?? "",
                    };

                    if (!EntityCrudHelper.IsCrudActionDisabledByCode(entityType, CrudAction.Create)) 
                    {
                        var create = EntityCrudHelper.GetCodebasedCrudActionConfig(entityType, CrudAction.Create);
                        row.CreateEnabled = true;
                        row.CreateAccess = create?.CrudActionsAccess;
                        row.CreatePermissions = create?.CrudActionsPermissions?.Delimited(",") ?? "";
                    }

                    if (!EntityCrudHelper.IsCrudActionDisabledByCode(entityType, CrudAction.Read)) 
                    {
                        var read = EntityCrudHelper.GetCodebasedCrudActionConfig(entityType, CrudAction.Read);
                        row.ReadEnabled = true;
                        row.ReadAccess = read?.CrudActionsAccess;
                        row.ReadPermissions = read?.CrudActionsPermissions?.Delimited(",") ?? "";
                    }

                    if (!EntityCrudHelper.IsCrudActionDisabledByCode(entityType, CrudAction.Update)) 
                    {
                        var update = EntityCrudHelper.GetCodebasedCrudActionConfig(entityType, CrudAction.Update);
                        row.UpdateEnabled = true;
                        row.UpdateAccess = update?.CrudActionsAccess;
                        row.UpdatePermissions = update?.CrudActionsPermissions?.Delimited(",") ?? "";
                    }

                    if (!EntityCrudHelper.IsCrudActionDisabledByCode(entityType, CrudAction.Delete)) 
                    {
                        var delete = EntityCrudHelper.GetCodebasedCrudActionConfig(entityType, CrudAction.Delete);
                        row.DeleteEnabled = true;
                        row.DeleteAccess = delete?.CrudActionsAccess;
                        row.DeletePermissions = delete?.CrudActionsPermissions?.Delimited(",") ?? "";
                    }

                    rows.Add(row);
                }
            }
            rows = rows.OrderBy(e => e.Module).ThenBy(e => e.Name).ToList();

            var rowsDict = rows.Select(e => new Dictionary<string, object?> { 
                { "module", e.Module }, 
                { "name", e.Name }, 
                { "friendlyName", e.FriendlyName }, 
                { "isConfigurable", e.IsConfigurable },
                { "defaultCrudAccess", e.DefaultCrudAccess },
                { "defaultPermissions", e.DefaultPermissions },
                { "createEnabled", e.CreateEnabled },
                { "createAccess", e.CreateAccess },
                { "createPermissions", e.CreatePermissions },
                { "readEnabled", e.ReadEnabled },
                { "readAccess", e.ReadAccess },
                { "readPermissions", e.ReadPermissions },
                { "updateEnabled", e.UpdateEnabled },
                { "updateAccess", e.UpdateAccess },
                { "updatePermissions", e.UpdatePermissions },
                { "deleteEnabled", e.DeleteEnabled },
                { "deleteAccess", e.DeleteAccess },
                { "deletePermissions", e.DeletePermissions },
            })
                .ToList();

            var columns = new string[] {
                    "module",
                    "name",
                    "friendlyName",
                    "isConfigurable",
                    "defaultCrudAccess",
                    "defaultPermissions",
                    "createEnabled",
                    "createAccess",
                    "createPermissions",
                    "readEnabled",
                    "readAccess",
                    "readPermissions",
                    "updateEnabled",
                    "updateAccess",
                    "updatePermissions",
                    "deleteEnabled",
                    "deleteAccess",
                    "deletePermissions"
                }
                .Select(e => new ExcelColumn { PropertyName = e, Label = e.ToFriendlyName() })
                .ToList();

#pragma warning disable IDISP001 // Dispose created. Note: this stream will be disposed by FileStreamResult
            var stream = await _excelUtility.ReadToExcelStreamAsync(typeof(MatrixRow), rowsDict, columns, "Sheet1");
#pragma warning restore IDISP001 // Dispose created
            stream.Seek(0, SeekOrigin.Begin);
            return new FileStreamResult(stream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
                FileDownloadName = "AccessMatrix.xlsx"
            };
        }

        public class MatrixRow 
        {
            public string? Module { get; set; }
            public string Name { get; set; }
            public string FriendlyName { get; set; }
            public bool IsConfigurable { get; set; }

            public CrudActionsAccess DefaultCrudAccess { get; set; }
            public string DefaultPermissions { get; set; }

            public bool CreateEnabled { get; set; }
            public CrudActionsAccess? CreateAccess { get; set; }
            public string CreatePermissions { get; set; }
            public bool ReadEnabled { get; set; }
            public CrudActionsAccess? ReadAccess { get; set; }
            public string ReadPermissions { get; set; }
            public bool UpdateEnabled { get; set; }
            public CrudActionsAccess? UpdateAccess { get; set; }
            public string UpdatePermissions { get; set; }
            public bool DeleteEnabled { get; set; }
            public CrudActionsAccess? DeleteAccess { get; set; }
            public string DeletePermissions { get; set; }
        }
    }
}
