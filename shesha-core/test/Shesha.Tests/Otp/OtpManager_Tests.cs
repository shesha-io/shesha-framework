using Abp.Domain.Repositories;
using Abp.UI;
using Moq;
using Shesha.Authorization.Users;
using Shesha.Configuration;
using Shesha.Configuration.Runtime;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.EntityReferences;
using Shesha.Notifications;
using Shesha.Notifications.Dto;
using Shesha.Notifications.Exceptions;
using Shesha.Notifications.MessageParticipants;
using Shesha.Otp;
using Shesha.Otp.Configuration;
using Shesha.Otp.Dto;
using Shesha.Settings;
using Shouldly;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.Otp
{
    [Trait("RunOnPipeline", "yes")]
    public class OtpManager_Tests
    {
        private const string MobileNo = "0820000000";

        [Fact]
        public async Task SuccessOtp_TestAsync()
        {
            var response = await CheckOtpCommonAsync(null);

            response.IsSuccess.ShouldBe(true);
            response.ErrorMessage.ShouldBeNullOrEmpty();
        }

        [Fact]
        public async Task FailedOtp_TestAsync()
        {
            var response = await CheckOtpCommonAsync(v => { v.Pin += "_wrong"; });

            response.IsSuccess.ShouldBe(false);
            response.ErrorMessage.ShouldNotBeNullOrWhiteSpace();

        }

        [Fact]
        public async Task SuccessEmailLink_TestAsync()
        {
            var env = new OtpTestEnvironment();
            var otp = env.CreateManager();

            var sendResponse = await otp.SendPinAsync(new SendPinInput()
            {
                Lifetime = 60,
                SendTo = "anonymous.info@boxfusion.co.za",
                SendType = OtpSendType.EmailLink
            });

            env.SentPins.Single().Length.ShouldBe(32);
            var response = await otp.VerifyPinAsync(new VerifyPinInput { OperationId = sendResponse.OperationId, Pin = env.SentPins.Single() });

            response.IsSuccess.ShouldBe(true);
            response.ErrorMessage.ShouldBeNullOrEmpty();
        }

        [Fact]
        public async Task CallerWithoutConfig_UsesDefaultConfigOfSendType_TestAsync()
        {
            var env = new OtpTestEnvironment();
            var otp = env.CreateManager();

            await otp.SendPinAsync(new SendPinInput { SendTo = MobileNo, SendType = OtpSendType.Sms });

            env.SavedOtp.ShouldNotBeNull();
            env.SavedOtp.OtpConfigId.ShouldBe(env.Configs[OtpConfigNames.OtpSms].Id);
            env.SavedOtp.SendStatus.ShouldBe(OtpSendStatus.Sent);
            env.Sent.Single().NotificationType.ShouldBe(OtpTestEnvironment.SmsNotification);
        }

        [Fact]
        public async Task EmailRegistrationActionType_UsesRegistrationConfig_TestAsync()
        {
            var env = new OtpTestEnvironment();
            var otp = env.CreateManager();

            await otp.SendPinAsync(new SendPinInput { SendTo = "someone@example.com", SendType = OtpSendType.EmailLink, ActionType = "EmailRegistration" });

            env.SavedOtp.ShouldNotBeNull();
            env.SavedOtp.OtpConfigId.ShouldBe(env.Configs[OtpConfigNames.OtpEmailRegistrationLink].Id);
            env.Sent.Single().Data.IsRegistration.ShouldBeTrue();
        }

        [Fact]
        public async Task PublicUrlOfFrontEnd_IsAvailableInTemplates_TestAsync()
        {
            var env = new OtpTestEnvironment();
            var otp = env.CreateManager();

            await otp.SendPinAsync(new SendPinInput { SendTo = "someone@example.com", SendType = OtpSendType.EmailLink });

            // without the trailing slash: templates build links as {{publicUrl}}/path
            env.Sent.Single().Data.PublicUrl.ShouldBe("https://my.site");
            env.Sent.Single().Data["publicUrl"].ShouldBe("https://my.site");
        }

        [Fact]
        public async Task ExplicitConfig_ControlsPinAndLifetime_TestAsync()
        {
            var env = new OtpTestEnvironment();
            var config = env.AddConfig("CustomAction", RefListOtpPinType.Numeric, "sms-type", OtpTestEnvironment.SmsChannel);
            config.PinLength = 4;
            config.Alphabet = "AB";
            config.Lifetime = 90;
            var otp = env.CreateManager();

            await otp.SendPinAsync(new SendPinInput { SendTo = MobileNo, SendType = OtpSendType.Sms, OtpConfig = new OtpConfigIdentifierDto("Shesha", "CustomAction") });

            var pin = env.SentPins.Single();
            pin.Length.ShouldBe(4);
            pin.All(c => c == 'A' || c == 'B').ShouldBeTrue();
            env.Sent.Single().NotificationType.ShouldBe("sms-type");
            env.SavedOtp.ShouldNotBeNull();
            (env.SavedOtp.ExpiresOn!.Value - DateTime.Now).TotalSeconds.ShouldBeInRange(80, 91);
        }

        [Fact]
        public async Task RequestedLifetime_OverridesConfigLifetime_TestAsync()
        {
            var env = new OtpTestEnvironment();
            env.Configs[OtpConfigNames.OtpSms].Lifetime = 90;
            var otp = env.CreateManager();

            await otp.SendPinAsync(new SendPinInput { SendTo = MobileNo, SendType = OtpSendType.Sms, Lifetime = 30 });

            env.SavedOtp.ShouldNotBeNull();
            (env.SavedOtp.ExpiresOn!.Value - DateTime.Now).TotalSeconds.ShouldBeInRange(20, 31);
        }

        [Fact]
        public async Task UnknownConfig_Throws_TestAsync()
        {
            var env = new OtpTestEnvironment();
            var otp = env.CreateManager();

            await Should.ThrowAsync<UserFriendlyException>(async () =>
            {
                await otp.SendPinAsync(new SendPinInput
                {
                    SendTo = MobileNo,
                    SendType = OtpSendType.Sms,
                    OtpConfig = new OtpConfigIdentifierDto("Shesha", "DoesNotExist"),
                });
            });
            env.SavedOtp.ShouldBeNull();
        }

        [Fact]
        public async Task DisabledNotificationType_IsReportedAsFailed_TestAsync()
        {
            var env = new OtpTestEnvironment();
            env.Configs[OtpConfigNames.OtpSms].NotificationType!.Disable = true;
            var otp = env.CreateManager();

            await otp.SendPinAsync(new SendPinInput { SendTo = MobileNo, SendType = OtpSendType.Sms });

            env.SavedOtp.ShouldNotBeNull();
            env.SavedOtp.SendStatus.ShouldBe(OtpSendStatus.Failed);
            env.SavedOtp.ErrorMessage.ShouldNotBeNull().ShouldContain("disabled");
            env.Sent.ShouldBeEmpty();
        }

        [Fact]
        public async Task Owner_IsPassedAsTriggeringEntity_TestAsync()
        {
            var env = new OtpTestEnvironment();
            var otp = env.CreateManager();
            var owner = new GenericEntityReference(Guid.NewGuid().ToString(), "MyModule.Domain.Payment");

            await otp.SendPinAsync(new SendPinInput { SendTo = MobileNo, SendType = OtpSendType.Sms, Owner = owner });

            env.Sent.Single().TriggeringEntity.ShouldBe(owner);
            env.SavedOtp.ShouldNotBeNull().Owner.ShouldBe(owner);
        }

        [Fact]
        public async Task ExtraChannelWithoutRecipientPerson_IsSkipped_TestAsync()
        {
            var env = new OtpTestEnvironment();
            // SMS pin whose notification is also configured for email: there is no person to take the email address from
            env.Channels[OtpTestEnvironment.SmsNotification].Add(OtpTestEnvironment.EmailChannel);
            var otp = env.CreateManager();

            await otp.SendPinAsync(new SendPinInput { SendTo = MobileNo, SendType = OtpSendType.Sms });

            env.SavedOtp.ShouldNotBeNull();
            env.SavedOtp.SendStatus.ShouldBe(OtpSendStatus.Sent);
            var sent = env.Sent.Single();
            sent.Channel.ShouldBe(OtpTestEnvironment.SmsChannel);
            sent.Receiver.ShouldBeOfType<RawAddressMessageParticipant>();
        }

        [Fact]
        public async Task RecipientPerson_ReceivesChannelsThatDontMatchSendType_TestAsync()
        {
            var env = new OtpTestEnvironment();
            env.Channels[OtpTestEnvironment.SmsNotification].Add(OtpTestEnvironment.EmailChannel);
            var otp = env.CreateManager();

            await otp.SendPinAsync(new SendPinInput
            {
                SendTo = MobileNo,
                SendType = OtpSendType.Sms,
                RecipientType = typeof(Person).FullName,
                RecipientId = env.Person.Id.ToString(),
            });

            env.SavedOtp.ShouldNotBeNull().SendStatus.ShouldBe(OtpSendStatus.Sent);
            env.Sent.Count.ShouldBe(2);

            // the address passed by the caller is used for the channel of the send type
            var sms = env.Sent.Single(s => s.Channel == OtpTestEnvironment.SmsChannel);
            sms.Receiver.ShouldBe(new RawAddressMessageParticipant(MobileNo));

            // other channels take the address from the person
            var email = env.Sent.Single(s => s.Channel == OtpTestEnvironment.EmailChannel);
            email.Receiver.GetPerson().ShouldBe(env.Person);
        }

        [Fact]
        public async Task RecipientUser_IsResolvedToPerson_TestAsync()
        {
            var env = new OtpTestEnvironment();
            var otp = env.CreateManager();

            // no address at all: the channels of the notification type take it from the person of the user
            await otp.SendPinAsync(new SendPinInput
            {
                OtpConfig = new OtpConfigIdentifierDto("Shesha", OtpConfigNames.OtpEmail),
                RecipientType = typeof(User).FullName,
                RecipientId = env.Person.User!.Id.ToString(),
            });

            env.SavedOtp.ShouldNotBeNull().SendStatus.ShouldBe(OtpSendStatus.Sent);
            var sent = env.Sent.Single();
            sent.Channel.ShouldBe(OtpTestEnvironment.EmailChannel);
            sent.Receiver.GetPerson().ShouldBe(env.Person);
        }

        [Fact]
        public async Task NoAddressAndNoRecipientPerson_Throws_TestAsync()
        {
            var env = new OtpTestEnvironment();
            var otp = env.CreateManager();

            await Should.ThrowAsync<Exception>(async () =>
            {
                await otp.SendPinAsync(new SendPinInput { SendType = OtpSendType.Sms, RecipientId = "not-a-person" });
            });
            env.SavedOtp.ShouldBeNull();
        }

        [Fact]
        public async Task CustomChannelWithoutRecipientPerson_ReceivesAddress_TestAsync()
        {
            var env = new OtpTestEnvironment();
            var customChannel = new NotificationChannelConfig { Name = "WhatsApp", SenderTypeName = "WhatsAppChannelSender" };
            env.Channels[OtpTestEnvironment.SmsNotification] = [customChannel];
            var otp = env.CreateManager();

            await otp.SendPinAsync(new SendPinInput { SendTo = MobileNo, SendType = OtpSendType.Sms });

            env.SavedOtp.ShouldNotBeNull().SendStatus.ShouldBe(OtpSendStatus.Sent);
            var sent = env.Sent.Single();
            sent.Channel.ShouldBe(customChannel);
            sent.Receiver.ShouldBe(new RawAddressMessageParticipant(MobileNo));
        }

        [Fact]
        public async Task OneOfChannelsFails_OtpIsSent_TestAsync()
        {
            var env = new OtpTestEnvironment();
            env.Channels[OtpTestEnvironment.SmsNotification].Add(OtpTestEnvironment.EmailChannel);
            env.FailingChannels.Add(OtpTestEnvironment.SmsChannel);
            var otp = env.CreateManager();

            await otp.SendPinAsync(new SendPinInput
            {
                SendTo = MobileNo,
                SendType = OtpSendType.Sms,
                RecipientType = typeof(Person).FullName,
                RecipientId = env.Person.Id.ToString(),
            });

            env.SavedOtp.ShouldNotBeNull();
            env.SavedOtp.SendStatus.ShouldBe(OtpSendStatus.Sent);
            env.SavedOtp.ErrorMessage.ShouldBeNull();
            env.Sent.Single().Channel.ShouldBe(OtpTestEnvironment.EmailChannel);
        }

        [Fact]
        public async Task AllChannelsFail_OtpIsFailedWithReasonOfTheMessage_TestAsync()
        {
            var env = new OtpTestEnvironment();
            env.FailingChannels.Add(OtpTestEnvironment.SmsChannel);
            var otp = env.CreateManager();

            await otp.SendPinAsync(new SendPinInput { SendTo = MobileNo, SendType = OtpSendType.Sms });

            env.SavedOtp.ShouldNotBeNull();
            env.SavedOtp.SendStatus.ShouldBe(OtpSendStatus.Failed);
            env.SavedOtp.ErrorMessage.ShouldNotBeNull().ShouldContain(OtpTestEnvironment.GatewayError);
        }

        [Fact]
        public async Task Resend_UsesConfigOfTheRequestAndExtendsLifetime_TestAsync()
        {
            var env = new OtpTestEnvironment();
            env.AddConfig("CustomAction", RefListOtpPinType.Numeric, "sms-type", OtpTestEnvironment.SmsChannel).Lifetime = 600;
            var otp = env.CreateManager();

            var response = await otp.SendPinAsync(new SendPinInput { SendTo = MobileNo, SendType = OtpSendType.Sms, Lifetime = 30, OtpConfig = new OtpConfigIdentifierDto("Shesha", "CustomAction") });
            await otp.ResendPinAsync(new ResendPinInput { OperationId = response.OperationId });

            env.Sent.Count.ShouldBe(2);
            env.Sent.ShouldAllBe(s => s.NotificationType == "sms-type");
            env.SentPins.Distinct().Count().ShouldBe(1);
            env.SavedOtp.ShouldNotBeNull().SendStatus.ShouldBe(OtpSendStatus.Sent);
            (env.SavedOtp.ExpiresOn!.Value - DateTime.Now).TotalSeconds.ShouldBeInRange(590, 601);
        }

        [Fact]
        public async Task FailedResend_IsRecordedAsFailedAndKeepsExpiration_TestAsync()
        {
            var env = new OtpTestEnvironment();
            var otp = env.CreateManager();

            var response = await otp.SendPinAsync(new SendPinInput { SendTo = MobileNo, SendType = OtpSendType.Sms, Lifetime = 30 });
            var expiresOn = env.SavedOtp.ShouldNotBeNull().ExpiresOn;

            env.FailingChannels.Add(OtpTestEnvironment.SmsChannel);
            await otp.ResendPinAsync(new ResendPinInput { OperationId = response.OperationId, Lifetime = 600 });

            env.SavedOtp.SendStatus.ShouldBe(OtpSendStatus.Failed);
            env.SavedOtp.ErrorMessage.ShouldNotBeNull().ShouldContain(OtpTestEnvironment.GatewayError);
            env.SavedOtp.ExpiresOn.ShouldBe(expiresOn);
        }

        private async Task<IVerifyPinResponse> CheckOtpCommonAsync(Action<VerifyPinInput>? transformAction)
        {
            var env = new OtpTestEnvironment();
            var otp = env.CreateManager();

            var sendResponse = await otp.SendPinAsync(new SendPinInput()
            {
                Lifetime = 60,
                SendTo = "1234567890",
                SendType = OtpSendType.Sms
            });

            var verificationInput = new VerifyPinInput()
            {
                OperationId = sendResponse.OperationId,
                Pin = env.SentPins.Single()
            };
            transformAction?.Invoke(verificationInput);

            return await otp.VerifyPinAsync(verificationInput);
        }

        /// <summary>
        /// OTP manager that resolves entity types without the entity configuration store (it requires the IoC container)
        /// </summary>
        private class TestOtpManager(
            IOtpStorage otpStorage,
            IOtpGenerator otpGenerator,
            IOtpSettings otpSettings,
            IRepository<OtpConfig, Guid> otpConfigRepository,
            IRepository<Person, Guid> personRepository,
            IRepository<NotificationMessage, Guid> notificationMessageRepository,
            INotificationSender notificationSender,
            INotificationManager notificationManager,
            IEntityTypeConfigurationStore entityTypeConfigurationStore,
            IFrontendSettings frontendSettings)
            : OtpManager(otpStorage, otpGenerator, otpSettings, otpConfigRepository, personRepository, notificationMessageRepository, notificationSender, notificationManager, entityTypeConfigurationStore, frontendSettings)
        {
            private static readonly Type[] EntityTypes = [typeof(Person), typeof(User)];

            protected override Type? GetEntityTypeOrNull(string nameOrAlias) => EntityTypes.FirstOrDefault(t => t.FullName == nameOrAlias);
        }

        /// <summary>
        /// Notification passed to the notification sender
        /// </summary>
        private record SentNotification(string NotificationType, NotificationChannelConfig? Channel, IMessageReceiver Receiver, OtpNotificationData Data, GenericEntityReference? TriggeringEntity);

        /// <summary>
        /// OTP manager dependencies: in-memory OTP storage, OTP configurations and a notification sender that records what was sent
        /// </summary>
        private class OtpTestEnvironment
        {
            public const string GatewayError = "gateway is down";
            /// <summary>
            /// Notification type of the default SMS configuration
            /// </summary>
            public const string SmsNotification = "OneTimePinSms";
            public static readonly NotificationChannelConfig SmsChannel = new() { Name = "Sms", SenderTypeName = "SmsChannelSender" };
            public static readonly NotificationChannelConfig EmailChannel = new() { Name = "Email", SenderTypeName = "EmailChannelSender" };

            private readonly Dictionary<Guid, OtpDto> _storage = new();
            private readonly Dictionary<Guid, NotificationMessage> _failedMessages = new();

            public Dictionary<string, OtpConfig> Configs { get; } = new();
            public Dictionary<string, List<NotificationChannelConfig>> Channels { get; } = new();
            public List<NotificationChannelConfig> FailingChannels { get; } = new();
            public List<SentNotification> Sent { get; } = new();
            public List<string> SentPins => Sent.Select(s => s.Data.Password!).ToList();
            public OtpDto? SavedOtp => _storage.Values.LastOrDefault();
            public string? PublicUrl { get; set; } = "https://my.site/";
            public Person Person { get; } = new() { Id = Guid.NewGuid(), User = new User { Id = 42 } };

            public OtpTestEnvironment()
            {
                AddConfig(OtpConfigNames.OtpSms, RefListOtpPinType.Numeric, SmsNotification, SmsChannel);
                AddConfig(OtpConfigNames.OtpEmail, RefListOtpPinType.Numeric, "OneTimePinEmail", EmailChannel);
                AddConfig(OtpConfigNames.OtpEmailLink, RefListOtpPinType.Token, "OneTimeLinkEmail", EmailChannel);
                AddConfig(OtpConfigNames.OtpEmailRegistrationLink, RefListOtpPinType.Token, "EmailRegistrationLink", EmailChannel);
            }

            public OtpConfig AddConfig(string name, RefListOtpPinType pinType, string notificationTypeName, NotificationChannelConfig channel)
            {
                var type = new NotificationTypeConfig { Id = Guid.NewGuid(), Name = notificationTypeName };
                Channels[notificationTypeName] = new List<NotificationChannelConfig> { channel };
                var module = new Module { Name = OtpConfigNames.Module };
                return Configs[name] = new OtpConfig { Id = Guid.NewGuid(), Name = name, Module = module, PinType = pinType, NotificationType = type };
            }

            public OtpManager CreateManager()
            {
                var settingsValue = new OtpSettings
                {
                    Alphabet = OtpDefaults.DefaultAlphabet,
                    PasswordLength = OtpDefaults.DefaultPasswordLength,
                    DefaultLifetime = OtpDefaults.DefaultLifetime,
                };
                var settingsAccessor = new Mock<ISettingAccessor<OtpSettings>>();
                settingsAccessor.Setup(s => s.GetValueAsync(It.IsAny<SettingManagementContext?>())).ReturnsAsync(settingsValue);
                settingsAccessor.Setup(s => s.GetValue(It.IsAny<SettingManagementContext?>())).Returns(settingsValue);
                var settings = new Mock<IOtpSettings>();
                settings.SetupGet(s => s.OneTimePins).Returns(settingsAccessor.Object);

                var publicUrlAccessor = new Mock<ISettingAccessor<string>>();
                publicUrlAccessor.Setup(s => s.GetValueOrNullAsync(It.IsAny<SettingManagementContext?>())).ReturnsAsync(() => PublicUrl);
                var frontendSettings = new Mock<IFrontendSettings>();
                frontendSettings.SetupGet(s => s.PublicUrl).Returns(publicUrlAccessor.Object);

                var otpStorage = new Mock<IOtpStorage>();
                otpStorage.Setup(s => s.SaveAsync(It.IsAny<OtpDto>())).Returns<OtpDto>(dto => { _storage[dto.OperationId] = dto; return Task.CompletedTask; });
                otpStorage.Setup(s => s.GetOrNullAsync(It.IsAny<Guid>())).Returns<Guid>(id => Task.FromResult(_storage.TryGetValue(id, out var dto) ? dto : null));
                otpStorage.Setup(s => s.UpdateAsync(It.IsAny<Guid>(), It.IsAny<Func<OtpDto, Task>>())).Returns<Guid, Func<OtpDto, Task>>((id, update) => update(_storage[id]));

                var configRepo = new Mock<IRepository<OtpConfig, Guid>>();
                configRepo.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<OtpConfig, bool>>>()))
                    .Returns<Expression<Func<OtpConfig, bool>>>(predicate => Task.FromResult(Configs.Values.AsQueryable().FirstOrDefault(predicate)!));
                configRepo.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Guid>()))
                    .Returns<Guid>(id => Task.FromResult(Configs.Values.FirstOrDefault(c => c.Id == id)!));

                var persons = new List<Person> { Person };
                var personRepo = new Mock<IRepository<Person, Guid>>();
                personRepo.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<Person, bool>>>()))
                    .Returns<Expression<Func<Person, bool>>>(predicate => Task.FromResult(persons.AsQueryable().FirstOrDefault(predicate)!));
                personRepo.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Guid>()))
                    .Returns<Guid>(id => Task.FromResult(persons.FirstOrDefault(p => p.Id == id)!));

                var messageRepo = new Mock<IRepository<NotificationMessage, Guid>>();
                messageRepo.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Guid>()))
                    .Returns<Guid>(id => Task.FromResult(_failedMessages.GetValueOrDefault(id)!));

                var notificationManager = new Mock<INotificationManager>();
                notificationManager.Setup(m => m.GetChannelsAsync(It.IsAny<NotificationTypeConfig>(), It.IsAny<IMessageReceiver>(), It.IsAny<RefListNotificationPriority>()))
                    .Returns<NotificationTypeConfig, IMessageReceiver, RefListNotificationPriority>((type, _, _) => Task.FromResult(Channels[type.Name].ToList()));

                var notificationSender = new Mock<INotificationSender>();
                notificationSender.Setup(s => s.SendNotificationAsync(
                        It.IsAny<NotificationTypeConfig>(), It.IsAny<IMessageSender?>(), It.IsAny<IMessageReceiver>(), It.IsAny<OtpNotificationData>(),
                        It.IsAny<List<NotificationAttachmentDto>?>(), It.IsAny<string?>(), It.IsAny<GenericEntityReference?>(), It.IsAny<NotificationChannelConfig?>(), It.IsAny<string?>()))
                    .Returns<NotificationTypeConfig, IMessageSender?, IMessageReceiver, OtpNotificationData, List<NotificationAttachmentDto>?, string?, GenericEntityReference?, NotificationChannelConfig?, string?>(
                        (type, _, receiver, data, _, _, triggeringEntity, channel, _) =>
                        {
                            if (channel != null && FailingChannels.Contains(channel))
                            {
                                // time-sensitive notifications report a failed delivery with the id of the message that keeps the reason
                                var message = new NotificationMessage { Id = Guid.NewGuid(), ErrorMessage = GatewayError };
                                _failedMessages[message.Id] = message;
                                throw new ShaMessageFailedWaitRetryException(message.Id);
                            }

                            Sent.Add(new SentNotification(type.Name, channel, receiver, data, triggeringEntity));
                            return Task.CompletedTask;
                        });

                return new TestOtpManager(
                    otpStorage.Object,
                    new OtpGenerator(settings.Object),
                    settings.Object,
                    configRepo.Object,
                    personRepo.Object,
                    messageRepo.Object,
                    notificationSender.Object,
                    notificationManager.Object,
                    new Mock<IEntityTypeConfigurationStore>().Object,
                    frontendSettings.Object
                );
            }
        }
    }
}
