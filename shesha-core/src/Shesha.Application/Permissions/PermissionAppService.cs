using Abp.Collections.Extensions;
using Abp.Domain.Repositories;
using Abp.Localization;
using Microsoft.AspNetCore.Mvc;
using Shesha.Authorization;
using Shesha.AutoMapper.Dto;
using Shesha.Domain;
using Shesha.Extensions;
using Shesha.Permissions.Dtos;
using Shesha.Reflection;
using Shesha.Roles.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Permissions
{
    [SheshaAuthorize(Domain.Enums.RefListPermissionedAccess.AnyAuthenticated)]
    public class PermissionAppService : SheshaAppServiceBase
    {
        private readonly IRepository<Module, Guid> _moduleRepository;
        private readonly ILocalizationContext _localizationContext;
        private IShaPermissionManager _shaPermissionManager => PermissionManager.ForceCastAs<IShaPermissionManager>();
        private readonly IShaPermissionChecker _permissionChecker;

        private const string emptyId = "_";

        public PermissionAppService(
            IRepository<Module, Guid> moduleRepository,
            ILocalizationContext localizationContext,
            IShaPermissionChecker permissionChecker
            )
        {
            _moduleRepository = moduleRepository;
            _localizationContext = localizationContext;
            _permissionChecker = permissionChecker;
        }

        public async Task<PermissionDto?> GetAsync(string id)
        {
            if (string.IsNullOrEmpty(id))
                throw new ArgumentNullException(nameof(id));

            var dto = ObjectMapper.Map<PermissionDto>(PermissionManager.GetPermission(id));
            dto.Module = dto.ModuleId != null 
                ? new EntityReferenceDto<Guid>(await _moduleRepository.GetAsync(dto.ModuleId.Value)) 
                : null;
            return dto;
        }

        public async Task<List<PermissionDto>> GetAllAsync()
        {
            var permissions = PermissionManager.GetAllPermissions();

            var dtos = ObjectMapper.Map<List<PermissionDto>>(permissions);
            var finalDtos = (await dtos.SelectAsync(async x => 
                {
                    x.Child = null;
                    // TODO: Alex why should we fetch module for each permission?
                    x.Module = x.ModuleId != null
                        ? new EntityReferenceDto<Guid>(await _moduleRepository.GetAsync(x.ModuleId.Value))
                        : null;
                    return x;
                }))
                .OrderBy(p => p.DisplayName)
                .ToList();

            return finalDtos;
        }

        public async Task<List<PermissionDto>> GetAllTreeAsync()
        {
            var permissions = PermissionManager.GetAllPermissions();

            var dtos = ObjectMapper.Map<List<PermissionDto>>(permissions);
            var dtoList = (await dtos
                .SelectAsync(async x =>
                {
                    x.Module = x.ModuleId != null
                        ? new EntityReferenceDto<Guid>(await _moduleRepository.GetAsync(x.ModuleId.Value))
                        : null;
                    return x;
                }))
                .OrderBy(p => p.DisplayName).ToList();

            var tree = new List<PermissionDto>();
            tree.AddRange(dtoList.Where(x => string.IsNullOrEmpty(x.ParentName)));
            tree.ForEach(x => dtoList.Remove(x));

            foreach (var permissionDto in tree.ToList())
            {
                AddChild(permissionDto, dtoList);
            }

            tree.AddRange(dtoList);

            return tree;
        }

        private void AddChild(PermissionDto perm, List<PermissionDto> list)
        {
            var child = list.Where(x => x.ParentName == perm.Name).ToList();
            perm.Child = child;
            child.ForEach(x =>
            {
                x.Parent = null;
                list.Remove(x);
                AddChild(x, list);
            });
        }

        [HttpPost]
        public async Task<PermissionDto> CreateAsync(PermissionDto permission)
        {
            var dbp = new PermissionDefinition()
            {
                Name = permission.Name,
                Module = permission.Module != null ? await _moduleRepository.GetAsync(permission.Module.Id) : null,
            };
            
            dbp.Parent = permission.ParentName ?? permission.Parent?.Name;
            dbp.Label = permission.DisplayName;
            dbp.Description = permission.Description;

            var res = await _shaPermissionManager.CreatePermissionAsync(dbp);

            return ObjectMapper.Map<PermissionDto>(res);
        }

        [HttpPut, HttpPost]
        public async Task<PermissionDto> UpdateAsync(PermissionDto permission)
        {
            if (permission.Id == emptyId)
            {
                permission.Id = null;
                return await CreateAsync(permission);
            }

            var dbp = new PermissionDefinition()
            {
                Name = permission.Name,
                Module = permission.Module != null ? await _moduleRepository.GetAsync(permission.Module.Id) : null,
            };
            dbp.Label = permission.DisplayName;
            dbp.Description = permission.Description;
            dbp.Parent = permission.ParentName ?? permission.Parent?.Name;

            var res = await _shaPermissionManager.EditPermissionAsync(permission.Id.NotNull(), dbp);

            return ObjectMapper.Map<PermissionDto>(res);
        }

        [HttpPut] 
        public async Task UpdateParentAsync(PermissionDto permission)
        {
            var module = permission.Module != null ? await _moduleRepository.GetAsync(permission.Module.Id) : null;
            await _shaPermissionManager.UpdateParentAsync(permission.Name, permission.ParentName, module);
        }

        [HttpDelete]
        public Task DeleteAsync(string name)
        {
            return _shaPermissionManager.DeletePermissionAsync(name);
        }

        [HttpGet]
        public Task<List<AutocompleteItemDto>> AutocompleteAsync(string? term)
        {
            term = (term ?? "").ToLower();
            
            var permissions = PermissionManager.GetAllPermissions()
                .Where(p => (p.Name ?? "").ToLower().Contains(term)
                            || (p.Description?.Localize(_localizationContext) ?? "").ToLower().Contains(term)
                            || (p.DisplayName?.Localize(_localizationContext) ?? "").ToLower().Contains(term)
                            )
                .OrderBy(p => p.Name)
                .Take(10)
                .Select(p => new AutocompleteItemDto
                {
                    DisplayText = $"{p.DisplayName.Localize(_localizationContext)} ({p.Name})",
                    Value = p.Name
                })
                .ToList();

            return Task.FromResult(permissions);
        }

        /// <summary>
        /// Checks if current user is granted for a permission.
        /// </summary>
        [HttpGet]
        [SheshaAuthorize(Domain.Enums.RefListPermissionedAccess.AnyAuthenticated)]
        public Task<bool> IsPermissionGrantedAsync(IsPermissionGrantedInput input) 
        {
            if (input.PermissionedEntityId.IsNullOrEmpty() || input.PermissionedEntityClass.IsNullOrEmpty())
                return _permissionChecker.IsGrantedAsync(input.PermissionName);

            return _permissionChecker.IsGrantedAsync(
                input.PermissionName,
                new EntityReferenceDto<string>(input.PermissionedEntityId, "", input.PermissionedEntityClass)
            );
        }
    }
}