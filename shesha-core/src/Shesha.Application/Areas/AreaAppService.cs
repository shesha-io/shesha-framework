using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using Microsoft.AspNetCore.Mvc;
using NHibernate.Linq;
using Shesha.Application.Services.Dto;
using Shesha.Areas.Dto;
using Shesha.AutoMapper.Dto;
using Shesha.Domain;
using Shesha.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Areas
{
    public class AreaAppService : SheshaCrudServiceBase<Area, AreaDto, Guid, FilteredPagedAndSortedResultRequestDto, AreaCreateDto, AreaUpdateDto>
    {
        private readonly IRepository<AreaTreeItem, Guid> _areaTreeItemRepository;
        private readonly IRepository<AreaHierarchyItem, string> _areaHierarchyItemRepository;

        public AreaAppService(IRepository<Area, Guid> repository, IRepository<AreaTreeItem, Guid> areaTreeItemRepository, IRepository<AreaHierarchyItem, string> areaHierarchyItemRepository) : base(repository)
        {
            _areaTreeItemRepository = areaTreeItemRepository;
            _areaHierarchyItemRepository = areaHierarchyItemRepository;
        }

        [HttpGet]
        public async Task<List<AutocompleteItemDto>> Autocomplete(string term, RefListAreaType? areaType, Guid? parentAreaId)
        {
            term = (term ?? "").ToLower();

            if (parentAreaId.HasValue)
            {
                // when parentAreaId is specified - use alternative approach
                var areas = await _areaHierarchyItemRepository.GetAll()
                    .Where(p => (p.Name ?? "").ToLower().Contains(term) && (areaType == null || p.AreaType == areaType) && (parentAreaId == null || p.AncestorId == parentAreaId))
                    .Select(p => p.Area)
                    .OrderBy(p => p.Name)
                    .Take(10)
                    .ToListAsync();

                var result = areas.Select(p => new AutocompleteItemDto
                {
                    DisplayText = p.Name.Trim(),
                    Value = p.Id.ToString()
                }).ToList();

                return result;
            }
            else
            {
                var areas = await Repository.GetAll()
                    .Where(p => (p.Name ?? "").ToLower().Contains(term) && (areaType == null || p.AreaType == areaType) && (parentAreaId == null || p.ParentArea.Id == parentAreaId))
                    .OrderBy(p => p.Name)
                    .Take(10)
                    .Select(p => new AutocompleteItemDto
                    {
                        DisplayText = p.Name.Trim(),
                        Value = p.Id.ToString()
                    })
                    .ToListAsync();

                return areas;
            }
        }

        [HttpGet]
        public async Task<List<AutocompleteItemDto>> CascadeSelect(RefListAreaType? areaType, Guid? parentAreaId)
        {
            if (parentAreaId.HasValue)
            {
                // when parentAreaId is specified - use alternative approach
                var areas = await _areaHierarchyItemRepository.GetAll()
                    .Where(p => (areaType == null || p.AreaType == areaType) && (parentAreaId == null || p.AncestorId == parentAreaId))
                    .Select(p => p.Area)
                    .OrderBy(p => p.Name)
                    .ToListAsync();

                var result = areas.Select(p => new AutocompleteItemDto
                {
                    DisplayText = p.Name.Trim(),
                    Value = p.Id.ToString()
                }).ToList();

                return result;
            }
            else
            {
                var areas = await Repository.GetAll()
                    .Where(p => (areaType == null || p.AreaType == areaType) && (parentAreaId == null || p.ParentArea.Id == parentAreaId))
                    .OrderBy(p => p.Name)
                    .Select(p => new AutocompleteItemDto
                    {
                        DisplayText = p.Name.Trim(),
                        Value = p.Id.ToString()
                    })
                    .ToListAsync();

                return areas;
            }
        }

        public override async Task<AreaDto> UpdateAsync(AreaUpdateDto input)
        {
            var result = await base.UpdateAsync(input);

            return result;
        }

        public override async Task<AreaDto> GetAsync(EntityDto<Guid> input)
        {
            var result = await base.GetAsync(input);
            return result;
        }

        /// <summary>
        /// Returns child areas of the specified parent
        /// </summary>
        [HttpPost]
        public async Task<List<AreaTreeItemDto>> GetChildTreeItems(GetChildAreasInput input)
        {
            var areas = await _areaTreeItemRepository.GetAll().Where(e => e.ParentId == input.Id).OrderBy(e => e.Name).ToListAsync();
            return areas.Select(a => ObjectMapper.Map<AreaTreeItemDto>(a)).ToList();
        }

        /// <summary>
        /// Returns child areas of the specified parent
        /// </summary>
        [HttpPost]
        public async Task<AreaTreeItemDto> GetTreeItem(EntityDto<Guid> input)
        {
            var item = await _areaTreeItemRepository.GetAsync(input.Id);
            return ObjectMapper.Map<AreaTreeItemDto>(item);
        }

        [HttpPost] // note: have to use POST verb just because of restriction of the restful-react
        public override async Task DeleteAsync(EntityDto<Guid> input)
        {
            CheckDeletePermission();

            // delete all child areas
            var area = await Repository.GetAsync(input.Id);
            await DeleteChildAreas(area);

            await Repository.DeleteAsync(input.Id);
            
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        /// <summary>
        /// Deletes all child areas recursively
        /// </summary>
        /// <param name="area"></param>
        /// <returns></returns>
        private async Task DeleteChildAreas(Area area)
        {
            var childs = await Repository.GetAll().Where(a => a.ParentArea == area).ToListAsync();
            foreach (var child in childs)
            {
                await DeleteChildAreas(child);
                await Repository.DeleteAsync(child);
            }
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        /// <summary>
        /// Moves Area to a new parent
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task MoveArea(MoveAreaInput input)
        {
            var area = await Repository.GetAsync(input.Id);
            var newParent = input.NewParentId.HasValue
                ? await Repository.GetAsync(input.NewParentId.Value)
                : null;

            area.ParentArea = newParent;
            await Repository.UpdateAsync(area);

            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public override async Task<AreaDto> CreateAsync(AreaCreateDto input)
        {
            return await base.CreateAsync(input);
        }
    }
}
