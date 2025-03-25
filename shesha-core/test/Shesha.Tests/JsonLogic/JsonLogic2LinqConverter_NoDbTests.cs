using Abp.Timing;
using Shesha.Domain;
using Shesha.Enterprise.Tests.Fixtures;
using Shesha.JsonLogic;
using Shesha.Tests.JsonLogic.Models;
using Shesha.Tests.JsonLogic.TestExpressions;
using Shesha.Utilities;
using System;
using System.Linq.Expressions;
using Xunit;

namespace Shesha.Tests.JsonLogic
{
    public class JsonLogic2LinqConverter_NoDbTests : JsonLogic2LinqConverter_TestsBase, IClassFixture<NoDBFixture>
    {
        public JsonLogic2LinqConverter_NoDbTests(NoDBFixture fixture) : base(fixture)
        {
        }

        #region string

        [Theory]
        [InlineData("EqualToField", StringExpressions.EqualToField, @"ent => (ent.FirstName == ent.LastName)")]
        [InlineData("EqualToNestedField", StringExpressions.EqualToNestedField, @"ent => (ent.HomeNumber == ent.Address.AddressLine3)")]
        [InlineData("NotEqualToField", StringExpressions.NotEqualToField, @"ent => Not((ent.FirstName == ent.LastName))")]
        [InlineData("EqualToValue", StringExpressions.EqualToValue, @"ent => (ent.FirstName == ""Bob"")")]
        [InlineData("NotEqualToValue", StringExpressions.NotEqualToValue, @"ent => Not((ent.FirstName == ""Bob""))")]
        [InlineData("LikeValue", StringExpressions.LikeValue, @"ent => ent.FirstName.Contains(""trick"")")]
        [InlineData("NotLikeValue", StringExpressions.NotLikeValue, @"ent => Not(ent.FirstName.Contains(""trick""))")]
        [InlineData("FieldIsEmpty", StringExpressions.FieldIsEmpty, @"ent => (ent.FirstName == null)")]
        [InlineData("FieldIsNotEmpty", StringExpressions.FieldIsNotEmpty, @"ent => ((ent.FirstName != null) AndAlso (ent.FirstName.Trim() != """"))")]
        [InlineData("FieldStartsWithValue", StringExpressions.FieldStartsWithValue, @"ent => ent.FirstName.StartsWith(""bo"")")]
        [InlineData("FieldEndsWithValue", StringExpressions.FieldEndsWithValue, @"ent => ent.FirstName.EndsWith(""ck"")")]
        [InlineData("CustomFunctions", StringExpressions.CustomFunctions, $@"ent => (((ent.FirstName == ""TeSt"".ToLower()) AndAlso (ent.LastName == ""VaLuE"".ToUpper())) AndAlso (ent.EmailAddress1 == ent.EmailAddress2.ToLower()))")]
        public void String_Conversion(string name, string jsonLogicExpression, string expectation)
        {
            Console.WriteLine($"Test: '{name}'");

            var linqExpression = ConvertToExpression<Person>(jsonLogicExpression);
            Assert.Equal(expectation, linqExpression?.ToInvariantString());
        }

        #endregion

        #region number

        [Theory]
        [InlineData("Equal", NumberExpressions.Equal, @"ent => (ent.CreatorUserId == ent.LastModifierUserId)")]
        [InlineData("NotEqual", NumberExpressions.NotEqual, @"ent => Not((ent.CreatorUserId == ent.LastModifierUserId))")]
        [InlineData("Greater", NumberExpressions.Greater, @"ent => (ent.CreatorUserId > ent.LastModifierUserId)")]
        [InlineData("GreaterOrEqual", NumberExpressions.GreaterOrEqual, @"ent => (ent.CreatorUserId >= ent.LastModifierUserId)")]
        [InlineData("Less", NumberExpressions.Less, @"ent => (ent.CreatorUserId < ent.LastModifierUserId)")]
        [InlineData("LessOrEqual", NumberExpressions.LessOrEqual, @"ent => (ent.CreatorUserId <= ent.LastModifierUserId)")]
        [InlineData("Between", NumberExpressions.Between, @"ent => ((ent.LastModifierUserId <= ent.CreatorUserId) AndAlso (ent.CreatorUserId <= ent.DeleterUserId))")]
        [InlineData("NotBetween", NumberExpressions.NotBetween, @"ent => Not(((ent.LastModifierUserId <= ent.CreatorUserId) AndAlso (ent.CreatorUserId <= ent.DeleterUserId)))")]
        [InlineData("Int64FieldEqualsToValue", NumberExpressions.Int64FieldEqualsToValue, $@"ent => (ent.{nameof(Person.CreatorUserId)} == Convert(100, Nullable`1))")]
        [InlineData("Int64FieldLessThanValue", NumberExpressions.Int64FieldLessThanValue, $@"ent => (ent.{nameof(Person.CreatorUserId)} < Convert(100, Nullable`1))")]
        [InlineData("Int64FieldLessThanOrEqualToValue", NumberExpressions.Int64FieldLessThanOrEqualToValue, $@"ent => (ent.{nameof(Person.CreatorUserId)} <= Convert(100, Nullable`1))")]
        [InlineData("Int64FieldGreaterThanValue", NumberExpressions.Int64FieldGreaterThanValue, $@"ent => (ent.{nameof(Person.CreatorUserId)} > Convert(100, Nullable`1))")]
        [InlineData("Int64FieldGreaterThanOrEqualToValue", NumberExpressions.Int64FieldGreaterThanOrEqualToValue, $@"ent => (ent.{nameof(Person.CreatorUserId)} >= Convert(100, Nullable`1))")]
        [InlineData("Int32FieldEqualsInt64Value", NumberExpressions.Int32FieldEqualsInt64Value, $@"ent => (ent.IntProp == 100)")]
        [InlineData("NullableInt32FieldEqualsInt64Value", NumberExpressions.NullableInt32FieldEqualsInt64Value, $@"ent => (ent.NullableIntProp == Convert(100, Nullable`1))")]
        public void Numbers_Conversion(string name, string jsonLogicExpression, string expectation)
        {
            Console.WriteLine($"Test: '{name}'");

            var linqExpression = ConvertToExpression<PersonWithCustomProps>(jsonLogicExpression);
            Assert.Equal(expectation, linqExpression?.ToInvariantString());
        }

        [Theory]
        [InlineData("Equal", NumberExpressions.FieldEqualToValue, NumberExpressions.FieldEqualToValue_linq)]
        [InlineData("NotEqual", NumberExpressions.FieldNotEqualToValue, NumberExpressions.FieldNotEqualToValue_linq)]
        [InlineData("Greater", NumberExpressions.FieldGreaterThanValue, NumberExpressions.FieldGreaterThanValue_linq)]
        [InlineData("GreaterOrEqual", NumberExpressions.FieldGreaterOrEqualToValue, NumberExpressions.FieldGreaterOrEqualToValue_linq)]
        [InlineData("Less", NumberExpressions.FieldLessThanValue, NumberExpressions.FieldLessThanValue_linq)]
        [InlineData("LessOrEqual", NumberExpressions.FieldLessOrEqualToValue, NumberExpressions.FieldLessOrEqualToValue_linq)]
        [InlineData("Between", NumberExpressions.FieldBetweenValues, NumberExpressions.FieldBetweenValues_linq)]
        [InlineData("NotBetween", NumberExpressions.FieldNotBetweenValues, NumberExpressions.FieldNotBetweenValues_linq)]
        public void Decimal_Conversion(string name, string jsonLogicExpression, string expectation)
        {
            Console.WriteLine($"Test: '{name}'");

            var linqExpression = ConvertToExpression<EntityWithNumericProp<decimal>>(jsonLogicExpression);
            Assert.Equal(expectation, linqExpression?.ToInvariantString());
        }

        [Theory]
        [InlineData("Equal", NumberExpressions.FieldEqualToValue, NumberExpressions.FieldEqualToValue_linq)]
        [InlineData("NotEqual", NumberExpressions.FieldNotEqualToValue, NumberExpressions.FieldNotEqualToValue_linq)]
        [InlineData("Greater", NumberExpressions.FieldGreaterThanValue, NumberExpressions.FieldGreaterThanValue_linq)]
        [InlineData("GreaterOrEqual", NumberExpressions.FieldGreaterOrEqualToValue, NumberExpressions.FieldGreaterOrEqualToValue_linq)]
        [InlineData("Less", NumberExpressions.FieldLessThanValue, NumberExpressions.FieldLessThanValue_linq)]
        [InlineData("LessOrEqual", NumberExpressions.FieldLessOrEqualToValue, NumberExpressions.FieldLessOrEqualToValue_linq)]
        [InlineData("Between", NumberExpressions.FieldBetweenValues, NumberExpressions.FieldBetweenValues_linq)]
        [InlineData("NotBetween", NumberExpressions.FieldNotBetweenValues, NumberExpressions.FieldNotBetweenValues_linq)]
        public void Float_Conversion(string name, string jsonLogicExpression, string expectation)
        {
            Console.WriteLine($"Test: '{name}'");

            var linqExpression = ConvertToExpression<EntityWithNumericProp<float>>(jsonLogicExpression);
            Assert.Equal(expectation, linqExpression?.ToInvariantString());
        }

        [Theory]
        [InlineData("Equal", NumberExpressions.FieldEqualToValue, NumberExpressions.FieldEqualToValue_linq)]
        [InlineData("NotEqual", NumberExpressions.FieldNotEqualToValue, NumberExpressions.FieldNotEqualToValue_linq)]
        [InlineData("Greater", NumberExpressions.FieldGreaterThanValue, NumberExpressions.FieldGreaterThanValue_linq)]
        [InlineData("GreaterOrEqual", NumberExpressions.FieldGreaterOrEqualToValue, NumberExpressions.FieldGreaterOrEqualToValue_linq)]
        [InlineData("Less", NumberExpressions.FieldLessThanValue, NumberExpressions.FieldLessThanValue_linq)]
        [InlineData("LessOrEqual", NumberExpressions.FieldLessOrEqualToValue, NumberExpressions.FieldLessOrEqualToValue_linq)]
        [InlineData("Between", NumberExpressions.FieldBetweenValues, NumberExpressions.FieldBetweenValues_linq)]
        [InlineData("NotBetween", NumberExpressions.FieldNotBetweenValues, NumberExpressions.FieldNotBetweenValues_linq)]
        public void Double_Conversion(string name, string jsonLogicExpression, string expectation)
        {
            Console.WriteLine($"Test: '{name}'");

            var linqExpression = ConvertToExpression<EntityWithNumericProp<double>>(jsonLogicExpression);
            Assert.Equal(expectation, linqExpression?.ToInvariantString());
        }

        [Theory]
        [InlineData("Equal", NumberExpressions.FieldEqualToValue, NumberExpressions.FieldEqualToValue_linq)]
        [InlineData("NotEqual", NumberExpressions.FieldNotEqualToValue, NumberExpressions.FieldNotEqualToValue_linq)]
        [InlineData("Greater", NumberExpressions.FieldGreaterThanValue, NumberExpressions.FieldGreaterThanValue_linq)]
        [InlineData("GreaterOrEqual", NumberExpressions.FieldGreaterOrEqualToValue, NumberExpressions.FieldGreaterOrEqualToValue_linq)]
        [InlineData("Less", NumberExpressions.FieldLessThanValue, NumberExpressions.FieldLessThanValue_linq)]
        [InlineData("LessOrEqual", NumberExpressions.FieldLessOrEqualToValue, NumberExpressions.FieldLessOrEqualToValue_linq)]
        [InlineData("Between", NumberExpressions.FieldBetweenValues, NumberExpressions.FieldBetweenValues_linq)]
        [InlineData("NotBetween", NumberExpressions.FieldNotBetweenValues, NumberExpressions.FieldNotBetweenValues_linq)]
        public void Byte_Conversion(string name, string jsonLogicExpression, string expectation)
        {
            Console.WriteLine($"Test: '{name}'");

            var linqExpression = ConvertToExpression<EntityWithNumericProp<byte>>(jsonLogicExpression);
            Assert.Equal(expectation, linqExpression?.ToInvariantString());
        }

        #endregion

        #region datetime

        [Theory]
        [InlineData("Equal", DateTimeExpressions.Equal, "ent => (ent.LastModificationTime == Convert(ent.CreationTime, Nullable`1))")]
        [InlineData("NotEqual", DateTimeExpressions.NotEqual, "ent => Not((ent.LastModificationTime == Convert(ent.CreationTime, Nullable`1)))")]
        [InlineData("Greater", DateTimeExpressions.Greater, "ent => (ent.LastModificationTime > Convert(ent.CreationTime, Nullable`1))")]
        [InlineData("GreaterOrEqual", DateTimeExpressions.GreaterOrEqual, "ent => (ent.LastModificationTime >= Convert(ent.CreationTime, Nullable`1))")]
        [InlineData("Less", DateTimeExpressions.Less, "ent => (ent.LastModificationTime < Convert(ent.CreationTime, Nullable`1))")]
        [InlineData("LessOrEqual", DateTimeExpressions.LessOrEqual, "ent => (ent.LastModificationTime <= Convert(ent.CreationTime, Nullable`1))")]
        [InlineData("Between", DateTimeExpressions.Between, "ent => ((Convert(ent.CreationTime, Nullable`1) <= ent.LastModificationTime) AndAlso (ent.LastModificationTime <= ent.DeletionTime))")]
        [InlineData("NotBetween", DateTimeExpressions.NotBetween, "ent => Not(((Convert(ent.CreationTime, Nullable`1) <= ent.LastModificationTime) AndAlso (ent.LastModificationTime <= ent.DeletionTime)))")]
        [InlineData("NullableFieldLessThanValue", DateTimeExpressions.NullableFieldLessThanValue, "ent => (ent.NullableDateTimeProp < Convert(04/25/2021 06:13:00, Nullable`1))")]
        [InlineData("NullableFieldLessThanOrEqualsToValue", DateTimeExpressions.NullableFieldLessThanOrEqualsToValue, "ent => (ent.NullableDateTimeProp <= Convert(04/25/2021 06:13:59, Nullable`1))")]
        [InlineData("NullableFieldGreaterThanValue", DateTimeExpressions.NullableFieldGreaterThanValue, "ent => (ent.NullableDateTimeProp > Convert(04/25/2021 06:13:59, Nullable`1))")]
        [InlineData("NullableFieldGreaterThanOrEqualsToValue", DateTimeExpressions.NullableFieldGreaterThanOrEqualsToValue, "ent => (ent.NullableDateTimeProp >= Convert(04/25/2021 06:13:00, Nullable`1))")]
        [InlineData("NullableFieldEqualsToValue", DateTimeExpressions.NullableFieldEqualsToValue, "ent => ((Convert(04/25/2021 06:13:00, Nullable`1) <= ent.NullableDateTimeProp) AndAlso (ent.NullableDateTimeProp <= Convert(04/25/2021 06:13:59, Nullable`1)))")]
        [InlineData("NullableFieldNotEqualsToValue", DateTimeExpressions.NullableFieldNotEqualsToValue, "ent => Not(((Convert(04/25/2021 06:13:00, Nullable`1) <= ent.NullableDateTimeProp) AndAlso (ent.NullableDateTimeProp <= Convert(04/25/2021 06:13:59, Nullable`1))))")]
        [InlineData("NullableFieldBetweenValues", DateTimeExpressions.NullableFieldBetweenValues, "ent => ((ent.CreationTime >= 08/01/2022 16:46:00) AndAlso (ent.CreationTime <= 08/04/2022 16:47:59))")]
        public void DateTime_Conversion(string name, string jsonLogicExpression, string expectation)
        {
            Console.WriteLine($"Test: '{name}'");

            var linqExpression = ConvertToExpression<PersonWithCustomProps>(jsonLogicExpression);
            Assert.Equal(expectation, linqExpression?.ToInvariantString());
        }

        #endregion

        #region date

        [Theory]
        [InlineData("FieldLessThanValue", DateExpressions.FieldLessThanValue, @"ent => (ent.DateProp < 04/25/2021 00:00:00)")]
        [InlineData("FieldLessThanOrEqualsToValue", DateExpressions.FieldLessThanOrEqualsToValue, @"ent => (ent.DateProp <= 04/25/2021 23:59:59)")]
        [InlineData("FieldGreaterThanValue", DateExpressions.FieldGreaterThanValue, @"ent => (ent.DateProp > 04/25/2021 23:59:59)")]
        [InlineData("FieldGreaterThanOrEqualsToValue", DateExpressions.FieldGreaterThanOrEqualsToValue, @"ent => (ent.DateProp >= 04/25/2021 00:00:00)")]
        [InlineData("FieldEqualsToValue", DateExpressions.FieldEqualsToValue, @"ent => ((04/25/2021 00:00:00 <= ent.DateProp) AndAlso (ent.DateProp <= 04/25/2021 23:59:59))")]
        [InlineData("FieldNotEqualsToValue", DateExpressions.FieldNotEqualsToValue, @"ent => Not(((04/25/2021 00:00:00 <= ent.DateProp) AndAlso (ent.DateProp <= 04/25/2021 23:59:59)))")]
        [InlineData("FieldBetweenValues", DateExpressions.FieldBetweenValues, @"ent => ((ent.DateProp >= 08/01/2022 00:00:00) AndAlso (ent.DateProp <= 08/04/2022 23:59:59))")]
        public void Date_Conversion(string name, string jsonLogicExpression, string expectation)
        {
            Console.WriteLine($"Test: '{name}'");

            var linqExpression = ConvertToExpression<PersonWithCustomProps>(jsonLogicExpression);
            Assert.Equal(expectation, linqExpression?.ToInvariantString());
        }


        [Fact]
        public void Date_CustomFuncs_Conversion()
        {
            using (FreezeTime())
            {
                var expression = ConvertToExpression<Person>(DateExpressions.CustomDateAddFunction);

                // todo: find a way to use start of the minute here
                var now = Expression.Constant(Clock.Now).ToString();
                // note: use end of minute because we skip seconds for datetime values
                var nowEom = Expression.Constant(Clock.Now.EndOfTheMinute()).ToString();

                var expected = $@"ent => ((Convert({now}.Add(-5.00:00:00), Nullable`1) <= ent.User.LastLoginDate) AndAlso (ent.User.LastLoginDate <= Convert({nowEom}, Nullable`1)))";
                Assert.Equal(expected, expression?.ToInvariantString());
            }
        }

        #endregion

        #region time

        [Theory]
        [InlineData("FieldLessThanValue", TimeExpressions.FieldLessThanValue, @"ent => (ent.TimeProp < 02:34:00)")]
        [InlineData("FieldLessThanOrEqualsToValue", TimeExpressions.FieldLessThanOrEqualsToValue, @"ent => (ent.TimeProp <= 02:34:59.9990000)")]
        [InlineData("FieldGreaterThanValue", TimeExpressions.FieldGreaterThanValue, @"ent => (ent.TimeProp > 02:34:59.9990000)")]
        [InlineData("FieldGreaterThanOrEqualsToValue", TimeExpressions.FieldGreaterThanOrEqualsToValue, @"ent => (ent.TimeProp >= 02:34:00)")]
        [InlineData("FieldEqualsToValue", TimeExpressions.FieldEqualsToValue, @"ent => ((02:34:00 <= ent.TimeProp) AndAlso (ent.TimeProp <= 02:34:59.9990000))")]
        [InlineData("FieldNotEqualsToValue", TimeExpressions.FieldNotEqualsToValue, @"ent => Not(((02:34:00 <= ent.TimeProp) AndAlso (ent.TimeProp <= 02:34:59.9990000)))")]
        [InlineData("FieldBetweenValue", TimeExpressions.FieldBetweenValue, @"ent => ((ent.TimeProp >= 01:00:00) AndAlso (ent.TimeProp <= 02:00:59.9990000))")]
        public void Time_Conversion(string name, string jsonLogicExpression, string expectation)
        {
            Console.WriteLine($"Test: '{name}'");

            var linqExpression = ConvertToExpression<PersonWithCustomProps>(jsonLogicExpression);
            Assert.Equal(expectation, linqExpression?.ToInvariantString());
        }

        #endregion

        #region bool

        [Theory]
        [InlineData("Equal", BoolExpressions.Equal, @"ent => (ent.User.OtpEnabled == ent.User.IsActive)")]
        [InlineData("NotEqual", BoolExpressions.NotEqual, @"ent => Not((ent.User.OtpEnabled == ent.User.IsActive))")]
        [InlineData("EqualsToValue", BoolExpressions.EqualsToValue, $@"ent => (ent.User.OtpEnabled == True)")]
        [InlineData("NotEqualsToValue", BoolExpressions.NotEqualsToValue, $@"ent => Not((ent.User.OtpEnabled == True))")]
        public void Bool_Conversion(string name, string jsonLogicExpression, string expectation)
        {
            Console.WriteLine($"Test: '{name}'");

            var linqExpression = ConvertToExpression<PersonWithCustomProps>(jsonLogicExpression);
            Assert.Equal(expectation, linqExpression?.ToInvariantString());
        }

        #endregion

        #region entity

        [Theory]
        [InlineData("Equal", EntityExpressions.Equal, @"ent => (ent.Address == ent.WorkAddress)")]
        [InlineData("NotEqual", EntityExpressions.NotEqual, @"ent => Not((ent.Address == ent.WorkAddress))")]
        [InlineData("FieldInValues", EntityExpressions.FieldInValues, @"ent => ((ent.Id == ""24007BA5-697B-417C-91BA-ED92F3F31F3A"".ToGuid()) OrElse (ent.Id == ""D197A7B3-5505-430C-9D98-CD64F1A638FA"".ToGuid()))")]
        [InlineData("FieldIsNotNull", EntityExpressions.FieldIsNotNull, $@"ent => Not((ent.Address == null))")]
        [InlineData("FieldIsNull", EntityExpressions.FieldIsNull, $@"ent => (ent.Address == null)")]
        [InlineData("FieldIsEmpty", EntityExpressions.FieldIsEmpty, @"ent => (ent.Address == null)")]
        [InlineData("FieldWithIntIdEqualsToValue", EntityExpressions.FieldWithIntIdEqualsToValue, $@"ent => (ent.User.Id == 500)")]
        [InlineData("FieldEqualToValue", EntityExpressions.FieldEqualToValue, $@"ent => (ent.Address.Id == ""852c4011-4e94-463a-9e0d-b0054ab88f7d"".ToGuid())")]
        public void EntityReference_Conversion(string name, string jsonLogicExpression, string expectation)
        {
            Console.WriteLine($"Test: '{name}'");

            var linqExpression = ConvertToExpression<Person>(jsonLogicExpression);
            Assert.Equal(expectation, linqExpression?.ToInvariantString());
        }

        #endregion

        #region complex expressions

        [Theory]
        [InlineData("NestedStringFieldEquals", ComplexExpressions.NestedStringFieldEquals, @"ent => (ent.User.UserName == ""admin"")")]
        [InlineData("NestedEntityFieldEquals", ComplexExpressions.NestedEntityFieldEquals, @"ent => (ent.PrimaryOrganisation.PrimaryAddress.Id == ""D80526AB-BB64-41FA-BFB8-F74A9332C0CA"".ToGuid())")]
        public void NestedColumnResolver_Convert(string name, string jsonLogicExpression, string expectation)
        {
            Console.WriteLine($"Test: '{name}'");

            var linqExpression = ConvertToExpression<Person>(jsonLogicExpression);
            Assert.Equal(expectation, linqExpression?.ToInvariantString());
        }

        [Fact]
        public void ComplexExpression_Conversion()
        {
            var expression = ConvertToExpression<ShaRolePermission>(ComplexExpressions.OrAndCombination);

            Assert.Equal("ent => ((ent.ShaRole.Id == \"852c4011-4e94-463a-9e0d-b0054ab88f7d\".ToGuid()) OrElse ((ent.ShaRole.LastModificationTime > Convert(04/25/2021 08:13:59, Nullable`1)) AndAlso (ent.IsGranted == False)))", expression?.ToInvariantString());
        }

        #endregion
    }
}
