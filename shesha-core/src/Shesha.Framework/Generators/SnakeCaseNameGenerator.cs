using Abp.Dependency;
using Shesha.Domain;
using Shesha.Reflection;
using Shesha.Utilities;
using System;
using System.Linq;
using System.Reflection;

namespace Shesha.Generators
{
    public class SnakeCaseNameGenerator : INameGenerator, ISingletonDependency
    {
        public string AutoGeneratorDbSchema { get; set; } = MappingHelper.AutoGeneratorSchema;
        public int MaxLenght { get; set; } = 63;
        public GeneratorMaxLengthActionEnum MaxLengthAction { get; set; } = GeneratorMaxLengthActionEnum.ThrowError;

        public virtual string GetTablePrefix(Type type)
        {
            return MappingHelper.GetTablePrefix(type);
        }

        public virtual (string tableName, string parentTableName, string childTableName, string parentColumnName, string childColumnName)
            GetAutoManyToManyTableNames(MemberInfo propertyInfo)
        {
            return GetManyToManyTableNames(propertyInfo, null, "ref");
        }

        public virtual (string tableName, string parentTableName, string childTableName, string parentColumnName, string childColumnName)
            GetManyToManyTableNames(MemberInfo propertyInfo, string? prefix = null, string? suffix = null)
        {

            var (parentType, parentIdType, childType, childIdType) = MappingHelper.GetManyToManyTableData(propertyInfo);
            var tablePrefix = (prefix ?? GetTablePrefix(parentType) ?? "").TrimEnd('_');
            var parentTypeName = parentType.Name;
            var propertyName = propertyInfo.Name;
            var suffixLength = string.IsNullOrWhiteSpace(suffix) ? 0 : suffix.Length + 1;

            var tableName = GetSnakeCaseText(new[] {tablePrefix, parentTypeName, propertyName}, MaxLenght - suffixLength) + (suffixLength == 0 ? "" : $"_{suffix}").ToSnakeCase();

            var childTypeName = childType.Name.ToSnakeCase();
            var parentColumnName = GetSnakeCaseText(new[] { parentTypeName }, MaxLenght - 3) + "_id";
            var parentTableName = MappingHelper.GetTableName(parentType);
            var childColumnName = GetSnakeCaseText(new[] { childTypeName }, MaxLenght - 3) + "_id";
            var childTableName = MappingHelper.GetTableName(childType);

            return (tableName, parentTableName, childTableName, parentColumnName, childColumnName);
        }

        private string GetSnakeCaseText(string[] parts, int? lenght = null)
        {
            var maxLenght = lenght ?? MaxLenght;
            var snakeParts = parts.Select(x => x.ToSnakeCase()).ToArray();
            var res = string.Join("_",  snakeParts);
            if (res.Length > maxLenght)
            {
                switch (MaxLengthAction)
                {
                    case GeneratorMaxLengthActionEnum.ThrowError:
                        throw new ArgumentOutOfRangeException($"Lenght of '{res}' is more than {maxLenght}");
                    case GeneratorMaxLengthActionEnum.TrimRight:
                        return res.Substring(0, maxLenght);
                    case GeneratorMaxLengthActionEnum.TrimParts:
                        return parts.SnakeCaseTrim(maxLenght).NotNullOrWhiteSpace();
                    case GeneratorMaxLengthActionEnum.TrimWords:
                        return res.SnakeCaseTrim(maxLenght).NotNullOrWhiteSpace();
                }
            }
            return res;
        }

        public virtual string Join(string[] parts)
        {
            throw new NotImplementedException();
        }
    }
}
