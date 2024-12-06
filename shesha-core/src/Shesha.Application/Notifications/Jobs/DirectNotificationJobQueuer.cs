using Abp.BackgroundJobs;
using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Hangfire;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.DynamicEntities.Dtos;
using Shesha.Notifications.Dto;
using Shesha.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Notifications.Jobs
{
    public class DirectNotificationJobQueuer : AsyncBackgroundJob<DirectNotificationJobArgs>, ITransientDependency
    {  
        private readonly IRepository<Person, Guid> _personRepository;
        private readonly IRepository<NotificationMessage, Guid> _notificationMessageRepository;
        private readonly IEnumerable<INotificationChannelSender> _channelSenders;
        private readonly INotificationSender _notificationSender;

        public DirectNotificationJobQueuer(IRepository<Person, Guid> personRepository, IRepository<NotificationMessage, Guid> notificationMessageRepository, INotificationSender notificationSender, IEnumerable<INotificationChannelSender> channelSenders)
        {
            _notificationMessageRepository = notificationMessageRepository;
            _personRepository = personRepository;
            _channelSenders = channelSenders;
            _notificationSender = notificationSender;
        }

        //[UnitOfWork]
        //public override async Task ExecuteAsync(DirectNotificationJobArgs args)
        //{
        //    if (args == null)
        //        throw new ArgumentNullException(nameof(args));

        //    // Retrieve sender and recipient information
        //    var fromPerson = await _personRepository.GetAsync(args.FromPerson);
        //    var toPerson = await _personRepository.GetAsync(args.ToPerson);

        //    // Retrieve the notification message
        //    var notificationMessage = await _notificationMessageRepository.GetAsync(args.Message);

        //    // Identify the notification sender channel
        //    var senderChannel = _channelSenders.FirstOrDefault(x => x.GetType().Name == args.SenderTypeName);
        //    if (senderChannel == null)
        //        throw new InvalidOperationException($"No sender found for sender type: {args.SenderTypeName}");

        //    // Send the notification using the resolved sender channel
        //    await _notificationSender.SendAsync(fromPerson, toPerson, notificationMessage, senderChannel);
        //}

        [UnitOfWork]
        public override async Task ExecuteAsync(DirectNotificationJobArgs args)
        {
            if (args == null)
                throw new ArgumentNullException(nameof(args));

            var fromPerson = await _personRepository.GetAsync(args.FromPerson);
            var toPerson = await _personRepository.GetAsync(args.ToPerson);

            var notificationMessage = await _notificationMessageRepository.GetAsync(args.Message);

            var senderChannel = _channelSenders.FirstOrDefault(x => x.GetType().Name == args.SenderTypeName);
            if (senderChannel == null)
                throw new InvalidOperationException($"No sender found for sender type: {args.SenderTypeName}");

            // Attempt to send the notification
            await TrySendNotificationAsync(fromPerson, toPerson, notificationMessage, senderChannel, args.Attempt);
        }

        private async Task TrySendNotificationAsync(Person fromPerson, Person toPerson, NotificationMessage notificationMessage, INotificationChannelSender senderChannel, int attempt)
        {
            const int MaxRetries = 3;

            // Exit early if the attempt is greater than or equal to the maximum retry count
            if (attempt > MaxRetries)
            {
                Logger.Warn($"Notification {notificationMessage.Id} has reached the maximum retry attempts ({MaxRetries}) and will not be retried further.");
                return; // Do not attempt further retries
            }

            try
            {
                await _notificationSender.SendAsync(fromPerson, toPerson, notificationMessage, senderChannel);

                Logger.Info($"Notification {notificationMessage.Id} sent successfully on attempt {attempt + 1}");
            }
            catch (Exception ex)
            {
                notificationMessage.RetryCount = attempt + 1;
                notificationMessage.ErrorMessage = $"Attempt {attempt + 1} failed: {ex.Message}";
                notificationMessage.Status = RefListNotificationStatus.Failed;

                await _notificationMessageRepository.UpdateAsync(notificationMessage);

                await CurrentUnitOfWork.SaveChangesAsync();

                Logger.Error($"Notification {notificationMessage.Id} failed on attempt {attempt + 1}: {ex.Message}");

                // If we haven't reached the maximum retry count, schedule the next attempt
                if (attempt + 1 < MaxRetries)
                {
                    BackgroundJob.Enqueue(() => TrySendNotificationAsync(fromPerson, toPerson, notificationMessage, senderChannel, attempt + 1));
                }
            }
        }
    }
}
