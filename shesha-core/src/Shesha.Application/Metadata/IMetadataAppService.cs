﻿using Abp.Application.Services;
using Shesha.AutoMapper.Dto;
using Shesha.Metadata.Dtos;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.Metadata
{
    /// <summary>
    /// Metadata application service. Provides metadata of entities, DTOs etc
    /// </summary>
    public interface IMetadataAppService: IApplicationService
    {
        /// <summary>
        /// Autocomplete of entity types
        /// </summary>
        /// <param name="term">Term to search</param>
        /// <param name="selectedValue">Selected value, is used to fetch user-friendly name of selected item</param>
        /// <returns></returns>
        Task<List<AutocompleteItemDto>> EntityTypeAutocompleteAsync(string? term, string? selectedValue);

        /// <summary>
        /// Autocomplete of container's properties
        /// </summary>
        /// <param name="term">Term to search</param>
        /// <param name="container">Container (e.g. entity type)</param>
        /// <param name="selectedValue">Selected value, is used to fetch user-friendly name of selected item</param>
        /// <returns></returns>
        Task<List<PropertyMetadataDto>> PropertyAutocompleteAsync(string? term, string container, string? selectedValue);

        /// <summary>
        /// Get properties of the specified container
        /// </summary>
        Task<List<PropertyMetadataDto>> GetPropertiesAsync(string container);

        /// <summary>
        /// Get full metadata of the specified container
        /// </summary>
        Task<MetadataDto> GetAsync(string container);
    }
}
