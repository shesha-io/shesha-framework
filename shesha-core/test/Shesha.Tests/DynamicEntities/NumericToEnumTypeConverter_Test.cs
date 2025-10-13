using AutoMapper;
using Shesha.Domain.Enums;
using Shesha.DynamicEntities.Mapper;
using Shesha.Tests.Fixtures;
using System;
using Xunit;

namespace Shesha.Tests.DynamicEntities
{
    [Collection(SqlServerCollection.Name)]
    public class NumericToEnumTypeConverter_Test : SheshaNhTestBase
    {
        public NumericToEnumTypeConverter_Test(SqlServerFixture fixture) : base(fixture)
        {
        }

        [Fact]
        public void ConvertInt64ToPersonTitle_Test()
        {
            Int64 source = 1;

            var mapper = GetMapper<Int64, RefListPersonTitle>();
            var destination = mapper.Map<RefListPersonTitle>(source);

            Assert.Equal(RefListPersonTitle.Mr, destination);
        }

        #region

        private IMapper GetMapper<TSrc, TDst>() where TDst: Enum
        {
            var mapperConfiguration = new MapperConfiguration(c => {
                c.CreateMap(typeof(TSrc), typeof(TDst)).ConvertUsing(typeof(NumericToEnumTypeConverter<TSrc, TDst>));
            });
            return new Mapper(mapperConfiguration);
        }

        #endregion

        [Fact]
        public void ConvertInt64ToIntEnum_Test()
        {
            Int64 source = 1;
            var mapper = GetMapper<Int64, IntItems>();
            var destination  = mapper.Map<IntItems>(source);

            Assert.Equal(IntItems.Value1, destination);
        }

        [Fact]
        public void ConvertInt64ToInt64Enum_Test()
        {
            Int64 source = 1;

            var mapper = GetMapper<Int64, Int64Items>();
            var destination = mapper.Map<Int64Items>(source);

            Assert.Equal(Int64Items.Value1, destination);
        }

        [Fact]
        public void ConvertInt64ToByteEnum_Test()
        {
            Int64 source = 1;

            var mapper = GetMapper<Int64, ByteItems>();
            var destination = mapper.Map<ByteItems>(source);

            Assert.Equal(ByteItems.Value1, destination);
        }

        public enum IntItems : int 
        { 
            Value1 = 1,
            Value2 = 2,
        }

        public enum ByteItems : byte
        {
            Value1 = 1,
            Value2 = 2,
        }

        public enum Int64Items : Int64
        {
            Value1 = 1,
            Value2 = 2,
        }
    }
}
