using Abp.Net.Mail;
using Moq;
using Shesha.Domain.Enums;
using Shesha.Otp;
using Shesha.Otp.Configuration;
using Shesha.Otp.Dto;
using Shesha.Settings;
using Shesha.Sms;
using Shouldly;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.Otp
{
    public class OtpManager_Tests: SheshaNhTestBase
    {
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
            var response = await CheckEmailLinkAsync(null);

            response.IsSuccess.ShouldBe(true);
            response.ErrorMessage.ShouldBeNullOrEmpty();
        }

        [Fact]
        public async Task RegistrationEmailLink_carries_the_operation_id_TestAsync()
        {
            var otpSettings = new OtpSettings
            {
                PasswordLength = 6,
                Alphabet = "0123456789",
                DefaultLifetime = 60,
                DefaultRegistrationEmailSubjectTemplate = OtpDefaults.DefaultRegistrationEmailSubjectTemplate,
                DefaultRegistrationEmailBodyTemplate = OtpDefaults.DefaultRegistrationEmailBodyTemplate,
            };
            var accessor = new Mock<ISettingAccessor<OtpSettings>>();
            accessor.Setup(a => a.GetValueAsync(It.IsAny<SettingManagementContext>())).ReturnsAsync(otpSettings);
            accessor.Setup(a => a.GetValue(It.IsAny<SettingManagementContext>())).Returns(otpSettings);
            var settings = new Mock<IOtpSettings>();
            settings.SetupGet(s => s.OneTimePins).Returns(accessor.Object);

            var otpStorage = new Mock<IOtpStorage>();
            otpStorage.Setup(s => s.SaveAsync(It.IsAny<OtpDto>())).Returns(Task.CompletedTask);

            string sentBody = null;
            var emailSender = new Mock<IEmailSender>();
            emailSender.Setup(s => s.SendAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<bool>()))
                .Callback<string, string, string, bool>((to, subject, body, isHtml) => sentBody = body)
                .Returns(Task.CompletedTask);

            var otp = new OtpManager(MockISmsGatewayFactory(), emailSender.Object, otpStorage.Object, new OtpGenerator(settings.Object), settings.Object, Mock.Of<IOtpSendThrottle>());

            var response = await otp.SendPinAsync(new SendPinInput
            {
                SendTo = "new.user@example.test",
                SendType = OtpSendType.EmailLink,
                RecipientId = "bmV3LnVzZXJAZXhhbXBsZS50ZXN0",
                ActionType = OtpActionTypes.Registration,
            });

            sentBody.ShouldNotBeNull();
            sentBody.ShouldContain($"operationId={response.OperationId}", Case.Sensitive, "the link must work in a browser that didn't request it");
            sentBody.ShouldContain("registration=1");
            sentBody.ShouldNotContain("{{");
        }

        private async Task<IVerifyPinResponse> CheckOtpCommonAsync(Action<VerifyPinInput> transformAction)
        {
            // todo: implement settings and register using normal way
            /*
            var settings = new Mock<IOtpSettings>();
            settings.SetupGet(s => s.PasswordLength).Returns(6);
            settings.SetupGet(s => s.Alphabet).Returns("0123456789");
            */
            var settings = LocalIocManager.Resolve<IOtpSettings>();

            var currentPin = string.Empty;
            var storage = new Dictionary<Guid, string>();

            var otpStorage = new Mock<IOtpStorage>();
            otpStorage.Setup(s => s.SaveAsync(It.IsAny<OtpDto>())).Returns<OtpDto>(dto =>
            {
                currentPin = dto.Pin;
                storage.Add(dto.OperationId, dto.Pin);
                return Task.CompletedTask;
            });
            otpStorage.Setup(s => s.GetAsync(It.IsAny<Guid>())).Returns<Guid>(id => Task.FromResult(new OtpDto
            {
                Pin = storage[id],
                OperationId = id,
                ExpiresOn = DateTime.MaxValue
            }));

            var otp = new OtpManager(
                MockISmsGatewayFactory(),
                LocalIocManager.Resolve<IEmailSender>(),
                otpStorage.Object,
                new OtpGenerator(settings),
                settings,
                Mock.Of<IOtpSendThrottle>()
            );

            var sendResponse = await otp.SendPinAsync(new SendPinInput()
            {
                Lifetime = 60,
                SendTo = "1234567890",
                SendType = OtpSendType.Sms
            });

            var verificationInput = new VerifyPinInput()
            {
                OperationId = sendResponse.OperationId,
                Pin = currentPin
            };
            transformAction?.Invoke(verificationInput);

            return await otp.VerifyPinAsync(verificationInput);
        }

        private ISmsGatewayFactory MockISmsGatewayFactory() 
        {
            var smsGatewayFactoryMock = new Mock<ISmsGatewayFactory>();
            smsGatewayFactoryMock.Setup(s => s.GetSmsGatewayAsync()).Returns(() =>
            {
                return Task.FromResult<ISmsGateway>(new NullSmsGateway());
            });
            return smsGatewayFactoryMock.Object;
        }

        private async Task<IVerifyPinResponse> CheckEmailLinkAsync(Action<VerifyPinInput> action)
        {
            var settings = LocalIocManager.Resolve<IOtpSettings>();

            var currentEmailToken = string.Empty;
            var storage = new Dictionary<Guid, string>();

            var otpStorage = new Mock<IOtpStorage>();
            otpStorage.Setup(s => s.SaveAsync(It.IsAny<OtpDto>())).Returns<OtpDto>(dto =>
            {
                currentEmailToken = dto.Pin;
                storage.Add(dto.OperationId, dto.Pin);
                return Task.CompletedTask;
            });

            otpStorage.Setup(s => s.GetAsync(It.IsAny<Guid>())).Returns<Guid>(id => Task.FromResult(new OtpDto
            {
                Pin = storage[id],
                OperationId = id,
                ExpiresOn = DateTime.MaxValue
            }));

            var otp = new OtpManager(
                MockISmsGatewayFactory(),
                LocalIocManager.Resolve<IEmailSender>(),
                otpStorage.Object,
                new OtpGenerator(settings),
                settings,
                Mock.Of<IOtpSendThrottle>()
            );

            var sendResponse = await otp.SendPinAsync(new SendPinInput()
            {
                Lifetime = 60,
                SendTo = "anonymous.info@boxfusion.co.za",
                SendType = OtpSendType.EmailLink
            });

            var verificationInput = new VerifyPinInput()
            {
                OperationId = sendResponse.OperationId,
                Pin = currentEmailToken
            };

            action?.Invoke(verificationInput);

            return await otp.VerifyPinAsync(verificationInput);
        }
    }
}
