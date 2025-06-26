using Abp.Net.Mail;
using Moq;
using Shesha.Domain.Enums;
using Shesha.Otp;
using Shesha.Otp.Configuration;
using Shesha.Otp.Dto;
using Shesha.Sms;
using Shesha.Tests.Fixtures;
using Shouldly;
using System;
using System.Collections.Generic;
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
            var response = await CheckEmailLinkAsync(null);

            response.IsSuccess.ShouldBe(true);
            response.ErrorMessage.ShouldBeNullOrEmpty();
        }

        private async Task<IVerifyPinResponse> CheckOtpCommonAsync(Action<VerifyPinInput>? transformAction)
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
            otpStorage.Setup(s => s.GetOrNullAsync(It.IsAny<Guid>())).Returns<Guid>(id => Task.FromResult<OtpDto?>(new OtpDto
            {
                Pin = storage[id],
                OperationId = id,
                ExpiresOn = DateTime.MaxValue
            }));

            var otp = new OtpManager(
                new NullSmsGateway(),
                LocalIocManager.Resolve<IEmailSender>(),
                otpStorage.Object,
                new OtpGenerator(settings),
                settings
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
    
        private async Task<IVerifyPinResponse> CheckEmailLinkAsync(Action<VerifyPinInput>? action)
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

            otpStorage.Setup(s => s.GetOrNullAsync(It.IsAny<Guid>())).Returns<Guid>(id => Task.FromResult<OtpDto?>(new OtpDto
            {
                Pin = storage[id],
                OperationId = id,
                ExpiresOn = DateTime.MaxValue
            }));

            var otp = new OtpManager(
                new NullSmsGateway(),
                LocalIocManager.Resolve<IEmailSender>(),
                otpStorage.Object,
                new OtpGenerator(settings),
                settings
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