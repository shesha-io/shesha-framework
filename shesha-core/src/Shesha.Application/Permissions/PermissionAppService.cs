using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Repositories;
using Abp.Localization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NHibernate.Linq;
using NUglify.Helpers;
using Shesha.Authorization;
using Shesha.AutoMapper.Dto;
using Shesha.Domain;
using Shesha.Roles.Dto;

namespace Shesha.Permissions
{
    [AbpAuthorize()]
    public class PermissionAppService : SheshaAppServiceBase
    {
        //private readonly IPermissionDefinitionContext _permissionDefinitionContext;
        private readonly IRepository<PermissionDefinition, Guid> _permissionDefinitionRepository;
        private readonly ILocalizationContext _localizationContext;
        private IPermissionDefinitionContext _defenitionContext => PermissionManager as IPermissionDefinitionContext;
        private IShaPermissionManager _shaPermissionManager => PermissionManager as IShaPermissionManager;

        private const string emptyId = "_";

        public PermissionAppService(
            //IPermissionDefinitionContext permissionDefinitionContext,
            IRepository<PermissionDefinition, Guid> permissionDefinitionRepository,
            ILocalizationContext localizationContext
            )
        {
            //_permissionDefinitionContext = permissionDefinitionContext;
            _permissionDefinitionRepository = permissionDefinitionRepository;
            _localizationContext = localizationContext;
        }

        public async Task<PermissionDto> GetAsync(string id)
        {
            if (string.IsNullOrEmpty(id))
                return null;
            return ObjectMapper.Map<PermissionDto>(PermissionManager.GetPermission(id));
        }

        public async Task<List<PermissionDto>> GetAllAsync()
        {
            var permissions = PermissionManager.GetAllPermissions();

            return ObjectMapper.Map<List<PermissionDto>>(permissions)
                .Select(x => 
                {
                    x.Child = null;
                    return x;
                }).OrderBy(p => p.DisplayName).ToList();
        }

        public async Task<List<PermissionDto>> GetAllTreeAsync()
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
        public async Task<List<AutocompleteItemDto>> AutocompleteAsync(string term)
        {
            term = (term ?? "").ToLower();
            
            var persons = PermissionManager.GetAllPermissions()
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

            return persons;
        }

        private static ILocalizableString L(string name)
        {
            return new LocalizableString(name, SheshaConsts.LocalizationSourceName);
        }
    }
}