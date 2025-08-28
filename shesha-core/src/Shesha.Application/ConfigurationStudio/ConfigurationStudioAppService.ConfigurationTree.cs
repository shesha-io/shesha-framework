using Abp.Domain.Repositories;
using Microsoft.AspNetCore.Mvc;
using Shesha.ConfigurationStudio.Dtos;
using Shesha.Domain;
using Shesha.Extensions;
using Shesha.Reflection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.ConfigurationStudio
{
    /// <summary>
    /// Configuration Studio application service
    /// </summary>
    public partial class ConfigurationStudioAppService: SheshaAppServiceBase
    {
        public IRepository<ConfigurationItemFolder, Guid> FolderRepository { get; set; }
        public IRepository<Module, Guid> ModuleRepository { get; set; }
        public IRepository<ConfigurationItemTreeNode, Guid> TreeNodeRepository { get; set; }
        public IRepository<ConfigurationItemNode, Guid> NodeRepository { get; set; }

        [HttpGet]
        public async Task<List<FlatTreeNode>> GetFlatTreeAsync(long? rootNodeId = null)
        {
            var treeNodes = await TreeNodeRepository.GetAll().OrderBy(e => e.ModuleId).ThenBy(e => e.ParentId).ThenBy(e => e.OrderIndex)
                .Select(e => new FlatTreeNode { 
                    Id = e.Id,
                    ParentId = e.ParentId,
                    ModuleId = e.ModuleId,
                    NodeType = e.NodeType,
                    ItemType = e.ItemType,
                    Name = e.Name,
                    Label = e.Label,

                    IsCodeBased = e.IsCodeBased,
                    IsCodegenPending = e.IsCodegenPending,
                    IsUpdated = e.IsUpdated,
                    IsExposed = e.IsExposed,
                })
                .ToListAsync();
            return treeNodes;
        }

        [HttpPost]
        public async Task<FolderTreeNode> CreateFolderAsync(CreateFolderRequest input)
        {
            var module = await ModuleRepository.GetAsync(input.ModuleId);
            module.EnsureEditable();

            var parentFolder = input.FolderId != null
                ? await FolderRepository.GetAsync(input.FolderId.Value)
                : null;

            var folder = new ConfigurationItemFolder { 
                Module = module,
                Name = input.Name,
                Parent = parentFolder,
            };
            await FolderRepository.InsertAsync(folder);

            await UnitOfWorkManager.Current.SaveChangesAsync();

            return GetFolderTreeNode(folder);
        }

        [HttpDelete]
        public async Task DeleteFolderAsync(DeleteFolderRequest input) 
        {
            var folder = await FolderRepository.GetAsync(input.FolderId);
            folder.Module.EnsureEditable();

            await DeleteFolderRecursiveAsync(folder);
        }

        [HttpPut]
        public async Task RenameFolderAsync(RenameFolderRequest input)
        {
            var folder = await FolderRepository.GetAsync(input.FolderId);
            folder.Module.EnsureEditable();

            folder.Name = input.Name;
            await FolderRepository.InsertAsync(folder);
        }

        private async Task DeleteFolderRecursiveAsync(ConfigurationItemFolder folder) 
        {
            // delete items
            var items = ItemRepo.DeleteAsync(e => e.Folder == folder);

            // process subfolders
            var subFolders = await FolderRepository.GetAll().Where(e => e.Parent == folder).ToListAsync();
            foreach (var subFolder in subFolders) 
            {
                await DeleteFolderRecursiveAsync(subFolder);
            }

            await FolderRepository.DeleteAsync(folder);
        }

        private FolderTreeNode GetFolderTreeNode(ConfigurationItemFolder folder)
        {
            return new FolderTreeNode {
                Id = folder.Id,
                Name = folder.Name,
            };
        }

        private async Task<ConfigurationItemNode> GetNodeAsync(Guid id) 
        {
            return await NodeRepository.GetAll().Where(e => e.Id == id).FirstOrDefaultAsync();
        }

        private async Task<double> GetOrderIndexForInsertAsync(Guid moduleId, Guid? folderId)
        {
            var nodes = await NodeRepository.GetAll().Where(e => e.ModuleId == moduleId && e.FolderId == folderId).OrderBy(e => e.OrderIndex).ToListAsync();
            var firstNode = nodes.FirstOrDefault();
            return firstNode != null
                ? nodes.Count + 1
                : 0;
        }

        private async Task<double> GetOrderIndexForInsertBeforeAsync(Guid moduleId, Guid? folderId, double orderIndex)
        {
            var prevNode = await NodeRepository.GetAll().Where(e => e.ModuleId == moduleId && e.FolderId == folderId && e.OrderIndex < orderIndex).OrderByDescending(e => e.OrderIndex).FirstOrDefaultAsync();
            return prevNode != null
                ? prevNode.OrderIndex + (orderIndex - prevNode.OrderIndex) / 2
                : orderIndex - 10;
        }
        private async Task<double> GetOrderIndexForInsertAfterAsync(Guid moduleId, Guid? folderId, double orderIndex)
        {
            var nextNode = await NodeRepository.GetAll().Where(e => e.ModuleId == moduleId && e.FolderId == folderId && e.OrderIndex > orderIndex).OrderBy(e => e.OrderIndex).FirstOrDefaultAsync();
            return nextNode != null
                ? orderIndex + (nextNode.OrderIndex - orderIndex) / 2
                : orderIndex + 10;
        }

        public async Task MoveNodeToFolderAsync(MoveNodeToFolderRequest input) 
        {
            var newParentFolder = input.FolderId != null
                ? await FolderRepository.GetAsync(input.FolderId.Value)
                : null;

            switch (input.NodeType) 
            {
                case TreeNodeType.Folder:
                    {
                        var folder = await FolderRepository.GetAsync(input.NodeId);

                        await MoveFolderAsync(newParentFolder, folder);

                        // update order index
                        var orderIndex = await GetOrderIndexForInsertAsync(folder.Module.Id, newParentFolder?.Id);
                        folder.OrderIndex = orderIndex;
                        await FolderRepository.UpdateAsync(folder);

                        break;
                    }
                case TreeNodeType.ConfigurationItem:
                    {
                        var item = await ItemRepo.GetAsync(input.NodeId);
                        await MoveConfigurationItemAsync(newParentFolder, item);
                        
                        // update order index
                        var orderIndex = await GetOrderIndexForInsertAsync(item.Module.NotNull().Id, newParentFolder?.Id);
                        item.OrderIndex = orderIndex;
                        await ItemRepo.UpdateAsync(item);

                        break;
                    }
                default: throw new NotSupportedException($"Moving of `{input.NodeType}` nodes is not supported");
            }
        }

        public async Task ReorderNodeAsync(ReorderNodeRequest input) 
        {
            switch (input.NodeType)
            {
                case TreeNodeType.Folder:
                    {
                        var folder = await FolderRepository.GetAsync(input.DragNodeId);

                        var dragNode = await GetNodeAsync(input.DragNodeId).NotNull();
                        var dropNode = await GetNodeAsync(input.DropNodeId).NotNull();

                        var newParentFolder = dropNode.FolderId != null
                            ? await FolderRepository.GetAsync(dropNode.FolderId.Value)
                            : null;

                        switch (input.DropPosition)
                        {
                            case ReorderNodeRequest.DropPositionType.Before:
                                {
                                    var newOrderIndex = await GetOrderIndexForInsertBeforeAsync(dropNode.ModuleId, newParentFolder?.Id, dropNode.OrderIndex);
                                    folder.OrderIndex = newOrderIndex;
                                    folder.Parent = newParentFolder;
                                    await FolderRepository.UpdateAsync(folder);
                                    break;
                                }
                            case ReorderNodeRequest.DropPositionType.After:
                                {
                                    var newOrderIndex = await GetOrderIndexForInsertAfterAsync(dropNode.ModuleId, newParentFolder?.Id, dropNode.OrderIndex);
                                    folder.OrderIndex = newOrderIndex;
                                    folder.Parent = newParentFolder;
                                    await FolderRepository.UpdateAsync(folder);
                                    break;
                                }
                        }

                        break;
                    }
                case TreeNodeType.ConfigurationItem:
                    {
                        var item = await ItemRepo.GetAsync(input.DragNodeId);

                        var dragNode = await GetNodeAsync(input.DragNodeId).NotNull();
                        var dropNode = await GetNodeAsync(input.DropNodeId).NotNull();

                        var newParentFolder = dropNode.FolderId != null
                            ? await FolderRepository.GetAsync(dropNode.FolderId.Value)
                            : null;

                        switch (input.DropPosition)
                        {
                            case ReorderNodeRequest.DropPositionType.Before:
                                {
                                    var newOrderIndex = await GetOrderIndexForInsertBeforeAsync(dropNode.ModuleId, newParentFolder?.Id, dropNode.OrderIndex);
                                    item.OrderIndex = newOrderIndex;
                                    item.Folder = newParentFolder;
                                    await ItemRepo.UpdateAsync(item);
                                    break;
                                }
                            case ReorderNodeRequest.DropPositionType.After:
                                {
                                    var newOrderIndex = await GetOrderIndexForInsertAfterAsync(dropNode.ModuleId, newParentFolder?.Id, dropNode.OrderIndex);
                                    item.OrderIndex = newOrderIndex;
                                    item.Folder = newParentFolder;
                                    await ItemRepo.UpdateAsync(item);
                                    break;
                                }
                        }

                        break;
                    }
                default: throw new NotSupportedException($"Moving of `{input.NodeType}` nodes is not supported");
            }
        }

        private async Task MoveFolderAsync(ConfigurationItemFolder? newParentFolder, ConfigurationItemFolder folder)
        {
            if (newParentFolder != null) 
            {
                if (folder.Module != newParentFolder.Module)
                    throw new ArgumentException("Folder can't be moved between modules");

                var fullChain = newParentFolder.GetFullChain(e => e.Parent);
                if (fullChain.Contains(folder))
                    throw new ArgumentException("Folder can't be moved to a descendant folder");
            } 

            folder.Parent = newParentFolder;
            
            // TODO: update order index

            await FolderRepository.UpdateAsync(folder);
        }

        private async Task MoveConfigurationItemAsync(ConfigurationItemFolder? newParentFolder, ConfigurationItem item)
        {
            if (newParentFolder != null && item.Module != newParentFolder.Module)
                throw new ArgumentException("Item can't be moved between modules");
                
            item.Folder = newParentFolder;
            
            await ItemRepo.UpdateAsync(item);
        }
    }
}
