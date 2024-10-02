using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Reflection;
using Castle.Core.Logging;
using Shesha.ConfigurationItems;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.Domain.ConfigurationItems;
using Shesha.Extensions;
using Shesha.Reflection;
using Shesha.Services;
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
    [DependsOnBootstrapper(typeof(ConfigurableModuleBootstrapper))]
    public class ReferenceListBootstrapper : IBootstrapper, ITransientDependency
    {
        private readonly ITypeFinder _typeFinder;
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly IRepository<ReferenceList, Guid> _listRepo;
        private readonly IRepository<ReferenceListItem, Guid> _listItemRepo;
        private readonly IModuleManager _moduleManager;
        private readonly IApplicationStartupSession _startupSession;


        public ILogger Logger { get; set; } = NullLogger.Instance;

        public ReferenceListBootstrapper(
            ITypeFinder typeFinder,
            IUnitOfWorkManager unitOfWorkManager,
            IRepository<ReferenceList, Guid> listRepo,
            IRepository<ReferenceListItem, Guid> listItemRepo,
            IModuleManager moduleManager,
            IApplicationStartupSession startupSession
        )
        {
            _typeFinder = typeFinder;
            _unitOfWorkManager = unitOfWorkManager;
            _listRepo = listRepo;
            _listItemRepo = listItemRepo;
            _moduleManager = moduleManager;
            _startupSession = startupSession;
        }

        [UnitOfWork(IsDisabled = true)]
        public async Task ProcessAsync()
        {
            Logger.Warn("Bootstrap reference lists");

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
                Logger.Warn($"Reference lists to bootstrap not found");
                return;
            }

            var all = grouppedLists.Count();
            Logger.Warn($"Found {all} assemblies to bootstrap");
            grouppedLists = grouppedLists.Where(x => !_startupSession.AssemblyStaysUnchanged(x.Assembly)).ToList();
            Logger.Warn($"{all - grouppedLists.Count()} assemblies skipped as unchanged");

            foreach (var group in grouppedLists) 
            {
                using (var unitOfWork = _unitOfWorkManager.Begin())
                {
                    using (_unitOfWorkManager.Current.DisableFilter(AbpDataFilters.SoftDelete))
                    {
                        await ProcessAssemblyAsync(group.Assembly, group.Lists);
                    }
                    await unitOfWork.CompleteAsync();
                }
            }

            Logger.Warn("Bootstrap reference lists finished successfully");
        }

        private async Task ProcessAssemblyAsync(Assembly assembly, List<RefListType> lists) 
        {
            Logger.Warn($"Bootstrap assembly {assembly.FullName}");
            
            var module = await _moduleManager.GetOrCreateModuleAsync(assembly);

            var listNo = 1;
            foreach (var list in lists)
            {
                Logger.Info($"process list {listNo}/{lists.Count()}: '{list.Enum.FullName}'");

                try
                {
                    await ProcessListAsync(module, list);
                    
                    Logger.Info($"process list {listNo++}/{lists.Count()}: '{list.Enum.FullName}' - finished");
                }
                catch (Exception e)
                {
                    throw new Exception($"An error occured during bootstrapping of the referenceList {list.Attribute.FullName}", e);
                }
            }

            Logger.Warn($"Bootstrap assembly {assembly.FullName} - finished");
        }

        private async Task ProcessListAsync(Domain.ConfigurationItems.Module module, RefListType list) 
        {
            var listInCode = new List<ListItemInfo>();
            var values = Enum.GetValues(list.Enum);

            Logger.Info($"  number of items in code: {values.Length}");

            foreach (var value in values)
            {
                var intValue = Convert.ToInt64(value);
                var internalName = Enum.GetName(list.Enum, intValue);
                var memberInfo = list.Enum.GetMember(internalName).FirstOrDefault();

                var displayAttribute = memberInfo != null
                    ? memberInfo.GetAttribute<DisplayAttribute>()
                    : null;

                var descriptionAttribute = memberInfo != null
                    ? memberInfo.GetAttribute<DescriptionAttribute>()
                    : null;

                if (displayAttribute != null && displayAttribute.GetAutoGenerateField() == false)
                    continue;

                var refListItemAttribute = memberInfo.GetAttribute<ReferenceListItemAttribute>();

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

            // note: if the module on the attribute is null - use fallback to 
            var searchByNamespaceOnly = list.Attribute.IsLegacy;
            var refListId = list.Attribute.GetReferenceListIdentifier(list.Enum);

            var listModule = refListId.Module != null
                ? await _moduleManager.GetOrCreateModuleAsync(refListId.Module)
                : module;

            var listInDb = searchByNamespaceOnly
                ? await _listRepo.GetAll()
                    .Where(l => l.Name == list.Attribute.FullName)
                    .OrderBy(l => l.Module == null ? 0 : 1)
                    .ThenBy(l => !l.IsDeleted ? 0 : 1)
                    .FirstOrDefaultAsync()
                : await _listRepo.GetAll()
                    .Where(l => l.Name == list.Attribute.FullName &&
                        l.Module == listModule)
                    .OrderBy(l => !l.IsDeleted ? 0 : 1)
                .FirstOrDefaultAsync();

            if (listInDb == null)
            {
                Logger.Info($"  list in the DB: found");

                listInDb = new ReferenceList()
                {
                    Namespace = list.Attribute.GetNamespace(),
                };
                listInDb.SetHardLinkToApplication(true);

                // ToDo: AS - Get Module, Description and Suppress
                listInDb.Module = module;
                listInDb.Name = list.Attribute.FullName;

                listInDb.Label = list.Enum.GetDisplayName();
                listInDb.Description = list.Enum.GetDescription();
                listInDb.Suppress = false;

                // ToDo: Temporary
                listInDb.VersionNo = 1;
                listInDb.VersionStatus = ConfigurationItemVersionStatus.Live;

                listInDb.Normalize();

                await _listRepo.InsertAsync(listInDb);
            }
            else
            {
                Logger.Info($"  list in the DB: not found");

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

            Logger.Info($"  items in the DB: {itemsInDb.Count()}");

            var toAdd = listInCode.Where(i => !itemsInDb.Any(iv => iv.ItemValue == i.Value)).ToList();

            Logger.Info($"  items to add: {toAdd.Count()}");

            foreach (var item in toAdd)
            {
                var newItem = new ReferenceListItem()
                {
                    ItemValue = item.Value,
                    Item = item.Name,
                    Description = item.Description,
                    OrderIndex = item.OrderIndex,
                    ReferenceList = listInDb,
                    Color = item.Color,
                };
                newItem.SetHardLinkToApplication(true);

                await _listItemRepo.InsertOrUpdateAsync(newItem);
            }

            var toInactivate = itemsInDb.Where(ldb => ldb.HardLinkToApplication && !listInCode.Any(i => i.Value == ldb.ItemValue)).ToList();
            Logger.Info($"  items to delete: {toInactivate.Count()}");

            foreach (var item in toInactivate)
            {
                await _listItemRepo.DeleteAsync(item);
            }

            var toUpdate = itemsInDb.Select(idb => new
            {
                ItemInDB = idb,
                UpdatedItemInCode = listInCode.FirstOrDefault(i => i.Value == idb.ItemValue && (i.Name != idb.Item || !idb.HardLinkToApplication))
            })
                .Where(i => i.UpdatedItemInCode != null)
                .ToList();
            Logger.Info($"  items to update: {toUpdate.Count()}");

            foreach (var item in toUpdate)
            {
                item.ItemInDB.Item = item.UpdatedItemInCode.Name;
                item.ItemInDB.SetHardLinkToApplication(true);
                await _listItemRepo.InsertOrUpdateAsync(item.ItemInDB);
            }

            await _listRepo.InsertOrUpdateAsync(listInDb);

            await _unitOfWorkManager.Current.SaveChangesAsync();
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
            public string Name { get; set; }
            public string Description { get; set; }
            public Int64 Value { get; set; }
            public Int64 OrderIndex { get; set; }
            public string Color { get; set; }
        }
    }
}