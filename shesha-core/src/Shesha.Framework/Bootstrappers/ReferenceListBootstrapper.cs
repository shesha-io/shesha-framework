using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Reflection;
using NHibernate.Linq;
using Shesha.ConfigurationItems;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.Domain.ConfigurationItems;
using Shesha.Extensions;
using Shesha.Reflection;
using Shesha.Utilities;

namespace Shesha.Bootstrappers
{
    public class ReferenceListBootstrapper: IBootstrapper, ITransientDependency
    {
        private readonly ITypeFinder _typeFinder;
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly IRepository<ReferenceList, Guid> _listRepo;
        private readonly IRepository<ReferenceListItem, Guid> _listItemRepo;
        private readonly IRepository<ConfigurationItem, Guid> _configItemRepository;
        private readonly IModuleManager _moduleManager;

        public ReferenceListBootstrapper(
            ITypeFinder typeFinder, 
            IUnitOfWorkManager unitOfWorkManager, 
            IRepository<ReferenceList, Guid> listRepo, 
            IRepository<ReferenceListItem, Guid> listItemRepo, 
            IRepository<ConfigurationItem, Guid> configItemRepository,
            IModuleManager moduleManager
        )
        {
            _typeFinder = typeFinder;
            _unitOfWorkManager = unitOfWorkManager;
            _listRepo = listRepo;
            _listItemRepo = listItemRepo;
            _configItemRepository = configItemRepository;
            _moduleManager = moduleManager;
        }

        public async Task Process()
        {
            using (_unitOfWorkManager.Current.DisableFilter(AbpDataFilters.SoftDelete))
            {
                await DoProcess();
            }
        }

        private async Task DoProcess()
        {
            var assembliesWithLists = _typeFinder
                .Find(type => type != null && type.IsPublic && type.IsEnum && type.HasAttribute<ReferenceListAttribute>())
                .Select(e => new
                {
                    Enum = e,
                    Attribute = e.GetAttribute<ReferenceListAttribute>(),
                    Assembly = e.Assembly
                })
                .GroupBy(e => e.Assembly, (assembly, lists) => new 
                { 
                    Assembly = assembly,
                    Lists = lists
                })
                .ToList();

            if (!assembliesWithLists.Any())
                return;

            foreach (var assemblyWithList in assembliesWithLists)
            {
                var module = await _moduleManager.GetOrCreateModuleAsync(assemblyWithList.Assembly);

                foreach (var list in assemblyWithList.Lists) 
                {
                    try
                    {
                        var listInCode = new List<ListItemInfo>();
                        var values = Enum.GetValues(list.Enum);
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

                            listInCode.Add(new ListItemInfo
                            {
                                Name = displayAttribute != null
                                    ? displayAttribute.Name
                                    : internalName.ToFriendlyName(),
                                Description = descriptionAttribute != null
                                    ? descriptionAttribute.Description
                                    : displayAttribute?.GetDescription(),
                                Value = intValue,
                                OrderIndex = displayAttribute?.GetOrder() ?? intValue
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
                                .Where(l => l.Configuration.Name == list.Attribute.FullName)
                                .OrderBy(l => l.Configuration.Module == null ? 0 : 1)
                                .ThenBy(l => !l.Configuration.IsDeleted ? 0 : 1)
                                .FirstOrDefaultAsync()
                            : await _listRepo.GetAll()
                                .Where(l => l.Configuration.Name == list.Attribute.FullName &&
                                    l.Configuration.Module == listModule)
                                .OrderBy(l => !l.Configuration.IsDeleted ? 0 : 1)
                            .FirstOrDefaultAsync();
                        if (listInDb == null)
                        {
                            listInDb = new ReferenceList()
                            {
                                Namespace = list.Attribute.GetNamespace(),
                            };
                            listInDb.SetHardLinkToApplication(true);

                            // ToDo: AS - Get Module, Description and Suppress
                            listInDb.Configuration.Module = module;
                            listInDb.Configuration.Name = list.Attribute.FullName;
                            
                            listInDb.Configuration.Label = list.Enum.GetDisplayName();
                            listInDb.Configuration.Description = list.Enum.GetDescription();
                            listInDb.Configuration.Suppress = false;

                            // ToDo: Temporary
                            listInDb.Configuration.VersionNo = 1;
                            listInDb.Configuration.VersionStatus = ConfigurationItemVersionStatus.Live;

                            listInDb.Normalize();

                            await _configItemRepository.InsertAsync(listInDb.Configuration);
                            await _listRepo.InsertAsync(listInDb);
                        }
                        else {
                            // update list if required
                            if (module != null && listInDb.Configuration.Module != module || !listInDb.HardLinkToApplication)
                            {
                                listInDb.Configuration.Module = listModule;
                                listInDb.SetHardLinkToApplication(true);

                                await _listRepo.UpdateAsync(listInDb);
                                await _configItemRepository.UpdateAsync(listInDb.Configuration);
                            }
                        }

                        var itemsInDb = await _listItemRepo.GetAll()
                            .Where(i => i.ReferenceList == listInDb)
                            .ToListAsync();

                        var toAdd = listInCode.Where(i => !itemsInDb.Any(iv => iv.ItemValue == i.Value)).ToList();

                        foreach (var item in toAdd)
                        {
                            var newItem = new ReferenceListItem()
                            {
                                ItemValue = item.Value,
                                Item = item.Name,
                                Description = item.Description,
                                OrderIndex = item.OrderIndex,
                                ReferenceList = listInDb
                            };
                            newItem.SetHardLinkToApplication(true);

                            await _listItemRepo.InsertOrUpdateAsync(newItem);
                        }

                        var toInactivate = itemsInDb.Where(ldb => ldb.HardLinkToApplication && !listInCode.Any(i => i.Value == ldb.ItemValue)).ToList();
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
                        foreach (var item in toUpdate)
                        {
                            item.ItemInDB.Item = item.UpdatedItemInCode.Name;
                            item.ItemInDB.SetHardLinkToApplication(true);
                            await _listItemRepo.InsertOrUpdateAsync(item.ItemInDB);
                        }

                        await _listRepo.InsertOrUpdateAsync(listInDb);

                        await _unitOfWorkManager.Current.SaveChangesAsync();
                    }
                    catch (Exception e)
                    {
                        throw new Exception($"An error occured during bootstrapping of the referenceList {list.Attribute.FullName}", e);
                    }
                }
            }
        }

        private class ListItemInfo
        {
            public string Name { get; set; }
            public string Description { get; set; }
            public Int64 Value { get; set; }
            public Int64 OrderIndex { get; set; }
        }
    }
}