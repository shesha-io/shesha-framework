using Abp.Authorization;
using Abp.Domain.Repositories;
using Abp.Localization;
using Microsoft.AspNetCore.Mvc;
using Shesha.Authorization;
using Shesha.AutoMapper.Dto;
using Shesha.Domain;
using Shesha.Permissions.Dtos;
using Shesha.Roles.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Permissions
{
    [AbpAuthorize()]
    public class PermissionAppService : SheshaAppServiceBase
    {
        private readonly IRepository<PermissionDefinition, Guid> _permissionDefinitionRepository;
        private readonly ILocalizationContext _localizationContext;
        private IPermissionDefinitionContext _defenitionContext => PermissionManager as IPermissionDefinitionContext;
        private IShaPermissionManager _shaPermissionManager => PermissionManager as IShaPermissionManager;
        private readonly IShaPermissionChecker _permissionChecker;

        private const string emptyId = "_";

        public PermissionAppService(
            IRepository<PermissionDefinition, Guid> permissionDefinitionRepository,
            ILocalizationContext localizationContext,
            IShaPermissionChecker permissionChecker
            )
        {
            _permissionDefinitionRepository = permissionDefinitionRepository;
            _localizationContext = localizationContext;
            _permissionChecker = permissionChecker;
        }

        public Task<PermissionDto> GetAsync(string id)
        {
            if (string.IsNullOrEmpty(id))
                return Task.FromResult<PermissionDto>(null);

            var dto = ObjectMapper.Map<PermissionDto>(PermissionManager.GetPermission(id));
            return Task.FromResult(dto);
        }

        public Task<List<PermissionDto>> GetAllAsync()
        {
            var permissions = PermissionManager.GetAllPermissions();

            var dtos = ObjectMapper.Map<List<PermissionDto>>(permissions)
                .Select(x => 
                {
                    x.Child = null;
                    return x;
                }).OrderBy(p => p.DisplayName).ToList();

            return Task.FromResult(dtos);
        }

        public Task<List<PermissionDto>> GetAllTreeAsync()
        {
            var permissions = PermissionManager.GetAllPermissions();

            var dtoList = ObjectMapper.Map<List<PermissionDto>>(permissions).OrderBy(p => p.DisplayName).ToList();

            var tree =new List<PermissionDto>();
            tree.AddRange(dtoList.Where(x => string.IsNullOrEmpty(x.ParentName)));
            tree.ForEach(x => dtoList.Remove(x));

            foreach (var permissionDto in tree.ToList())
            {
                AddChild(permissionDto, dtoList);
            }

            tree.AddRange(dtoList);

            return Task.FromResult(tree);
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
            return ObjectMapper.Map<PermissionDto>(await _shaPermissionManager.CreatePermissionAsync(permission));
        }

        [HttpPut, HttpPost] // ToDo: temporary - Allow HttpPost because permission can be created from edit mode
        public async Task<PermissionDto> UpdateAsync(PermissionDto permission)
        {
            if (permission?.Id == emptyId)
            {
                permission.Id = null;
                return await CreateAsync(permission);
            }

            return ObjectMapper.Map<PermissionDto>(await _shaPermissionManager.EditPermissionAsync(permission));
        }

        [HttpPut] 
        public async Task UpdateParentAsync(PermissionDto permission)
        {
            await _shaPermissionManager.UpdateParentAsync(permission.Name, permission.ParentName);
        }

        [HttpDelete]
        public async Task DeleteAsync(string name)
        {
            await _shaPermissionManager.DeletePermissionAsync(name);
        }

        [HttpGet]
        public Task<List<AutocompleteItemDto>> AutocompleteAsync(string term)
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
        [AbpAuthorize()]
        public async Task<bool> IsPermissionGranted(IsPermissionGrantedInput input) 
        {
            return await _permissionChecker.IsGrantedAsync(input.PermissionName);
        }
    }
}