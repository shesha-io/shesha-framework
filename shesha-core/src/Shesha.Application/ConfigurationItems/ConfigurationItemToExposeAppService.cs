﻿using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using Abp.Reflection;
using Microsoft.AspNetCore.Mvc;
using Shesha.Application.Services.Dto;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.Dto;
using Shesha.Reflection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace Shesha.ConfigurationItems
{
    /// <summary>
    /// Common Configuration Item application service
    /// </summary>
    public class ConfigurationItemToExposeAppService : SheshaCrudServiceBase<ConfigurationItemToExpose, ConfigurationItemToExposeDto, Guid>
    {
        private readonly ITypeFinder _typeFinder;
        private readonly Lazy<List<string>> _exposableItemTypes;


        public ConfigurationItemToExposeAppService(
            IRepository<ConfigurationItemToExpose, Guid> repository,
            ITypeFinder typeFinder
        ) : base(repository)
        {
            _typeFinder = typeFinder;
            _exposableItemTypes = new Lazy<List<string>>(GetExposableItemTypes);
        }

        private List<string> GetExposableItemTypes()
        {
            return _typeFinder.Find(x =>
                    x.HasAttribute<EntityAttribute>()
                    && x.HasAttribute<ExposableAttribute>()
                    && x.IsAssignableTo(typeof(ConfigurationItem))
                )
                .Select(x => x.GetCustomAttribute<ExposableAttribute>())
                .Where(x => x != null && x.Exposable && !string.IsNullOrEmpty(x.ItemType))
                .Select(x => x!.ItemType)
                .ToList();
        }
        protected override IQueryable<ConfigurationItemToExpose> CreateFilteredQuery(FilteredPagedAndSortedResultRequestDto input)
        {
            return base.CreateFilteredQuery(input).Where(x => _exposableItemTypes.Value.Contains(x.ItemType));
        }

        protected override ConfigurationItemToExposeDto MapToEntityDto(ConfigurationItemToExpose entity)
        {
            return new ConfigurationItemToExposeDto
            {
                Id = entity.Id,
                ItemType = entity.ItemType,
                DateUpdated = entity.DateUpdated,
                Name = entity.Name,
                OriginModuleName = entity.OriginModuleName,
                OverrideModuleName = entity.OverrideModuleName,
            };
        }

        [NonAction]
        public override Task<ConfigurationItemToExposeDto> CreateAsync(ConfigurationItemToExposeDto input)
        {
            return base.CreateAsync(input);
        }

        [NonAction]
        public override Task<ConfigurationItemToExposeDto> UpdateAsync(ConfigurationItemToExposeDto input)
        {
            return base.UpdateAsync(input);
        }

        [NonAction]
        public override Task DeleteAsync(EntityDto<Guid> input)
        {
            return base.DeleteAsync(input);
        }
    }
}
