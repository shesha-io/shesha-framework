using Abp.Domain.Repositories;
using Shesha.Domain;
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
    /// Resend notification message with <see cref=""/>
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
}