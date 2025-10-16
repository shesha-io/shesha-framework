using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Reflection;
using Castle.Core.Logging;
using Shesha.Attributes;
using Shesha.ConfigurationItems;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.Extensions;
using Shesha.Reflection;
using Shesha.Startup;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace Shesha.Bootstrappers
{
    [DependsOnTypes(typeof(ConfigurableModuleBootstrapper))]
    public class ReferenceListBootstrapper : BootstrapperBase, ITransientDependency
    {
        private readonly ITypeFinder _typeFinder;
        private readonly IRepository<ReferenceList, Guid> _listRepo;
        private readonly IRepository<ReferenceListItem, Guid> _listItemRepo;
        private readonly IModuleManager _moduleManager;

        public ReferenceListBootstrapper(
            ITypeFinder typeFinder,
            IUnitOfWorkManager unitOfWorkManager,
            IRepository<ReferenceList, Guid> listRepo,
            IRepository<ReferenceListItem, Guid> listItemRepo,
            IModuleManager moduleManager,
            IApplicationStartupSession startupSession,
            IBootstrapperStartupService bootstrapperStartupService,
            ILogger logger
        ) : base(unitOfWorkManager, startupSession, bootstrapperStartupService, logger)
        {
            _typeFinder = typeFinder;
            _listRepo = listRepo;
            _listItemRepo = listItemRepo;
            _moduleManager = moduleManager;
        }

        [UnitOfWork(IsDisabled = true)]
        protected override async Task ProcessInternalAsync()
        {
            LogInfo("Bootstrap reference lists");

            var grouppedLists = _typeFinder
                .Find(type => type != null && type.IsPublic && type.IsEnum && type.HasAttribute<ReferenceListAttribute>())
                .Select(e => new RefListType(e.Assembly, e, e.GetAttribute<ReferenceListAttribute>()))
                .GroupBy(e => e.Assembly, (assembly, lists) => new
                {
                    Assembly = assembly,
                    Lists = lists.ToList()
                })
                .ToList();

            if (!grouppedLists.Any())
            {
                LogInfo($"Reference lists to bootstrap not found");
                return;
            }

            var all = grouppedLists.Count();
            LogInfo($"Found {all} assemblies to bootstrap");
            if (!ForceUpdate)
            {
                grouppedLists = grouppedLists.Where(x => !StartupSession.AssemblyStaysUnchanged(x.Assembly)).ToList();
                LogInfo($"{all - grouppedLists.Count()} assemblies skipped as unchanged");
            }

            foreach (var group in grouppedLists)
            {
                using (var unitOfWork = UnitOfWorkManager.Begin())
                {
                    using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.SoftDelete))
                    {
                        await ProcessAssemblyAsync(group.Assembly, group.Lists);
                    }
                    await unitOfWork.CompleteAsync();
                }
            }

            LogInfo("Bootstrap reference lists finished successfully");
        }

        private async Task ProcessAssemblyAsync(Assembly assembly, List<RefListType> lists)
        {
            LogInfo($"Bootstrap assembly {assembly.FullName}");

            var module = await _moduleManager.GetOrCreateModuleAsync(assembly);
            if (module == null)
                return;

            var listNo = 1;
            foreach (var list in lists)
            {
                LogInfo($"process list {listNo}/{lists.Count()}: '{list.Enum.FullName}'");

                try
                {
                    await ProcessListAsync(module, list);

                    LogInfo($"process list {listNo++}/{lists.Count()}: '{list.Enum.FullName}' - finished");
                }
                catch (Exception e)
                {
                    throw new Exception($"An error occured during bootstrapping of the referenceList {list.Attribute.FullName}", e);
                }
            }

            LogInfo($"Bootstrap assembly {assembly.FullName} - finished");
        }

        private async Task ProcessListAsync(Domain.Module module, RefListType list) 
        {
            var listInCode = new List<ListItemInfo>();
            var values = Enum.GetValues(list.Enum);

            LogInfo($"  number of items in code: {values.Length}");

            foreach (var value in values)
            {
                var intValue = Convert.ToInt64(value);
                var internalName = Enum.GetName(list.Enum, intValue) ?? throw new Exception($"Value '{intValue}' not found in enum '{list.Enum.FullName}'");
                var memberInfo = list.Enum.GetMember(internalName).Single();

                var displayAttribute = memberInfo.GetAttributeOrNull<DisplayAttribute>();
                var descriptionAttribute = memberInfo.GetAttributeOrNull<DescriptionAttribute>();

                if (displayAttribute != null && displayAttribute.GetAutoGenerateField() == false)
                    continue;

                var refListItemAttribute = memberInfo.GetAttributeOrNull<ReferenceListItemAttribute>();

                listInCode.Add(new ListItemInfo
                {
                    Name = displayAttribute != null
                        ? displayAttribute.Name
                        : internalName.ToFriendlyName(),
                    Description = descriptionAttribute != null
                        ? descriptionAttribute.Description
                        : displayAttribute?.GetDescription(),
                    Value = intValue,
                    OrderIndex = displayAttribute?.GetOrder() ?? intValue,
                    Color = refListItemAttribute?.Color,
                });
            }

            var refListId = list.Attribute.GetReferenceListIdentifier(list.Enum);

            var moduleName = refListId.Module != null
                ? refListId.Module
                : list.Enum.GetConfigurableModuleName();

            var listModule = !string.IsNullOrWhiteSpace(moduleName)
                ? await _moduleManager.GetOrCreateModuleAsync(moduleName)
                : module;

            var listInDb = await _listRepo.GetAll()
                .Where(l => l.Name == list.Attribute.FullName && l.Module == listModule)
                .OrderBy(l => !l.IsDeleted ? 0 : 1)
                .FirstOrDefaultAsync();

            if (listInDb == null)
            {
                LogInfo($"  list in the DB: not found");

                listInDb = new ReferenceList() { 
                    Module = module,
                    Name = list.Attribute.FullName,
                };

                listInDb.Namespace = list.Attribute.GetNamespace();
                listInDb.SetHardLinkToApplication(true);
                listInDb.Label = list.Enum.GetDisplayName();
                listInDb.Description = list.Enum.GetDescription();

                listInDb.Suppress = false;

                listInDb.Normalize();

                await _listRepo.InsertAsync(listInDb);
                //await _unitOfWorkManager.Current.SaveChangesAsync();
            }
            else
            {
                LogInfo($"  list in the DB: found");

                // update list if required
                if (module != null && listInDb.Module != module || !listInDb.HardLinkToApplication)
                {
                    listInDb.Module = listModule;
                    listInDb.SetHardLinkToApplication(true);

                    await _listRepo.UpdateAsync(listInDb);
                }
            }

            var itemsInDb = await _listItemRepo.GetAll()
                .Where(i => i.ReferenceList == listInDb)
                .ToListAsync();

            LogInfo($"  items in the DB: {itemsInDb.Count()}");

            var toAdd = listInCode.Where(i => !itemsInDb.Any(iv => iv.ItemValue == i.Value)).ToList();

            LogInfo($"  items to add: {toAdd.Count()}");

            foreach (var item in toAdd)
            {
                var newItem = new ReferenceListItem()
                {
                    ItemValue = item.Value,
                    Item = item.Name ?? string.Empty,
                    Description = item.Description ?? string.Empty,
                    OrderIndex = item.OrderIndex,
                    ReferenceList = listInDb,
                    Color = item.Color ?? string.Empty,
                };
                newItem.SetHardLinkToApplication(true);

                await _listItemRepo.InsertAsync(newItem);
            }

            var toInactivate = itemsInDb.Where(ldb => ldb.HardLinkToApplication && !listInCode.Any(i => i.Value == ldb.ItemValue)).ToList();
            LogInfo($"  items to delete: {toInactivate.Count()}");

            foreach (var item in toInactivate)
            {
                await _listItemRepo.DeleteAsync(item);
            }

            var toUpdate = itemsInDb.Select(idb =>
            {
                var updatedItemInCode = listInCode.FirstOrDefault(i => i.Value == idb.ItemValue && (i.Name != idb.Item || !idb.HardLinkToApplication));
                return updatedItemInCode != null
                ? new
                {
                    ItemInDB = idb,
                    UpdatedItemInCode = updatedItemInCode
                }
                : null;
            })
                .WhereNotNull()
                .ToList();
            LogInfo($"  items to update: {toUpdate.Count()}");

            foreach (var item in toUpdate)
            {
                item.ItemInDB.Item = item.UpdatedItemInCode.Name ?? string.Empty;
                item.ItemInDB.SetHardLinkToApplication(true);

                await _listItemRepo.UpdateAsync(item.ItemInDB);
            }

            await _listRepo.InsertOrUpdateAsync(listInDb);

            await UnitOfWorkManager.Current.SaveChangesAsync();
        }

        private class RefListType
        {
            public Assembly Assembly { get; set; }
            public Type Enum { get; set; }
            public ReferenceListAttribute Attribute { get; set; }

            public RefListType(Assembly assembly, Type @enum, ReferenceListAttribute attribute)
            {
                Assembly = assembly;
                Enum = @enum;
                Attribute = attribute;
            }
        }

        private class ListItemInfo
        {
            public string? Name { get; set; }
            public string? Description { get; set; }
            public Int64 Value { get; set; }
            public Int64 OrderIndex { get; set; }
            public string? Color { get; set; }
        }
    }
}