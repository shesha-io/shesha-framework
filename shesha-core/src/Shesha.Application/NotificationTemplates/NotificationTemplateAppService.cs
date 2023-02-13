using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using Microsoft.AspNetCore.Mvc;
using Shesha.Domain;
using Shesha.NotificationTemplates.Dto;
using System;
using System.Threading.Tasks;

namespace Shesha.NotificationTemplates;

public class NotificationTemplateAppService : SheshaCrudServiceBase<NotificationTemplate, NotificationTemplateDto, Guid>
{
    public NotificationTemplateAppService(IRepository<NotificationTemplate, Guid> repository) : base(repository)
    {
    }

    [HttpPost] // note: have to use POST verb just because of restriction of the restful-react
    public override async Task DeleteAsync(EntityDto<Guid> input)
    {
        await base.DeleteAsync(input);
    }

    public override Task<NotificationTemplateDto> UpdateAsync(NotificationTemplateDto input)
    {
        return base.UpdateAsync(input);
    }
}