using Abp.Domain.Repositories;
using Shesha.Domain;
using Shesha.DynamicEntities.Dtos;
using Shesha.NotificationMessages.Dto;
using Shesha.Notifications;
using System;
using System.Threading.Tasks;

namespace Shesha.NotificationMessages;

/// <summary>
/// Notifications audit service
/// </summary>
public class NotificationMessageAppService : SheshaCrudServiceBase<NotificationMessage, NotificationMessageDto, Guid>
{
    private readonly IShaNotificationDistributer _distributer;

    public NotificationMessageAppService(IRepository<NotificationMessage, Guid> repository, IShaNotificationDistributer distributer) : base(repository)
    {
        _distributer = distributer;
    }

    /// <summary>
    /// Resend notification message with specified <paramref name="id"/>
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    public async Task<bool> Resend(Guid id)
    {
        var notificationMessage = await Repository.GetAsync(id);

        var dto = ObjectMapper.Map<NotificationMessageDto>(notificationMessage);
        await _distributer.ResendMessageAsync(dto);

        return true;
    }

    public async Task<DynamicDto<NotificationMessage, Guid>> MarkAsReadAsync(Guid id)
    {
        if (id == Guid.Empty)
            throw new ArgumentNullException(nameof(id));

        var entity = await SaveOrUpdateEntityAsync<NotificationMessage>(id, item =>
        {
            item.Opened = true;
            item.LastOpened = DateTime.UtcNow;
        });

        return await MapToDynamicDtoAsync<NotificationMessage, Guid>(entity);
    }
}