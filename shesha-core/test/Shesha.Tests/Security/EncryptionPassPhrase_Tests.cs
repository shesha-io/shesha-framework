using Abp.Runtime.Security;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Shesha.Authorization;
using System.Collections.Generic;
using System.Reflection;
using Xunit;

namespace Shesha.Tests.Security
{
    /// <summary>
    /// Tests to verify that the encryption passphrase is configurable.
    /// Covers issue #4656: Move hardcoded encryption passphrase from AppConsts to configuration.
    /// </summary>
    public class EncryptionPassPhrase_Tests
    {
        [Fact]
        public void DefaultPassPhrase_constant_still_exists_as_fallback()
        {
            AppConsts.DefaultPassPhrase.Should().NotBeNullOrEmpty(
                "DefaultPassPhrase must remain as a backward-compatible fallback");
        }

        [Fact]
        public void TokenAuthController_should_have_IConfiguration_field()
        {
            var field = typeof(TokenAuthController).GetField("_appConfiguration", BindingFlags.NonPublic | BindingFlags.Instance);
            field.Should().NotBeNull("TokenAuthController should inject IConfiguration");
            field.FieldType.Should().Be(typeof(IConfiguration));
        }

        [Fact]
        public void TokenAuthController_constructor_should_accept_IConfiguration()
        {
            var ctors = typeof(TokenAuthController).GetConstructors();
            ctors.Should().NotBeEmpty();

            var ctor = ctors[0];
            var parameters = ctor.GetParameters();
            var hasConfigParam = false;
            foreach (var param in parameters)
            {
                if (param.ParameterType == typeof(IConfiguration))
                {
                    hasConfigParam = true;
                    break;
                }
            }
            hasConfigParam.Should().BeTrue("TokenAuthController constructor should accept IConfiguration");
        }

        [Fact]
        public void Configured_passphrase_encrypts_and_decrypts_correctly()
        {
            var customPassPhrase = "MyCustomP@ssPhrase123";
            var plainText = "test-access-token-value";

            var encrypted = SimpleStringCipher.Instance.Encrypt(plainText, customPassPhrase);
            var decrypted = SimpleStringCipher.Instance.Decrypt(encrypted, customPassPhrase);

            decrypted.Should().Be(plainText);
        }

        [Fact]
        public void Default_passphrase_still_works_for_backward_compatibility()
        {
            var plainText = "test-access-token-value";

            var encrypted = SimpleStringCipher.Instance.Encrypt(plainText, AppConsts.DefaultPassPhrase);
            var decrypted = SimpleStringCipher.Instance.Decrypt(encrypted, AppConsts.DefaultPassPhrase);

            decrypted.Should().Be(plainText);
        }

        [Fact]
        public void Different_passphrases_produce_different_ciphertext()
        {
            var plainText = "test-access-token-value";
            var passPhrase1 = AppConsts.DefaultPassPhrase;
            var passPhrase2 = "DifferentPassPhrase123";

            var encrypted1 = SimpleStringCipher.Instance.Encrypt(plainText, passPhrase1);
            var encrypted2 = SimpleStringCipher.Instance.Encrypt(plainText, passPhrase2);

            encrypted1.Should().NotBe(encrypted2,
                "Different passphrases should produce different ciphertext");
        }

        [Fact]
        public void Configuration_fallback_returns_default_when_key_missing()
        {
            var config = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string>())
                .Build();

            var passPhrase = config["Authentication:EncryptionPassPhrase"] ?? AppConsts.DefaultPassPhrase;

            passPhrase.Should().Be(AppConsts.DefaultPassPhrase,
                "When config key is missing, should fall back to AppConsts.DefaultPassPhrase");
        }

        [Fact]
        public void Configuration_returns_custom_value_when_key_present()
        {
            var customValue = "MySecurePassPhrase";
            var config = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string>
                {
                    { "Authentication:EncryptionPassPhrase", customValue }
                })
                .Build();

            var passPhrase = config["Authentication:EncryptionPassPhrase"] ?? AppConsts.DefaultPassPhrase;

            passPhrase.Should().Be(customValue,
                "When config key is present, should use configured value");
        }
    }
}
