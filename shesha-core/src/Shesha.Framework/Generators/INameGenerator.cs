using System;
using System.Reflection;

namespace Shesha.Generators
{
    public interface INameGenerator
    {
        string AutoGeneratorDbSchema { get; set; }
        
        int MaxLenght { get; set; }

        GeneratorMaxLengthActionEnum MaxLengthAction { get; set; }

        string GetTablePrefix(Type type);

        (string tableName, string parentTableName, string childTableName, string parentColumnName, string childColumnName)
            GetAutoManyToManyTableNames(MemberInfo propertyInfo);

        (string tableName, string parentTableName, string childTableName, string parentColumnName, string childColumnName)
            GetManyToManyTableNames(MemberInfo propertyInfo, string prefix, string suffix = "");

        string Join(string[] parts);
    }


}
