using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.EntityHistory;
using Abp.Net.Mail;
using Abp.UI;
using Castle.MicroKernel.Registration;
using Microsoft.IdentityModel.Tokens;
using Moq;
using NHibernate.Linq;
using Shesha.Authentication.JwtBearer;
using Shesha.Authorization;
using Shesha.Authorization.Users;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Exceptions;
using Shesha.Models.TokenAuth;
using Shesha.Otp;
using Shesha.Otp.Configuration;
using Shesha.Otp.Dto;
using Shesha.Testing.Fixtures;
using Shesha.Users;
using Shesha.Users.Dto;
using Shouldly;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.Users
{
    [Collection(SqlServerCollection.Name)]
    public class UserAppService_Tests : SheshaNhTestBase
    {
        private readonly IRepository<User, Int64> _userRepository;
        private readonly IUnitOfWorkManager _unitOfWorkManager;

        public UserAppService_Tests(SqlServerFixture fixture) : base(fixture)
        {
            _userRepository = Resolve<IRepository<User, Int64>>();
            _unitOfWorkManager = Resolve<IUnitOfWorkManager>();
        }

        [Fact]
        public async Task ResetPasswordUsingOtp_TestAsync()
        {
            var oldPassword = "123qwe";
            var mobileNo = await GetUniqueMobileNoAsync(); // todo: mock user store to prevent duplicated mobile numbers and remove this code
            var newPassword = "!!!Pass1234";
            var userName = Guid.NewGuid().ToString("N");

            var currentPin = string.Empty;

            LoginAsHostAdmin();

            // Configure Token Auth (required by the TokenAuthController)
            ConfigureTokenAuth();

            #region OTP hack 

                        var otpStorage = MockOtpStorage(new Dictionary<Guid, OtpDto>(), dto => currentPin = dto.Pin);

            LocalIocManager.IocContainer.Register(Component.For<IOtpStorage>().Instance(otpStorage.Object).IsDefault());

            #endregion

            // get IUserAppService with hacked otp storage
            var userAppService = LocalIocManager.Resolve<IUserAppService>();


            // create new user and set mobile number
            var userDto = await userAppService.CreateAsync(
                new CreateUserDto
                {
                    EmailAddress = $"{userName}@domain.com",
                    IsActive = true,
                    Name = "Test",
                    Surname = "User",
                    Password = oldPassword,
                    UserName = userName,
                    SupportedPasswordResetMethods = [(long)RefListPasswordResetMethods.SmsOtp]
                });

            // try to login using current password
            var firstLoginAttempt = await ValidateCredentialsAsync(userName, oldPassword);
            firstLoginAttempt.ShouldBeTrue("Failed to login as a new user");

            using (var uow = _unitOfWorkManager.Begin())
            {
                var user = await _userRepository.FirstOrDefaultAsync(u => u.UserName == userName);
                user.PhoneNumber = mobileNo;
                await _userRepository.UpdateAsync(user);

                await uow.CompleteAsync();
            }

            // send OTP for password reset
            var sendOtpResponse = await userAppService.ResetPasswordSendOtpAsync(mobileNo);

            // verify response
            var verifyResponse = await userAppService.ResetPasswordVerifyOtpAsync(new ResetPasswordVerifyOtpInput()
            {
                MobileNo = mobileNo,
                OperationId = sendOtpResponse.OperationId,
                Pin = currentPin
            });

            // change password
            var resetPasswordResponse =
                await userAppService.ResetPasswordUsingTokenAsync(new ResetPasswordUsingTokenInput()
                {
                    Username = verifyResponse.Username,
                    Token = verifyResponse.Token,
                    NewPassword = newPassword
                });

            // try to login using old password
            var failedAttempt = await ValidateCredentialsAsync(userName, oldPassword);

            // try to login using new password
            var successAttempt = await ValidateCredentialsAsync(userName, newPassword);

            // remove the user
            await _userRepository.DeleteAsync(userDto.Id);

            // check only after deletion
            resetPasswordResponse.ShouldBeTrue("Failed to set new password using correct token");
            failedAttempt.ShouldBeFalse("Old password still work");
            successAttempt.ShouldBeTrue("New password doesn't work");
        }

        [Fact]
        public async Task ResetPasswordUsingEmail_TestAsync()
        {
            var oldPassword = "123qwe@T";
            var newPassword = "!!!Pass1234";
            var userName = Guid.NewGuid().ToString("N");
            var email = $"{userName}@domain.com";

            var currentPin = string.Empty;

            LoginAsHostAdmin();

            // Configure Token Auth (required by the TokenAuthController)
            ConfigureTokenAuth();

            #region OTP hack 

            var emailSenderMock = new Mock<IEmailSender>();
            LocalIocManager.IocContainer.Register(Component.For<IEmailSender>().Instance(emailSenderMock.Object).IsDefault());

                        var otpStorage = MockOtpStorage(new Dictionary<Guid, OtpDto>(), dto => currentPin = dto.Pin);

            LocalIocManager.IocContainer.Register(Component.For<IOtpStorage>().Instance(otpStorage.Object).IsDefault());

            #endregion

            // get IUserAppService with hacked otp storage
            var userAppService = LocalIocManager.Resolve<UserAppService>();


            // create new user 
            var userDto = await userAppService.CreateAsync(
                new CreateUserDto
                {
                    EmailAddress = email,
                    IsActive = true,
                    Name = "Test",
                    Surname = "User",
                    Password = oldPassword,
                    UserName = userName,
                    SupportedPasswordResetMethods = new long[] { 2, 4 }
                });

            // try to login using current password
            var firstLoginAttempt = await ValidateCredentialsAsync(userName, oldPassword);
            firstLoginAttempt.ShouldBeTrue("Failed to login as a new user");

            // send OTP for password reset
            var response = await WithUnitOfWorkAsync(async () =>
            {
                return await userAppService.SendEmailLinkAsync(userName);
            });
            response.ShouldBeTrue();
            var token = "";


            using (var uow = _unitOfWorkManager.Begin())
            {
                var user = await _userRepository.FirstOrDefaultAsync(u => u.UserName == userName);

                user.PasswordResetCode.ShouldNotBeNullOrEmpty();

                // verify response
                var verifyResponse = await userAppService.ValidateResetCodeAsync(new ResetPasswordValidateCodeInput()
                {
                    Code = currentPin,
                    // the email link carries the username base64-encoded (see SendEmailLinkAsync)
                    Username = Convert.ToBase64String(Encoding.UTF8.GetBytes(userName)),
                    Method = (long)RefListPasswordResetMethods.EmailLink
                });

                token = verifyResponse.Token;

                await uow.CompleteAsync();
            }

            // change password
            var resetPasswordResponse = await WithUnitOfWorkAsync(async () => await userAppService.ResetPasswordUsingTokenAsync(new ResetPasswordUsingTokenInput()
            {
                Username = userName,
                Token = token,
                NewPassword = newPassword
            }));

            // try to login using old password
            var failedAttempt = await ValidateCredentialsAsync(userName, oldPassword);

            // try to login using new password
            var successAttempt = await ValidateCredentialsAsync(userName, newPassword);

            // remove the user
            await _userRepository.DeleteAsync(userDto.Id);

            // check only after deletion
            resetPasswordResponse.ShouldBeTrue("Failed to set new password using correct token");
            failedAttempt.ShouldBeFalse("Old password still work");
            successAttempt.ShouldBeTrue("New password doesn't work");

        }

        /// <summary>
        /// Only the OTP issued for the user's password reset may be used to obtain a password reset token
        /// </summary>
        [Fact]
        public async Task ResetPasswordVerifyOtp_should_reject_otp_not_issued_to_user_TestAsync()
        {
            var mobileNo = await GetUniqueMobileNoAsync();
            var userName = Guid.NewGuid().ToString("N");
            var currentPin = string.Empty;

            LoginAsHostAdmin();

            var storage = new Dictionary<Guid, string>();
            var otpStorage = new Mock<IOtpStorage>();
            otpStorage.Setup(s => s.SaveAsync(It.IsAny<OtpDto>())).Returns<OtpDto>(dto =>
            {
                currentPin = dto.Pin;
                storage.Add(dto.OperationId, dto.Pin);
                return Task.CompletedTask;
            });
            otpStorage.Setup(s => s.GetOrNullAsync(It.IsAny<Guid>())).Returns<Guid>(id => Task.FromResult(storage.ContainsKey(id)
                ? new OtpDto { Pin = storage[id], OperationId = id, ExpiresOn = DateTime.MaxValue }
                : null));

            LocalIocManager.IocContainer.Register(Component.For<IOtpStorage>().Instance(otpStorage.Object).IsDefault());

            var userAppService = LocalIocManager.Resolve<IUserAppService>();
            var otpManager = LocalIocManager.Resolve<IOtpManager>();

            var userDto = await userAppService.CreateAsync(
                new CreateUserDto
                {
                    EmailAddress = $"{userName}@domain.com",
                    IsActive = true,
                    Name = "Test",
                    Surname = "User",
                    Password = "123qwe",
                    UserName = userName,
                    SupportedPasswordResetMethods = [(long)RefListPasswordResetMethods.SmsOtp]
                });

            using (var uow = _unitOfWorkManager.Begin())
            {
                var user = await _userRepository.FirstOrDefaultAsync(u => u.UserName == userName);
                user.PhoneNumber = mobileNo;
                await _userRepository.UpdateAsync(user);
                await uow.CompleteAsync();
            }

            // a valid OTP that was not issued for this user's password reset
            var otherOtp = await otpManager.SendPinAsync(new SendPinInput
            {
                SendTo = await GetUniqueMobileNoAsync(),
                SendType = OtpSendType.Sms,
            });

            var verifyResponse = await userAppService.ResetPasswordVerifyOtpAsync(new ResetPasswordVerifyOtpInput()
            {
                MobileNo = mobileNo,
                OperationId = otherOtp.OperationId,
                Pin = currentPin
            });

            await _userRepository.DeleteAsync(userDto.Id);

            verifyResponse.IsSuccess.ShouldBeFalse("only the OTP issued for this user's password reset may be accepted");
            verifyResponse.Token.ShouldBeNullOrEmpty();
        }

        /// <summary>
        /// ValidateResetCode accepts at most 5 checks per OTP. After that, even the correct code is rejected and the
        /// user has to request a new one (issue #4772)
        /// </summary>
        [Fact]
        public async Task ValidateResetCode_should_reject_code_after_max_failed_attempts_TestAsync()
        {
            var mobileNo = await GetUniqueMobileNoAsync();
            var userName = Guid.NewGuid().ToString("N");
            var currentPin = string.Empty;

            LoginAsHostAdmin();

            var otpStorage = MockOtpStorage(new Dictionary<Guid, OtpDto>(), dto => currentPin = dto.Pin);

            LocalIocManager.IocContainer.Register(Component.For<IOtpStorage>().Instance(otpStorage.Object).IsDefault());

            var userAppService = LocalIocManager.Resolve<IUserAppService>();

            var userDto = await userAppService.CreateAsync(
                new CreateUserDto
                {
                    EmailAddress = $"{userName}@domain.com",
                    IsActive = true,
                    Name = "Test",
                    Surname = "User",
                    Password = "123qwe",
                    UserName = userName,
                    SupportedPasswordResetMethods = [(long)RefListPasswordResetMethods.SmsOtp]
                });

            using (var uow = _unitOfWorkManager.Begin())
            {
                var user = await _userRepository.FirstOrDefaultAsync(u => u.UserName == userName);
                user.PhoneNumber = mobileNo;
                await _userRepository.UpdateAsync(user);
                await uow.CompleteAsync();
            }

            (await userAppService.SendSmsOtpAsync(userName)).ShouldBeTrue();

            var wrongPin = currentPin == "000000" ? "111111" : "000000";
            var input = new ResetPasswordValidateCodeInput
            {
                Username = userName,
                Method = (long)RefListPasswordResetMethods.SmsOtp,
                Code = wrongPin,
            };

            var failedResponses = new List<ResetPasswordVerifyOtpResponse>();
            for (var i = 0; i < 5; i++)
                failedResponses.Add(await userAppService.ValidateResetCodeAsync(input));

            // the 6th check uses the correct code and must still be rejected
            input.Code = currentPin;
            var lockedResponse = await userAppService.ValidateResetCodeAsync(input);

            await _userRepository.DeleteAsync(userDto.Id);

            failedResponses.ShouldAllBe(r => !r.IsSuccess && r.ErrorMessage == "Wrong one time pin");
            lockedResponse.IsSuccess.ShouldBeFalse("the code must be rejected once the attempt limit is reached");
            lockedResponse.ErrorMessage.ShouldBe("Too many failed verification attempts. Please request a new code.");
            lockedResponse.Token.ShouldBeNullOrEmpty();
        }

        /// <summary>
        /// PasswordResetCode also holds the operation id of an OTP login. A login OTP must not be accepted by either
        /// password reset endpoint, even with the correct pin
        /// </summary>
        [Fact]
        public async Task Reset_endpoints_should_reject_login_otp_TestAsync()
        {
            var mobileNo = await GetUniqueMobileNoAsync();
            var userName = Guid.NewGuid().ToString("N");
            var currentPin = string.Empty;

            LoginAsHostAdmin();

            var otpStorage = MockOtpStorage(new Dictionary<Guid, OtpDto>(), dto => currentPin = dto.Pin);
            LocalIocManager.IocContainer.Register(Component.For<IOtpStorage>().Instance(otpStorage.Object).IsDefault());

            var userAppService = LocalIocManager.Resolve<IUserAppService>();
            var otpManager = LocalIocManager.Resolve<IOtpManager>();

            var userDto = await CreateUserWithMobileNoAsync(userAppService, userName, mobileNo);

            // the same as ShaLoginManager.SendLoginOtpAsync: an OTP login stores its operation id in PasswordResetCode
            var loginOtp = await otpManager.SendPinAsync(new SendPinInput
            {
                SendTo = mobileNo,
                SendType = OtpSendType.Sms,
                ActionType = "OTP login",
            });
            using (var uow = _unitOfWorkManager.Begin())
            {
                var user = await _userRepository.FirstOrDefaultAsync(u => u.UserName == userName);
                user.PasswordResetCode = loginOtp.OperationId.ToString();
                await _userRepository.UpdateAsync(user);
                await uow.CompleteAsync();
            }

            var verifyResponse = await userAppService.ResetPasswordVerifyOtpAsync(new ResetPasswordVerifyOtpInput()
            {
                MobileNo = mobileNo,
                OperationId = loginOtp.OperationId,
                Pin = currentPin
            });
            var validateException = await Should.ThrowAsync<UserFriendlyException>(async () =>
            {
                await userAppService.ValidateResetCodeAsync(new ResetPasswordValidateCodeInput
                {
                    Username = userName,
                    Code = currentPin,
                    Method = (long)RefListPasswordResetMethods.SmsOtp,
                });
            });

            await _userRepository.DeleteAsync(userDto.Id);

            verifyResponse.IsSuccess.ShouldBeFalse("a login OTP must not be accepted for password reset");
            verifyResponse.Token.ShouldBeNullOrEmpty();
            validateException.ShouldNotBeNull();
        }

        /// <summary>
        /// A password reset OTP is single use: it's consumed when it's exchanged for a reset token
        /// </summary>
        /// <summary>
        /// ResetPasswordSendOtp returns the OTP's operation id and stores it in PasswordResetCode, so the operation id must not
        /// work as a reset token: only the token issued after the pin is verified does
        /// </summary>
        [Fact]
        public async Task ResetPasswordUsingToken_should_reject_otp_operation_id_TestAsync()
        {
            var mobileNo = await GetUniqueMobileNoAsync();
            var userName = Guid.NewGuid().ToString("N");
            var currentPin = string.Empty;

            LoginAsHostAdmin();

            var storage = new Dictionary<Guid, OtpDto>();
            var otpStorage = MockOtpStorage(storage, dto => currentPin = dto.Pin);
            LocalIocManager.IocContainer.Register(Component.For<IOtpStorage>().Instance(otpStorage.Object).IsDefault());

            var userAppService = LocalIocManager.Resolve<IUserAppService>();

            var userDto = await CreateUserWithMobileNoAsync(userAppService, userName, mobileNo);
            try
            {
                var sendOtpResponse = await userAppService.ResetPasswordSendOtpAsync(mobileNo);

                await Should.ThrowAsync<VerificationFailedException>(async () =>
                {
                    await WithUnitOfWorkAsync(async () => await userAppService.ResetPasswordUsingTokenAsync(new ResetPasswordUsingTokenInput()
                    {
                        Username = userName,
                        Token = sendOtpResponse.OperationId.ToString(),
                        NewPassword = "NewPassword123!",
                    }));
                });

                // the token issued after verification still works
                var verifyResponse = await userAppService.ResetPasswordVerifyOtpAsync(new ResetPasswordVerifyOtpInput()
                {
                    MobileNo = mobileNo,
                    OperationId = sendOtpResponse.OperationId,
                    Pin = currentPin
                });
                verifyResponse.IsSuccess.ShouldBeTrue();
                var reset = await WithUnitOfWorkAsync(async () => await userAppService.ResetPasswordUsingTokenAsync(new ResetPasswordUsingTokenInput()
                {
                    Username = userName,
                    Token = verifyResponse.Token!,
                    NewPassword = "NewPassword123!",
                }));
                reset.ShouldBeTrue();
            }
            finally
            {
                await _userRepository.DeleteAsync(userDto.Id);
            }
        }

        [Fact]
        public async Task ResetPasswordVerifyOtp_should_consume_otp_TestAsync()
        {
            var mobileNo = await GetUniqueMobileNoAsync();
            var userName = Guid.NewGuid().ToString("N");
            var currentPin = string.Empty;

            LoginAsHostAdmin();

            var storage = new Dictionary<Guid, OtpDto>();
            var otpStorage = MockOtpStorage(storage, dto => currentPin = dto.Pin);
            LocalIocManager.IocContainer.Register(Component.For<IOtpStorage>().Instance(otpStorage.Object).IsDefault());

            var userAppService = LocalIocManager.Resolve<IUserAppService>();
            var otpManager = LocalIocManager.Resolve<IOtpManager>();

            var userDto = await CreateUserWithMobileNoAsync(userAppService, userName, mobileNo);

            var sendOtpResponse = await userAppService.ResetPasswordSendOtpAsync(mobileNo);
            var verifyResponse = await userAppService.ResetPasswordVerifyOtpAsync(new ResetPasswordVerifyOtpInput()
            {
                MobileNo = mobileNo,
                OperationId = sendOtpResponse.OperationId,
                Pin = currentPin
            });
            var reuse = await otpManager.VerifyPinAsync(new VerifyPinInput { OperationId = sendOtpResponse.OperationId, Pin = currentPin });

            await _userRepository.DeleteAsync(userDto.Id);

            verifyResponse.IsSuccess.ShouldBeTrue();
            verifyResponse.Token.ShouldNotBeNullOrEmpty();
            storage[sendOtpResponse.OperationId].ConsumedOn.ShouldNotBeNull("the OTP must be consumed when the reset token is issued");
            reuse.IsSuccess.ShouldBeFalse("a consumed OTP must not verify again");
        }

        /// <summary>
        /// Requesting a login OTP after the reset OTP overwrites PasswordResetCode (it holds the operation id of both). The
        /// reset pin must still be accepted (#5714)
        /// </summary>
        [Fact]
        public async Task ResetPasswordVerifyOtp_should_accept_reset_pin_after_login_otp_was_requested_TestAsync()
        {
            var mobileNo = await GetUniqueMobileNoAsync();
            var userName = Guid.NewGuid().ToString("N");
            var currentPin = string.Empty;

            LoginAsHostAdmin();

            var otpStorage = MockOtpStorage(new Dictionary<Guid, OtpDto>(), dto => currentPin = dto.Pin);
            LocalIocManager.IocContainer.Register(Component.For<IOtpStorage>().Instance(otpStorage.Object).IsDefault());

            var userAppService = LocalIocManager.Resolve<IUserAppService>();

            var userDto = await CreateUserWithMobileNoAsync(userAppService, userName, mobileNo);

            var sendOtpResponse = await userAppService.ResetPasswordSendOtpAsync(mobileNo);
            var resetPin = currentPin;

            // the same as ShaLoginManager.SendLoginOtpAsync: an OTP login stores its operation id in PasswordResetCode
            using (var uow = _unitOfWorkManager.Begin())
            {
                var user = await (await _userRepository.GetAllAsync()).FirstOrDefaultAsync(u => u.UserName == userName);
                user.PasswordResetCode = Guid.NewGuid().ToString();
                await _userRepository.UpdateAsync(user);
                await uow.CompleteAsync();
            }

            var verifyResponse = await userAppService.ResetPasswordVerifyOtpAsync(new ResetPasswordVerifyOtpInput()
            {
                MobileNo = mobileNo,
                OperationId = sendOtpResponse.OperationId,
                Pin = resetPin
            });

            await _userRepository.DeleteAsync(userDto.Id);

            verifyResponse.IsSuccess.ShouldBeTrue(verifyResponse.ErrorMessage);
            verifyResponse.Token.ShouldNotBeNullOrEmpty();
        }

        /// <summary>
        /// A password reset OTP has the user as its recipient and its operation id in PasswordResetCode, like a login OTP.
        /// It must not log the user in, and the attempt must not use it up for the password reset
        /// </summary>
        [Fact]
        public async Task LoginViaOtp_from_an_unregistered_device_should_not_use_up_the_otp_TestAsync()
        {
            var mobileNo = await GetUniqueMobileNoAsync();
            var userName = Guid.NewGuid().ToString("N");
            var currentPin = string.Empty;

            LoginAsHostAdmin();

            var otps = new Dictionary<Guid, OtpDto>();
            var otpStorage = MockOtpStorage(otps, dto => currentPin = dto.Pin);
            LocalIocManager.IocContainer.Register(Component.For<IOtpStorage>().Instance(otpStorage.Object).IsDefault());

            var userAppService = LocalIocManager.Resolve<IUserAppService>();
            var userDto = await CreateUserWithMobileNoAsync(userAppService, userName, mobileNo);
            var logInManager = Resolve<LogInManager>();

            var sendResponse = await WithUnitOfWorkAsync(async () => await logInManager.SendLoginOtpAsync(await _userRepository.GetAsync(userDto.Id), mobileNo));
            var loginPin = currentPin;

            // saving the login attempt deadlocks in entity history in the test project (#5777), so it's off for the login
            var entityHistory = Resolve<IEntityHistoryConfiguration>();
            var entityHistoryWasEnabled = entityHistory.IsEnabled;
            ShaLoginResult<User> loginResult;
            try
            {
                entityHistory.IsEnabled = false;
                loginResult = await logInManager.LoginViaOtpAsync(mobileNo, sendResponse.OperationId, loginPin, imei: "990000000000001", shouldLockout: false);
            }
            finally
            {
                entityHistory.IsEnabled = entityHistoryWasEnabled;
            }

            var otp = otps[sendResponse.OperationId];
            await _userRepository.DeleteAsync(userDto.Id);

            loginResult.Result.ShouldBe(ShaLoginResultType.DeviceNotRegistered);
            otp.ConsumedOn.ShouldBeNull("a retry from a registered device can still use the pin");
            otp.VerifyAttempts.ShouldBe(0);
        }

        [Fact]
        public async Task LoginViaOtp_should_reject_a_password_reset_otp_TestAsync()
        {
            var mobileNo = await GetUniqueMobileNoAsync();
            var userName = Guid.NewGuid().ToString("N");
            var currentPin = string.Empty;

            LoginAsHostAdmin();

            var otps = new Dictionary<Guid, OtpDto>();
            var otpStorage = MockOtpStorage(otps, dto => currentPin = dto.Pin);
            LocalIocManager.IocContainer.Register(Component.For<IOtpStorage>().Instance(otpStorage.Object).IsDefault());

            var userAppService = LocalIocManager.Resolve<IUserAppService>();
            var userDto = await CreateUserWithMobileNoAsync(userAppService, userName, mobileNo);

            var sendOtpResponse = await userAppService.ResetPasswordSendOtpAsync(mobileNo);
            var resetPin = currentPin;

            // saving the login attempt deadlocks in entity history in the test project (#5777), so it's off for the login
            var entityHistory = Resolve<IEntityHistoryConfiguration>();
            var entityHistoryWasEnabled = entityHistory.IsEnabled;
            ShaLoginResult<User> loginResult;
            try
            {
                entityHistory.IsEnabled = false;
                loginResult = await Resolve<LogInManager>().LoginViaOtpAsync(mobileNo, sendOtpResponse.OperationId, resetPin, shouldLockout: false);
            }
            finally
            {
                entityHistory.IsEnabled = entityHistoryWasEnabled;
            }

            var verifyResponse = await userAppService.ResetPasswordVerifyOtpAsync(new ResetPasswordVerifyOtpInput()
            {
                MobileNo = mobileNo,
                OperationId = sendOtpResponse.OperationId,
                Pin = resetPin
            });

            await _userRepository.DeleteAsync(userDto.Id);

            loginResult.Result.ShouldBe(ShaLoginResultType.InvalidOTP);
            verifyResponse.IsSuccess.ShouldBeTrue("the login attempt must not use up the password reset pin");
        }

        /// <summary>
        /// A password reset pin sent to one user's mobile number can't be used to reset another user's password
        /// </summary>
        [Fact]
        public async Task ResetPasswordVerifyOtp_should_reject_reset_otp_sent_to_another_user_TestAsync()
        {
            var mobileNo = await GetUniqueMobileNoAsync();
            var otherMobileNo = await GetUniqueMobileNoAsync();
            var userName = Guid.NewGuid().ToString("N");
            var otherUserName = Guid.NewGuid().ToString("N");
            var currentPin = string.Empty;

            LoginAsHostAdmin();

            var otpStorage = MockOtpStorage(new Dictionary<Guid, OtpDto>(), dto => currentPin = dto.Pin);
            LocalIocManager.IocContainer.Register(Component.For<IOtpStorage>().Instance(otpStorage.Object).IsDefault());

            var userAppService = LocalIocManager.Resolve<IUserAppService>();

            var userDto = await CreateUserWithMobileNoAsync(userAppService, userName, mobileNo);
            var otherUserDto = await CreateUserWithMobileNoAsync(userAppService, otherUserName, otherMobileNo);

            // a valid reset pin, but sent to the other user
            var otherOtp = await userAppService.ResetPasswordSendOtpAsync(otherMobileNo);

            var verifyResponse = await userAppService.ResetPasswordVerifyOtpAsync(new ResetPasswordVerifyOtpInput()
            {
                MobileNo = mobileNo,
                OperationId = otherOtp.OperationId,
                Pin = currentPin
            });

            await _userRepository.DeleteAsync(userDto.Id);
            await _userRepository.DeleteAsync(otherUserDto.Id);

            verifyResponse.IsSuccess.ShouldBeFalse("a reset pin sent to another user must not be accepted");
            verifyResponse.Token.ShouldBeNullOrEmpty();
        }

        /// <summary>
        /// A password reset pin is bound to the account it was sent for. If the mobile number is moved to another account
        /// while the pin is still valid, the pin must not reset the other account's password
        /// </summary>
        [Fact]
        public async Task ResetPasswordVerifyOtp_should_reject_reset_otp_after_mobile_number_moved_to_another_user_TestAsync()
        {
            var mobileNo = await GetUniqueMobileNoAsync();
            var userName = Guid.NewGuid().ToString("N");
            var otherUserName = Guid.NewGuid().ToString("N");
            var currentPin = string.Empty;

            LoginAsHostAdmin();

            var otpStorage = MockOtpStorage(new Dictionary<Guid, OtpDto>(), dto => currentPin = dto.Pin);
            LocalIocManager.IocContainer.Register(Component.For<IOtpStorage>().Instance(otpStorage.Object).IsDefault());

            var userAppService = LocalIocManager.Resolve<IUserAppService>();

            var userDto = await CreateUserWithMobileNoAsync(userAppService, userName, mobileNo);
            var otherUserDto = await CreateUserWithMobileNoAsync(userAppService, otherUserName, await GetUniqueMobileNoAsync());

            var sendOtpResponse = await userAppService.ResetPasswordSendOtpAsync(mobileNo);
            var input = new ResetPasswordVerifyOtpInput()
            {
                MobileNo = mobileNo,
                OperationId = sendOtpResponse.OperationId,
                Pin = currentPin
            };

            // the number is removed from the first account: nobody has it, which is a failed verification, not an error
            await SetPhoneNumberAsync(userName, await GetUniqueMobileNoAsync());
            var withoutOwner = await userAppService.ResetPasswordVerifyOtpAsync(input);

            // then given to the other account
            await SetPhoneNumberAsync(otherUserName, mobileNo);
            var moved = await userAppService.ResetPasswordVerifyOtpAsync(input);

            await _userRepository.DeleteAsync(userDto.Id);
            await _userRepository.DeleteAsync(otherUserDto.Id);

            withoutOwner.IsSuccess.ShouldBeFalse();
            moved.IsSuccess.ShouldBeFalse("the pin was sent for another account");
            moved.Token.ShouldBeNullOrEmpty();
        }

        /// <summary>
        /// An OTP sent by an application with a person as the recipient is only accepted with that person's mobile number
        /// </summary>
        [Fact]
        public async Task ResetPasswordVerifyOtp_should_check_the_mobile_number_for_a_person_recipient_TestAsync()
        {
            var mobileNo = await GetUniqueMobileNoAsync();
            var otherMobileNo = await GetUniqueMobileNoAsync();
            var userName = Guid.NewGuid().ToString("N");
            var otherUserName = Guid.NewGuid().ToString("N");
            var currentPin = string.Empty;

            LoginAsHostAdmin();

            var otpStorage = MockOtpStorage(new Dictionary<Guid, OtpDto>(), dto => currentPin = dto.Pin);
            LocalIocManager.IocContainer.Register(Component.For<IOtpStorage>().Instance(otpStorage.Object).IsDefault());

            var userAppService = LocalIocManager.Resolve<IUserAppService>();
            var otpManager = LocalIocManager.Resolve<IOtpManager>();
            var personRepository = Resolve<IRepository<Person, Guid>>();

            var userDto = await CreateUserWithMobileNoAsync(userAppService, userName, mobileNo);
            var otherUserDto = await CreateUserWithMobileNoAsync(userAppService, otherUserName, otherMobileNo);

            Guid personId;
            using (var uow = _unitOfWorkManager.Begin())
            {
                var user = await (await _userRepository.GetAllAsync()).FirstOrDefaultAsync(u => u.UserName == userName);
                personId = await personRepository.InsertAndGetIdAsync(new Person { User = user, FirstName = "Test", LastName = "User" });
                await uow.CompleteAsync();
            }

            var otp = await otpManager.SendPinAsync(new SendPinInput
            {
                SendTo = mobileNo,
                SendType = OtpSendType.Sms,
                ActionType = OtpActionTypes.PasswordReset,
                RecipientId = personId.ToString(),
            });

            var withOtherNumber = await userAppService.ResetPasswordVerifyOtpAsync(new ResetPasswordVerifyOtpInput()
            {
                MobileNo = otherMobileNo,
                OperationId = otp.OperationId,
                Pin = currentPin
            });
            var withOwnNumber = await userAppService.ResetPasswordVerifyOtpAsync(new ResetPasswordVerifyOtpInput()
            {
                MobileNo = mobileNo,
                OperationId = otp.OperationId,
                Pin = currentPin
            });

            using (var uow = _unitOfWorkManager.Begin())
            {
                await personRepository.DeleteAsync(personId);
                await uow.CompleteAsync();
            }
            await _userRepository.DeleteAsync(userDto.Id);
            await _userRepository.DeleteAsync(otherUserDto.Id);

            withOtherNumber.IsSuccess.ShouldBeFalse("the mobile number doesn't belong to the person the OTP was sent for");
            withOtherNumber.Token.ShouldBeNullOrEmpty();
            withOwnNumber.IsSuccess.ShouldBeTrue(withOwnNumber.ErrorMessage);
        }

        private async Task SetPhoneNumberAsync(string userName, string mobileNo)
        {
            using (var uow = _unitOfWorkManager.Begin())
            {
                var user = await (await _userRepository.GetAllAsync()).FirstOrDefaultAsync(u => u.UserName == userName);
                user.PhoneNumber = mobileNo;
                await _userRepository.UpdateAsync(user);
                await uow.CompleteAsync();
            }
        }

        private async Task<UserDto> CreateUserWithMobileNoAsync(IUserAppService userAppService, string userName, string mobileNo)
        {
            var userDto = await userAppService.CreateAsync(
                new CreateUserDto
                {
                    EmailAddress = $"{userName}@domain.com",
                    IsActive = true,
                    Name = "Test",
                    Surname = "User",
                    Password = "123qwe",
                    UserName = userName,
                    SupportedPasswordResetMethods = [(long)RefListPasswordResetMethods.SmsOtp]
                });

            using (var uow = _unitOfWorkManager.Begin())
            {
                var user = await _userRepository.FirstOrDefaultAsync(u => u.UserName == userName);
                user.PhoneNumber = mobileNo;
                await _userRepository.UpdateAsync(user);
                await uow.CompleteAsync();
            }

            return userDto;
        }

        /// <summary>
        /// In-memory OTP storage: keeps the saved OTPs (never expiring), counts verification attempts and lets each OTP
        /// be consumed once
        /// </summary>
        private static Mock<IOtpStorage> MockOtpStorage(Dictionary<Guid, OtpDto> storage, Action<OtpDto>? onSave = null)
        {
            var otpStorage = new Mock<IOtpStorage>();
            otpStorage.Setup(s => s.SaveAsync(It.IsAny<OtpDto>())).Returns<OtpDto>(dto =>
            {
                dto.ExpiresOn = DateTime.MaxValue;
                storage[dto.OperationId] = dto;
                onSave?.Invoke(dto);
                return Task.CompletedTask;
            });
            otpStorage.Setup(s => s.GetOrNullAsync(It.IsAny<Guid>()))
                .Returns<Guid>(id => Task.FromResult(storage.TryGetValue(id, out var dto) ? dto : null));
            otpStorage.Setup(s => s.IncrementVerifyAttemptsAsync(It.IsAny<Guid>()))
                .Returns<Guid>(id => Task.FromResult(storage.TryGetValue(id, out var dto) ? ++dto.VerifyAttempts : 0));
            otpStorage.Setup(s => s.TryConsumeAsync(It.IsAny<Guid>())).Returns<Guid>(id =>
            {
                lock (storage)
                {
                    if (!storage.TryGetValue(id, out var dto) || dto.ConsumedOn.HasValue)
                        return Task.FromResult(false);

                    dto.ConsumedOn = DateTime.Now;
                    return Task.FromResult(true);
                }
            });
            return otpStorage;
        }

        private async Task<string> GetUniqueMobileNoAsync()
        {
            var rnd = new Random();
            using (var uow = _unitOfWorkManager.Begin())
            {
                do
                {
                    // note: NextDouble() is in [0, 1), formatting it as "0000000000" only ever produced 0000000000 or 0000000001
                    var mobileNo = "0" + rnd.Next(100000000, 999999999).ToString();
                    var alreadyExists = await _userRepository.FirstOrDefaultAsync(u => u.PhoneNumber == mobileNo) != null;
                    if (!alreadyExists)
                        return mobileNo;
                } while (true);
            }
        }

        private async Task<bool> ValidateCredentialsAsync(string username, string password)
        {
            try
            {
                using (var uow = _unitOfWorkManager.Begin())
                {
                    var controller = Resolve<TokenAuthController>();

                    // Call the Authenticate method
                    var response = await controller.AuthenticateAsync(new AuthenticateModel()
                    {
                        UserNameOrEmailAddress = username,
                        Password = password
                    });

                    await uow.CompleteAsync();

                    // Check if response is an OkObjectResult
                    if (response is AuthenticateResultModel okResult)
                    {
                        // Cast the result to dynamic
                        // Check for the redirect case
                        if (response.ResultType == AuthenticateResultType.Redirect || response.ResultType == AuthenticateResultType.RedirectNoAuth)
                        {
                            var url = response.ResultType == AuthenticateResultType.Redirect
                                ? ""
                                : response.ResultType == AuthenticateResultType.RedirectNoAuth
                                    ? "no-auth"
                                    : "";
                            // Handle the redirect case in your test (e.g., simulate navigation or log it)
                            if (!string.IsNullOrEmpty(response.RedirectUrl))
                                Console.WriteLine($"Redirect to: {url}/{response.RedirectUrl}");
                            if (!string.IsNullOrEmpty(response.RedirectModule))
                                Console.WriteLine($"Redirect to: {url}/{response.RedirectModule}/{response.RedirectForm}");
                            return false; // Return false to indicate that redirection occurred and login was not completed
                        }

                        // Handle successful login by checking for an access token
                        return !string.IsNullOrWhiteSpace(response.AccessToken);
                    }

                    return false; // Return false if the response is not as expected
                }
            }
            catch
            {
                return false;
            }
        }



        private void ConfigureTokenAuth()
        {
            LocalIocManager.Register<TokenAuthConfiguration>();
            var tokenAuthConfig = LocalIocManager.Resolve<TokenAuthConfiguration>();

            tokenAuthConfig.SecurityKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes("ZQJK9FR81M9NDCKX161B2L9RXDBHL7GS"));
            tokenAuthConfig.Issuer = "SheshaTest";
            tokenAuthConfig.Audience = "SheshaTest";
            tokenAuthConfig.SigningCredentials = new SigningCredentials(tokenAuthConfig.SecurityKey, SecurityAlgorithms.HmacSha256);
            tokenAuthConfig.Expiration = TimeSpan.FromDays(1);
        }

        [Fact]
        public async Task CreateUser_TestAsync()
        {
            LoginAsHostAdmin();

            var userAppService = LocalIocManager.Resolve<IUserAppService>();

            var userName = Guid.NewGuid().ToString("N");

            await userAppService.CreateAsync(
                new CreateUserDto
                {
                    EmailAddress = $"{userName}@domain.com",
                    IsActive = true,
                    Name = "Test",
                    Surname = "User",
                    Password = "123qwe",
                    UserName = userName
                });

            await UsingDbSessionAsync(async session =>
            {
                var johnNashUser = await session.Query<User>().FirstOrDefaultAsync(u => u.UserName == userName);
                johnNashUser.ShouldNotBeNull();
            });
        }
    }
}
