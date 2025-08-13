using Shesha.Domain;
using Shesha.Dto.Interfaces;
using Shesha.DynamicEntities.Dtos;
using System;

namespace Shesha.Dto
{
    /// <summary>
    /// Update Configuration Item request
    /// </summary>
    public class UpdateConfigurationItemRequest : DynamicDto<ConfigurationItem, Guid>, IUpdateConfigurationItemRequest
    {
        //public Guid Id { get; set; }
    }
}