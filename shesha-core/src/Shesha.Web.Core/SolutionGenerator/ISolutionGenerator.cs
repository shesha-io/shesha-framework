using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Shesha.Tests.SolutionGenerator
{
    /// <summary>
    /// Solution generator. Replaces standard tags in the file names and file content
    /// </summary>
    public interface ISolutionGenerator
    {
        // d:\Boxfusion\Shesha3\opensource\shesha-core-starter\
        Task GenerateAsync(string sourcePath, string destination, Dictionary<string, string> tags, Func<string, bool> includePathCondition, CancellationToken cancellationToken);
    }
}
