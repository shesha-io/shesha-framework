using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.UI;
using Castle.Core.Logging;
using Shesha.Authorization.Users;
using Shesha.Configuration;
using Shesha.Configuration.Runtime;
using Shesha.ConfigurationItems.Specifications;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Exceptions;
using Shesha.Notifications;
using Shesha.Notifications.Exceptions;
using Shesha.Notifications.MessageParticipants;
using Shesha.Notifications.SMS;
using Shesha.Otp.Configuration;
using Shesha.Otp.Dto;
using Shesha.Otp.Exceptions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Otp
{
    /// <summary>
    /// One-time-pin manager. Pins are delivered by the notification subsystem: every OTP-protected action has an OTP configuration
    /// (<see cref="OtpConfig"/>) that references the notification type whose templates and channels are used to send the pin
    /// </summary>
    public class OtpManager : IOtpManager, ITransientDependency
    {
        /// <summary>
        /// Action type used by the registration email-link flow
        /// </summary>
        private const string EmailRegistrationActionType = "EmailRegistration";

        private readonly IOtpStorage _otpStorage;
        private readonly IOtpGenerator _otpGenerator;
        private readonly IOtpSettings _otpSettings;
        private readonly IRepository<OtpConfig, Guid> _otpConfigRepository;
        private readonly IRepository<Person, Guid> _personRepository;
        private readonly IRepository<NotificationMessage, Guid> _notificationMessageRepository;
        private readonly INotificationSender _notificationSender;
        private readonly INotificationManager _notificationManager;
        private readonly IEntityTypeConfigurationStore _entityTypeConfigurationStore;
        private readonly IFrontendSettings _frontendSettings;

        public ILogger Logger { get; set; } = NullLogger.Instance;

        public OtpManager(
            IOtpStorage otpStorage,
            IOtpGenerator passwordGenerator,
            IOtpSettings otpSettings,
            IRepository<OtpConfig, Guid> otpConfigRepository,
            IRepository<Person, Guid> personRepository,
            IRepository<NotificationMessage, Guid> notificationMessageRepository,
            INotificationSender notificationSender,
            INotificationManager notificationManager,
            IEntityTypeConfigurationStore entityTypeConfigurationStore,
            IFrontendSettings frontendSettings)
        {
            _otpStorage = otpStorage;
            _otpGenerator = passwordGenerator;
            _otpSettings = otpSettings;
            _otpConfigRepository = otpConfigRepository;
            _personRepository = personRepository;
            _notificationMessageRepository = notificationMessageRepository;
            _notificationSender = notificationSender;
            _notificationManager = notificationManager;
            _entityTypeConfigurationStore = entityTypeConfigurationStore;
            _frontendSettings = frontendSettings;
        }

        /// inheritedDoc
        public async Task<IOtpDto?> GetOrNullAsync(Guid operationId)
        {
            return await _otpStorage.GetOrNullAsync(operationId);
        }

        public async Task<ISendPinResponse> ResendPinAsync(ResendPinInput input)
        {
            var settings = await _otpSettings.OneTimePins.GetValueAsync();
            var otp = await _otpStorage.GetOrNullAsync(input.OperationId);
            if (otp == null)
                throw new UserFriendlyException("OTP not found, try to request a new one");

            if (otp.ExpiresOn < DateTime.Now)
                throw new UserFriendlyException("OTP has expired, try to request a new one");

            // note: we ignore _otpSettings.IgnoreOtpValidation here, the user pressed `resend` manually

            // OTPs requested before OTP configurations were introduced have no configuration - use the default one of their send type
            var config = (otp.OtpConfigId.HasValue
                ? await _otpConfigRepository.FirstOrDefaultAsync(otp.OtpConfigId.Value)
                : null) ?? await GetDefaultOtpConfigAsync(otp.SendType, otp.ActionType);

            // send otp
            var sendTime = DateTime.Now;
            string? errorMessage = null;
            try
            {
                await SendInternalAsync(otp, config);
            }
            catch (Exception e)
            {
                Logger.Warn($"Failed to resend OTP {otp.OperationId}", e);
                errorMessage = e.FullMessage();
            }

            // extend lifetime of the successfully resent pin only
            var newExpiresOn = DateTime.Now.AddSeconds(GetLifetime(input.Lifetime, config, settings));

            await _otpStorage.UpdateAsync(input.OperationId, newOtp =>
            {
                newOtp.SentOn = sendTime;
                newOtp.ErrorMessage = errorMessage;
                if (errorMessage == null)
                {
                    newOtp.SendStatus = OtpSendStatus.Sent;
                    newOtp.ExpiresOn = newExpiresOn;
                }
                else
                    newOtp.SendStatus = OtpSendStatus.Failed;

                return Task.CompletedTask;
            });

            // return response
            var response = new SendPinResponse
            {
                OperationId = otp.OperationId,
                SentTo = otp.SendTo
            };
            return response;

        }

        public async Task<ISendPinResponse> SendPinAsync(SendPinInput input)
        {
            var settings = await _otpSettings.OneTimePins.GetValueAsync();

            // the address is optional when the recipient is a person: the notification channels take addresses from the person
            if (string.IsNullOrWhiteSpace(input.SendTo) && await GetRecipientPersonOrNullAsync(input.RecipientType, input.RecipientId) == null)
                throw new Exception($"{nameof(input.SendTo)} must be specified");

            var config = await GetOtpConfigAsync(input);

            // generate new pin and save
            var otp = new OtpDto()
            {
                OperationId = Guid.NewGuid(),
                Pin = GeneratePin(config),

                SendTo = input.SendTo ?? string.Empty,
                SendType = input.SendType,
                RecipientId = input.RecipientId,
                RecipientType = input.RecipientType,
                ActionType = input.ActionType,
                OtpConfigId = config.Id,
                Owner = input.Owner,
            };

            // send otp
            if (settings.IgnoreOtpValidation)
            {
                otp.SendStatus = OtpSendStatus.Ignored;
            }
            else
            {
                try
                {
                    otp.SentOn = DateTime.Now;

                    await SendInternalAsync(otp, config);

                    otp.SendStatus = OtpSendStatus.Sent;
                }
                catch (Exception e)
                {
                    Logger.Warn($"Failed to send OTP {otp.OperationId}", e);
                    otp.SendStatus = OtpSendStatus.Failed;
                    otp.ErrorMessage = e.FullMessage();
                }
            }

            // set expiration and save
            otp.ExpiresOn = DateTime.Now.AddSeconds(GetLifetime(input.Lifetime, config, settings));

            await _otpStorage.SaveAsync(otp);

            // return response
            var response = new SendPinResponse
            {
                OperationId = otp.OperationId,
                SentTo = otp.SendTo
            };
            return response;
        }

        public async Task<IVerifyPinResponse> VerifyPinAsync(VerifyPinInput input)
        {
            var settings = await _otpSettings.OneTimePins.GetValueAsync();
            if (!settings.IgnoreOtpValidation)
            {
                var pinDto = await _otpStorage.GetOrNullAsync(input.OperationId);
                if (pinDto == null || pinDto.Pin != input.Pin)
                {
                    var message = pinDto?.SendType == OtpSendType.EmailLink
                        ? "Invalid email link"
                        : "Wrong one time pin";
                    return VerifyPinResponse.Failed(message);
                }

                if (pinDto.ExpiresOn < DateTime.Now)
                {
                    var message = pinDto.SendType == OtpSendType.EmailLink ? "The link you have supplied has expired" : "One-time pin has expired, try to send a new one";
                    return VerifyPinResponse.Failed(message);
                }
            }

            return VerifyPinResponse.Success();
        }

        /// <summary>
        /// Lifetime of the pin in seconds: defined by the OTP configuration, else requested by the caller, else the default one from the OTP settings.
        /// The configuration goes first: it is what an administrator sets for the action, the framework flows (login, password reset)
        /// always request the lifetime of the security settings and would make it ineffective otherwise
        /// </summary>
        private static long GetLifetime(long? requestedLifetime, OtpConfig config, OtpSettings settings)
        {
            if (config.Lifetime.HasValue && config.Lifetime.Value > 0)
                return config.Lifetime.Value;

            return requestedLifetime.HasValue && requestedLifetime.Value > 0
                ? requestedLifetime.Value
                : settings.DefaultLifetime;
        }

        /// <summary>
        /// Get OTP configuration requested by the caller. Callers that don't specify a configuration get the default one of their send type
        /// </summary>
        private async Task<OtpConfig> GetOtpConfigAsync(SendPinInput input)
        {
            if (input.OtpConfig == null || string.IsNullOrWhiteSpace(input.OtpConfig.Name))
                return await GetDefaultOtpConfigAsync(input.SendType, input.ActionType);

            return await FindOtpConfigAsync(input.OtpConfig.Module, input.OtpConfig.Name)
                ?? throw new UserFriendlyException($"OTP configuration '{input.OtpConfig}' not found");
        }

        /// <summary>
        /// Default OTP configuration for callers that don't specify one
        /// </summary>
        private async Task<OtpConfig> GetDefaultOtpConfigAsync(OtpSendType sendType, string? actionType)
        {
            var name = sendType switch
            {
                // backward compatibility: callers of the registration email-link flow identify it by the action type only
                OtpSendType.EmailLink when actionType == EmailRegistrationActionType => OtpConfigNames.OtpEmailRegistrationLink,
                OtpSendType.EmailLink => OtpConfigNames.OtpEmailLink,
                OtpSendType.Email => OtpConfigNames.OtpEmail,
                OtpSendType.Sms => OtpConfigNames.OtpSms,
                _ => throw new NotSupportedException($"OTP configuration must be specified, there is no default one for {nameof(OtpSendType)} '{sendType}'"),
            };

            return await FindOtpConfigAsync(OtpConfigNames.Module, name)
                ?? throw new UserFriendlyException($"Default OTP configuration '{OtpConfigNames.Module}/{name}' not found");
        }

        private async Task<OtpConfig?> FindOtpConfigAsync(string? module, string name)
        {
            return await _otpConfigRepository.FirstOrDefaultAsync(new ByNameAndModuleSpecification<OtpConfig>(name, module).ToExpression());
        }

        private string GeneratePin(OtpConfig config)
        {
            return config.PinType == RefListOtpPinType.Token
                ? Guid.NewGuid().ToString("N")
                : _otpGenerator.GeneratePin(config.PinLength, config.Alphabet);
        }

        /// <summary>
        /// Send OTP using the notification type of the OTP configuration. Templates and channels are defined by the notification type.
        /// The OTP is considered sent when at least one channel delivered it
        /// </summary>
        private async Task SendInternalAsync(IOtpDto otp, OtpConfig config)
        {
            var type = config.NotificationType;
            if (type == null)
                throw new OtpException($"Notification type is not specified for the OTP configuration '{config.Name}'");

            // note: disabled notification types are skipped silently by the notification sender, the OTP would be reported as sent
            if (type.Disable)
                throw new OtpException($"Notification type '{type.Name}' of the OTP configuration '{config.Name}' is disabled");

            var data = new OtpNotificationData
            {
                Password = otp.Pin,
                Token = otp.Pin,
                UserId = otp.RecipientId,
                OperationId = otp.OperationId.ToString(),
                IsRegistration = config.Name == OtpConfigNames.OtpEmailRegistrationLink || otp.ActionType == EmailRegistrationActionType,
                // public url of the front-end application that requested the OTP, links in the templates are built from it
                PublicUrl = (await _frontendSettings.PublicUrl.GetValueOrNullAsync())?.TrimEnd('/'),
            };

            var deliveries = await GetDeliveriesAsync(otp, type);
            if (!deliveries.Any())
                throw new OtpException($"Notification type '{type.Name}' has no channel that can deliver the OTP to the recipient");

            var errors = new List<string>();
            foreach (var (channel, receiver) in deliveries)
            {
                try
                {
                    // note: opted-out receivers are skipped silently by the notification sender, the OTP would be reported as sent
                    if (type.CanOptOut && await IsOptedOutAsync(receiver, type))
                        throw new OtpException($"The recipient has opted out of the notification type '{type.Name}'");

                    await _notificationSender.SendNotificationAsync(type, null, receiver, data, triggeringEntity: otp.Owner, channel: channel);
                }
                catch (Exception e)
                {
                    var error = await GetDeliveryErrorAsync(e);
                    Logger.Warn($"OTP {otp.OperationId}: delivery via channel '{channel.Name}' failed: {error}", e);
                    errors.Add($"{channel.Name}: {error}");
                }
            }

            if (errors.Count == deliveries.Count)
                throw new OtpException(string.Join("\r\n", errors));
        }

        /// <summary>
        /// Channels to send the OTP to and the receiver for each of them.
        /// `SendTo` is a raw address that is valid only for the channel matching `SendType`, other channels are addressed to the recipient person (if any)
        /// </summary>
        private async Task<List<(NotificationChannelConfig Channel, IMessageReceiver Receiver)>> GetDeliveriesAsync(IOtpDto otp, NotificationTypeConfig type)
        {
            var person = await GetRecipientPersonOrNullAsync(otp.RecipientType, otp.RecipientId);
            IMessageReceiver? personReceiver = person != null ? new PersonMessageParticipant(person) : null;
            IMessageReceiver? addressReceiver = !string.IsNullOrWhiteSpace(otp.SendTo) ? new RawAddressMessageParticipant(otp.SendTo) : null;

            var mainReceiver = personReceiver ?? addressReceiver;
            if (mainReceiver == null)
                return [];

            var priority = type.DefaultPriority ?? RefListNotificationPriority.Medium;
            var channels = await _notificationManager.GetChannelsAsync(type, mainReceiver, priority);

            var result = new List<(NotificationChannelConfig, IMessageReceiver)>();
            foreach (var channel in channels)
            {
                var receiver = addressReceiver != null && ChannelMatchesSendType(channel, otp.SendType)
                    ? addressReceiver
                    : personReceiver;

                if (receiver != null)
                    result.Add((channel, receiver));
                else
                    Logger.Warn($"OTP {otp.OperationId}: channel '{channel.Name}' skipped, there is no recipient person to take the address from");
            }

            // an address without a person and no channel known to match the send type (e.g. a custom channel): rely on the configuration
            if (!result.Any() && personReceiver == null && addressReceiver is { } rawReceiver)
                result.AddRange(channels.Select(channel => (channel, rawReceiver)));

            return result;
        }

        private static bool ChannelMatchesSendType(NotificationChannelConfig channel, OtpSendType sendType)
        {
            return sendType switch
            {
                OtpSendType.Sms => channel.SenderTypeName == nameof(SmsChannelSender),
                OtpSendType.Email or OtpSendType.EmailLink => channel.SenderTypeName == nameof(EmailChannelSender),
                _ => false,
            };
        }

        /// <summary>
        /// Person to deliver the OTP to. Is resolved when the recipient of the request is a person or a user
        /// </summary>
        private async Task<Person?> GetRecipientPersonOrNullAsync(string? recipientType, string? recipientId)
        {
            if (string.IsNullOrWhiteSpace(recipientType) || string.IsNullOrWhiteSpace(recipientId))
                return null;

            var entityType = GetEntityTypeOrNull(recipientType);
            if (entityType == null)
                return null;

            if (typeof(Person).IsAssignableFrom(entityType) && Guid.TryParse(recipientId, out var personId))
                return await _personRepository.FirstOrDefaultAsync(personId);

            if (typeof(User).IsAssignableFrom(entityType) && long.TryParse(recipientId, out var userId))
                return await _personRepository.FirstOrDefaultAsync(p => p.User != null && p.User.Id == userId);

            return null;
        }

        /// <summary>
        /// Whether the receiver has opted out of the notification type
        /// </summary>
        protected virtual Task<bool> IsOptedOutAsync(IMessageReceiver receiver, NotificationTypeConfig type)
        {
            return receiver.IsNotificationOptedOutAsync(type);
        }

        /// <summary>
        /// Entity type by class name or type short alias
        /// </summary>
        protected virtual Type? GetEntityTypeOrNull(string nameOrAlias)
        {
            return _entityTypeConfigurationStore.GetOrNull(nameOrAlias)?.EntityType;
        }

        /// <summary>
        /// Error to store with the OTP. A failed time-sensitive notification reports only the id of the message, the reason is stored in the message itself
        /// </summary>
        private async Task<string> GetDeliveryErrorAsync(Exception exception)
        {
            if (exception is ShaMessageFailedWaitRetryException messageFailed)
            {
                var message = await _notificationMessageRepository.FirstOrDefaultAsync(messageFailed.NotificationMessageId);
                if (!string.IsNullOrWhiteSpace(message?.ErrorMessage))
                    return message.ErrorMessage;
            }

            return exception.FullMessage();
        }
    }
}
