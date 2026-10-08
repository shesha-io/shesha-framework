using Abp.Domain.Repositories;
using Abp.UI;
using Moq;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.EntityReferences;
using Shesha.Notifications;
using Shesha.Notifications.Dto;
using Shesha.Notifications.MessageParticipants;
using Shesha.Otp;
using Shesha.Otp.Configuration;
using Shesha.Otp.Dto;
using Shesha.Testing.Fixtures;
using Shouldly;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.Otp
{
    [Collection(SqlServerCollection.Name)]
    public class OtpManager_Tests : SheshaNhTestBase
    {
        public OtpManager_Tests(SqlServerFixture fixture) : base(fixture)
        {
        }

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
            var env = new OtpTestEnvironment(this);
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
            var env = new OtpTestEnvironment(this);
            var otp = env.CreateManager();

            await otp.SendPinAsync(new SendPinInput { SendTo = "0820000000", SendType = OtpSendType.Sms });

            env.SavedOtp.ShouldNotBeNull();
            env.SavedOtp.OtpConfigId.ShouldBe(env.Configs[OtpConfigNames.OtpSms].Id);
            env.SavedOtp.SendStatus.ShouldBe(OtpSendStatus.Sent);
            env.SentNotificationTypes.Single().ShouldBe(OtpConfigNames.OtpSms);
        }

        [Fact]
        public async Task EmailRegistrationActionType_UsesRegistrationConfig_TestAsync()
        {
            var env = new OtpTestEnvironment(this);
            var otp = env.CreateManager();

            await otp.SendPinAsync(new SendPinInput { SendTo = "someone@example.com", SendType = OtpSendType.EmailLink, ActionType = "EmailRegistration" });

            env.SavedOtp.ShouldNotBeNull();
            env.SavedOtp.OtpConfigId.ShouldBe(env.Configs[OtpConfigNames.EmailRegistrationLink].Id);
            env.SentData.Single().IsRegistration.ShouldBeTrue();
        }

        [Fact]
        public async Task ExplicitConfig_ControlsPinAndLifetime_TestAsync()
        {
            var env = new OtpTestEnvironment(this);
            var config = env.AddConfig("CustomAction", RefListOtpPinType.Numeric, "sms-type", OtpTestEnvironment.SmsChannel);
            config.PinLength = 4;
            config.Alphabet = "AB";
            config.Lifetime = 90;
            var otp = env.CreateManager();

            await otp.SendPinAsync(new SendPinInput { SendTo = "0820000000", SendType = OtpSendType.Sms, OtpConfig = new OtpConfigIdentifierDto("Shesha", "CustomAction") });

            var pin = env.SentPins.Single();
            pin.Length.ShouldBe(4);
            pin.All(c => c == 'A' || c == 'B').ShouldBeTrue();
            env.SavedOtp.ShouldNotBeNull();
            (env.SavedOtp.ExpiresOn!.Value - DateTime.Now).TotalSeconds.ShouldBeInRange(80, 91);
        }

        [Fact]
        public async Task UnknownConfig_Throws_TestAsync()
        {
            var env = new OtpTestEnvironment(this);
            var otp = env.CreateManager();

            await Should.ThrowAsync<UserFriendlyException>(async () =>
            {
                await otp.SendPinAsync(new SendPinInput
                {
                    SendTo = "0820000000",
                    SendType = OtpSendType.Sms,
                    OtpConfig = new OtpConfigIdentifierDto("Shesha", "DoesNotExist"),
                });
            });
            env.SavedOtp.ShouldBeNull();
        }

        [Fact]
        public async Task DisabledNotificationType_IsReportedAsFailed_TestAsync()
        {
            var env = new OtpTestEnvironment(this);
            env.Configs[OtpConfigNames.OtpSms].NotificationType!.Disable = true;
            var otp = env.CreateManager();

            await otp.SendPinAsync(new SendPinInput { SendTo = "0820000000", SendType = OtpSendType.Sms });

            env.SavedOtp.ShouldNotBeNull();
            env.SavedOtp.SendStatus.ShouldBe(OtpSendStatus.Failed);
            env.SavedOtp.ErrorMessage.ShouldNotBeNull().ShouldContain("disabled");
            env.SentNotificationTypes.ShouldBeEmpty();
        }

        [Fact]
        public async Task ExtraChannelWithoutOwner_IsSkipped_TestAsync()
        {
            var env = new OtpTestEnvironment(this);
            // SMS pin whose notification is also configured for email: without an owner there is no email address
            env.Channels[OtpConfigNames.OtpSms].Add(OtpTestEnvironment.EmailChannel);
            var otp = env.CreateManager();

            await otp.SendPinAsync(new SendPinInput { SendTo = "0820000000", SendType = OtpSendType.Sms });

            env.SavedOtp.ShouldNotBeNull();
            env.SavedOtp.SendStatus.ShouldBe(OtpSendStatus.Sent);
            env.SentReceivers.Single().ShouldBeOfType<RawAddressMessageParticipant>();
        }

        private async Task<IVerifyPinResponse> CheckOtpCommonAsync(Action<VerifyPinInput>? transformAction)
        {
            var env = new OtpTestEnvironment(this);
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
        /// OTP manager dependencies: in-memory OTP storage, OTP configurations and a notification sender that records what was sent
        /// </summary>
        private class OtpTestEnvironment
        {
            public static readonly NotificationChannelConfig SmsChannel = new() { Name = "Sms", SenderTypeName = "SmsChannelSender" };
            public static readonly NotificationChannelConfig EmailChannel = new() { Name = "Email", SenderTypeName = "EmailChannelSender" };

            private readonly OtpManager_Tests _test;
            private readonly Dictionary<Guid, OtpDto> _storage = new();

            public Dictionary<string, OtpConfig> Configs { get; } = new();
            public Dictionary<string, List<NotificationChannelConfig>> Channels { get; } = new();
            public List<OtpNotificationData> SentData { get; } = new();
            public List<string> SentPins => SentData.Select(d => d.Password!).ToList();
            public List<string> SentNotificationTypes { get; } = new();
            public List<IMessageReceiver> SentReceivers { get; } = new();
            public OtpDto? SavedOtp => _storage.Values.LastOrDefault();

            public OtpTestEnvironment(OtpManager_Tests test)
            {
                _test = test;
                AddConfig(OtpConfigNames.OtpSms, RefListOtpPinType.Numeric, OtpConfigNames.OtpSms, SmsChannel);
                AddConfig(OtpConfigNames.OtpEmail, RefListOtpPinType.Numeric, OtpConfigNames.OtpEmail, EmailChannel);
                AddConfig(OtpConfigNames.OtpEmailLink, RefListOtpPinType.Token, OtpConfigNames.OtpEmailLink, EmailChannel);
                AddConfig(OtpConfigNames.EmailRegistrationLink, RefListOtpPinType.Token, OtpConfigNames.EmailRegistrationLink, EmailChannel);
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
                var settings = _test.LocalIocManager.Resolve<IOtpSettings>();

                var otpStorage = new Mock<IOtpStorage>();
                otpStorage.Setup(s => s.SaveAsync(It.IsAny<OtpDto>())).Returns<OtpDto>(dto => { _storage[dto.OperationId] = dto; return Task.CompletedTask; });
                otpStorage.Setup(s => s.GetOrNullAsync(It.IsAny<Guid>())).Returns<Guid>(id => Task.FromResult(_storage.TryGetValue(id, out var dto) ? dto : null));

                var configRepo = new Mock<IRepository<OtpConfig, Guid>>();
                configRepo.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<OtpConfig, bool>>>()))
                    .Returns<Expression<Func<OtpConfig, bool>>>(predicate => Task.FromResult(Configs.Values.AsQueryable().FirstOrDefault(predicate)!));
                configRepo.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Guid>()))
                    .Returns<Guid>(id => Task.FromResult(Configs.Values.FirstOrDefault(c => c.Id == id)!));

                var notificationManager = new Mock<INotificationManager>();
                notificationManager.Setup(m => m.GetChannelsAsync(It.IsAny<NotificationTypeConfig>(), It.IsAny<IMessageReceiver>(), It.IsAny<RefListNotificationPriority>()))
                    .Returns<NotificationTypeConfig, IMessageReceiver, RefListNotificationPriority>((type, _, _) => Task.FromResult(Channels[type.Name].ToList()));

                var notificationSender = new Mock<INotificationSender>();
                notificationSender.Setup(s => s.SendNotificationAsync(
                        It.IsAny<NotificationTypeConfig>(), It.IsAny<IMessageSender?>(), It.IsAny<IMessageReceiver>(), It.IsAny<OtpNotificationData>(),
                        It.IsAny<List<NotificationAttachmentDto>?>(), It.IsAny<string?>(), It.IsAny<GenericEntityReference?>(), It.IsAny<NotificationChannelConfig?>(), It.IsAny<string?>()))
                    .Returns<NotificationTypeConfig, IMessageSender?, IMessageReceiver, OtpNotificationData, List<NotificationAttachmentDto>?, string?, GenericEntityReference?, NotificationChannelConfig?, string?>(
                        (type, _, receiver, data, _, _, _, _, _) =>
                        {
                            SentNotificationTypes.Add(type.Name);
                            SentReceivers.Add(receiver);
                            SentData.Add(data);
                            return Task.CompletedTask;
                        });

                return new OtpManager(
                    otpStorage.Object,
                    new OtpGenerator(settings),
                    settings,
                    configRepo.Object,
                    new Mock<IRepository<Person, Guid>>().Object,
                    notificationSender.Object,
                    notificationManager.Object
                );
            }
        }
    }
}
