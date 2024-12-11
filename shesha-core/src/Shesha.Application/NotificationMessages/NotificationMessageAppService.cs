using Abp.Domain.Repositories;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.DynamicEntities.Dtos;
using System;
using System.Threading.Tasks;

namespace Shesha.NotificationMessages;

/// <summary>
/// Notifications audit service
/// </summary>
public class NotificationMessageAppService : SheshaCrudServiceBase<NotificationMessage, DynamicDto<NotificationMessage, Guid>, Guid>
{
    public NotificationMessageAppService(IRepository<NotificationMessage, Guid> repository) : base(repository)
    {
    }

    /// <summary>
    /// 
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    /// <exception cref="ArgumentNullException"></exception>
    public async Task<DynamicDto<NotificationMessage, Guid>> MarkAsReadAsync(Guid id)
    {
        if (id == Guid.Empty)
            throw new ArgumentNullException(nameof(id));

        var entity = await SaveOrUpdateEntityAsync<NotificationMessage>(id, item =>
        {
            item.ReadStatus = RefListNotificationReadStatus.Read;
            item.FirstDateRead = DateTime.UtcNow;
        });

        return await MapToDynamicDtoAsync<NotificationMessage, Guid>(entity);
    }
}