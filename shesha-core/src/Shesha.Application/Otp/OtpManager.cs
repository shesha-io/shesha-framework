using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.UI;
using Castle.Core.Logging;
using Shesha.Authorization.Users;
using Shesha.ConfigurationItems.Specifications;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.EntityReferences;
using Shesha.Exceptions;
using Shesha.Notifications;
using Shesha.Notifications.MessageParticipants;
using Shesha.Notifications.SMS;
using Shesha.Otp.Configuration;
using Shesha.Otp.Dto;
using System;
using System.Threading.Tasks;

namespace Shesha.Otp
{
    public class OtpManager : IOtpManager, ITransientDependency
    {
        /// <summary>
        /// Legacy action type used by the registration email-link flow
        /// </summary>
        private const string EmailRegistrationActionType = "EmailRegistration";

        private readonly IOtpStorage _otpStorage;
        private readonly IOtpGenerator _otpGenerator;
        private readonly IOtpSettings _otpSettings;
        private readonly IRepository<OtpConfig, Guid> _otpConfigRepository;
        private readonly IRepository<Person, Guid> _personRepository;
        private readonly INotificationSender _notificationSender;
        private readonly INotificationManager _notificationManager;

        public ILogger Logger { get; set; } = NullLogger.Instance;

        public OtpManager(
            IOtpStorage otpStorage,
            IOtpGenerator passwordGenerator,
            IOtpSettings otpSettings,
            IRepository<OtpConfig, Guid> otpConfigRepository,
            IRepository<Person, Guid> personRepository,
            INotificationSender notificationSender,
            INotificationManager notificationManager)
        {
            _otpStorage = otpStorage;
            _otpGenerator = passwordGenerator;
            _otpSettings = otpSettings;
            _otpConfigRepository = otpConfigRepository;
            _personRepository = personRepository;
            _notificationSender = notificationSender;
            _notificationManager = notificationManager;
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

            // OTPs requested before OTP configurations were introduced have no config - use the default one for their send type
            var config = (otp.OtpConfigId.HasValue
                ? await _otpConfigRepository.FirstOrDefaultAsync(otp.OtpConfigId.Value)
                : null) ?? await GetDefaultOtpConfigAsync(otp.SendType, otp.ActionType);

            // send otp
            var sendTime = DateTime.Now;
            try
            {
                await SendInternalAsync(otp, config);
            }
            catch (Exception e)
            {
                await _otpStorage.UpdateAsync(input.OperationId, newOtp =>
                {
                    newOtp.SentOn = sendTime;
                    newOtp.SendStatus = OtpSendStatus.Failed;
                    newOtp.ErrorMessage = e.FullMessage();

                    return Task.CompletedTask;
                });
            }

            // extend lifetime
            var lifeTime = input.Lifetime ?? config.Lifetime ?? settings.DefaultLifetime;
            var newExpiresOn = DateTime.Now.AddSeconds(lifeTime);

            await _otpStorage.UpdateAsync(input.OperationId, newOtp =>
            {
                newOtp.SentOn = sendTime;
                newOtp.SendStatus = OtpSendStatus.Sent;
                newOtp.ExpiresOn = newExpiresOn;

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
            if (string.IsNullOrWhiteSpace(input.SendTo))
                throw new Exception($"{input.SendTo} must be specified");

            var config = await GetOtpConfigAsync(input);

            var pinCode = GeneratePin(config);

            // generate new pin and save
            var otp = new OtpDto()
            {
                OperationId = Guid.NewGuid(),
                Pin = pinCode,

                SendTo = input.SendTo,
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
                    otp.SendStatus = OtpSendStatus.Failed;
                    otp.ErrorMessage = e.FullMessage();
                }
            }

            // set expiration and save
            var lifeTime = input.Lifetime.HasValue && input.Lifetime.Value != 0
                ? input.Lifetime.Value
                : config.Lifetime is int configLifetime && configLifetime > 0
                    ? configLifetime
                    : settings.DefaultLifetime;

            otp.ExpiresOn = DateTime.Now.AddSeconds(lifeTime);

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
        /// Get OTP configuration requested by the caller. Callers that don't specify a configuration get the default one for their send type
        /// </summary>
        private async Task<OtpConfig> GetOtpConfigAsync(SendPinInput input)
        {
            if (input.OtpConfig == null)
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
                OtpSendType.EmailLink when actionType == EmailRegistrationActionType => OtpConfigNames.EmailRegistrationLink,
                OtpSendType.EmailLink => OtpConfigNames.OtpEmailLink,
                OtpSendType.Email => OtpConfigNames.OtpEmail,
                OtpSendType.Sms => OtpConfigNames.OtpSms,
                _ => throw new NotSupportedException($"unsupported {nameof(OtpSendType)}: {sendType}"),
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
            // TODO: Generate password reset token
            return config.PinType == RefListOtpPinType.Token
                ? Guid.NewGuid().ToString("N")
                : _otpGenerator.GeneratePin(config.PinLength, config.Alphabet);
        }

        /// <summary>
        /// Send OTP using the notification type of the OTP configuration. Template and channels are defined by the notification type
        /// </summary>
        private async Task SendInternalAsync(IOtpDto otp, OtpConfig config)
        {
            var type = config.NotificationType;
            if (type == null)
                throw new UserFriendlyException($"Notification type is not specified for the OTP configuration '{config.Name}'");

            // note: disabled notification types are skipped silently by the notification sender, the OTP would be reported as sent
            if (type.Disable)
                throw new UserFriendlyException($"Notification type '{type.Name}' of the OTP configuration '{config.Name}' is disabled");

            var data = new OtpNotificationData
            {
                Password = otp.Pin,
                Token = otp.Pin,
                UserId = otp.RecipientId,
                OperationId = otp.OperationId.ToString(),
                IsRegistration = config.Name == OtpConfigNames.EmailRegistrationLink || otp.ActionType == EmailRegistrationActionType,
            };

            // `SendTo` is a raw address which is valid for the channel that matches `SendType` only.
            // Other channels of the notification type are sent to the person that owns the OTP request (if any)
            var rawReceiver = new RawAddressMessageParticipant(otp.SendTo);
            var person = await GetOwnerPersonOrNullAsync(otp.Owner);
            var personReceiver = person != null ? new PersonMessageParticipant(person) : null;

            var priority = type.DefaultPriority ?? RefListNotificationPriority.Medium;
            var channels = await _notificationManager.GetChannelsAsync(type, rawReceiver, priority);

            var sentCount = 0;
            foreach (var channel in channels)
            {
                IMessageReceiver? receiver = ChannelMatchesSendType(channel, otp.SendType)
                    ? rawReceiver
                    : personReceiver;

                if (receiver == null)
                {
                    Logger.Warn($"OTP {otp.OperationId}: channel '{channel.Name}' skipped, the request has no owner person to resolve the address");
                    continue;
                }

                await _notificationSender.SendNotificationAsync(type, null, receiver, data, triggeringEntity: otp.Owner, channel: channel);
                sentCount++;
            }

            if (sentCount == 0)
                throw new UserFriendlyException($"No notification channel is available to send the OTP using notification type '{type.Name}'");
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

        private async Task<Person?> GetOwnerPersonOrNullAsync(GenericEntityReference? owner)
        {
            if (owner == null || string.IsNullOrWhiteSpace(owner.Id))
                return null;

            if (owner._className == typeof(Person).FullName && Guid.TryParse(owner.Id, out var personId))
                return await _personRepository.FirstOrDefaultAsync(personId);

            if (owner._className == typeof(User).FullName && long.TryParse(owner.Id, out var userId))
                return await _personRepository.FirstOrDefaultAsync(p => p.User != null && p.User.Id == userId);

            return null;
        }
    }
}
