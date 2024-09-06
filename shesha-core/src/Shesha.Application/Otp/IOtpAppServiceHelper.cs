using Shesha.Domain.Enums;
using Shesha.Domain;
using Shesha.Otp.Dto;
using System;
using System.Threading.Tasks;

namespace Shesha.Otp
{
    public interface IOtpAppServiceHelper
    {
        /// <summary>
        /// Sends an OTP using internal settings and the provided OtpDto.
        /// </summary>
        /// <param name="otp">The OTP DTO containing the details for sending.</param>
        Task SendInternal(OtpDto otp);

        /// <summary>
        /// Sends an OTP using the provided OtpDto and the OtpConfig for custom settings.
        /// </summary>
        /// <param name="otpAuditItem">The OTP DTO to send.</param>
        /// <param name="config">The OTP configuration settings.</param>
        Task SendInternalWithConfig(OtpDto otpAuditItem, OtpConfig config);

        /// <summary>
        /// Retrieves an OTP based on the given operation ID.
        /// </summary>
        /// <param name="operationId">The operation ID of the OTP.</param>
        /// <returns>The OtpDto object.</returns>
        Task<OtpDto> GetOtpWithOperationId(Guid? operationId);

        /// <summary>
        /// Retrieves an OTP based on a composite key consisting of module name, action type, and source entity ID.
        /// </summary>
        /// <param name="moduleName">The module name associated with the OTP.</param>
        /// <param name="actionType">The action type associated with the OTP.</param>
        /// <param name="sourceEntityId">The source entity ID associated with the OTP.</param>
        /// <returns>The OtpDto object.</returns>
        Task<OtpDto> GetOtpWithCompositeKey(string moduleName, string actionType, Guid sourceEntityId);

        /// <summary>
        /// Retrieves an OTP configuration based on the module and configuration name.
        /// </summary>
        /// <param name="module">The module name.</param>
        /// <param name="otpConfig">The OTP configuration name.</param>
        /// <returns>The OtpConfig object.</returns>
        Task<OtpConfig> GetOtpConfigAsync(string module, string otpConfig);

        /// <summary>
        /// Generates an OTP code based on the specified send type.
        /// </summary>
        /// <param name="sendType">The type of send operation (e.g., SMS, Email, etc.).</param>
        /// <returns>A generated OTP code as a string.</returns>
        string GenerateOtpCode(OtpSendType sendType);

        /// <summary>
        /// Creates an OTP DTO using the provided details.
        /// </summary>
        /// <param name="sendTo">The recipient address (email or phone number).</param>
        /// <param name="config">The OTP configuration settings.</param>
        /// <param name="sourceEntityId">The source entity ID as a string.</param>
        /// <param name="pinCode">The PIN code to send.</param>
        /// <param name="recipientId">Optional recipient ID.</param>
        /// <returns>The constructed OtpDto object.</returns>
        OtpDto CreateOtp(string sendTo, OtpConfig config, string sourceEntityId, string pinCode, string recipientId = null);

        /// <summary>
        /// Sends the OTP using the specified configuration settings.
        /// </summary>
        /// <param name="otp">The OTP DTO to send.</param>
        /// <param name="config">The OTP configuration settings.</param>
        Task SendOtpAsync(OtpDto otp, OtpConfig config);

        /// <summary>
        /// Retrieves the recipient's address based on the person and send type.
        /// </summary>
        /// <param name="person">The person object containing contact information.</param>
        /// <param name="sendType">The send type (SMS, Email, etc.).</param>
        /// <returns>The recipient's address as a string.</returns>
        string GetSendToAddress(Person person, OtpSendType? sendType);

        /// <summary>
        /// Retrieves an OTP based on the input, checking both operation ID and composite key.
        /// </summary>
        /// <param name="input">The input containing operation ID, module name, action type, and source entity type.</param>
        /// <returns>The OtpDto object if found, otherwise null.</returns>
        Task<OtpDto> RetrieveOtpAsync(IVerifyPinInput input);

        /// <summary>
        /// Validates the OTP against the provided input, checking the pin and expiration status.
        /// </summary>
        /// <param name="pinDto">The OTP DTO object.</param>
        /// <param name="input">The input data for verification.</param>
        /// <param name="ignoreOtpValidation">Flag indicating whether OTP validation should be ignored.</param>
        /// <returns>A response indicating success or failure with an appropriate message.</returns>
        VerifyPinResponse ValidateOtp(OtpDto pinDto, IVerifyPinInput input, bool ignoreOtpValidation);

        /// <summary>
        /// Generates an error message for an invalid pin based on the send type.
        /// </summary>
        /// <param name="sendType">The send type (e.g., EmailLink).</param>
        /// <returns>A string message indicating the error.</returns>
        string GetInvalidPinMessage(OtpSendType sendType);

        /// <summary>
        /// Generates an expiration error message for an OTP based on the send type.
        /// </summary>
        /// <param name="sendType">The send type (e.g., EmailLink).</param>
        /// <returns>A string message indicating the OTP has expired.</returns>
        string GetExpiredPinMessage(OtpSendType sendType);

        /// <summary>
        /// Processes the resending of an OTP (One-Time Password) by updating the OTP status, sending the OTP, and handling any exceptions that occur during the sending process.
        /// </summary>
        /// <param name="otp">The OTP data transfer object that contains details about the OTP to be resent.</param>
        /// <param name="input">The input data transfer object containing details for resending the OTP, such as new lifetime settings.</param>
        /// <param name="sendOtpAction">A function that defines the action to send the OTP. This function will perform the actual OTP delivery.</param>
        /// <param name="updateOtpStatus">A function that updates the OTP status in the storage system after sending the OTP or if an error occurs.</param>
        /// <param name="defaultLifetime">The default lifetime (in seconds) to apply to the OTP if no specific lifetime is provided in the input.</param>
        /// <returns>A task representing the asynchronous operation, with a <see cref="SendPinResponse"/> containing the operation ID and the address to which the OTP was sent.</returns>
        Task<SendPinResponse> ProcessOtpResendAsync(
            OtpDto otp,
            IResendPinInput input,
            Func<OtpDto, Task> sendOtpAction,
            Func<OtpDto, Task> updateOtpStatus,
            int defaultLifetime);
    }
}
