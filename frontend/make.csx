#!/usr/bin/env dotnet-script
#r "nuget: SimpleExec, 7.0.0"
#r "nuget: Mono.Posix.NETStandard, 5.20.1-preview"

using static SimpleExec.Command;
using static System.Console;
using System.Threading;
using System.Threading.Tasks;
using Mono.Unix;
using Mono.Unix.Native;
using System.Collections.Specialized;

static var cancelSource = new CancellationTokenSource();
static CancellationToken cancelToken = cancelSource.Token;

static var apps = new string[] {
    "sass --embed-sources --source-map --source-map-urls absolute --watch ./styles:./dist/styles",
    "sass --load-path='./styles' --embed-sources --source-map --source-map-urls absolute --watch ./styles/elements:./dist/styles/elements",
    "tsc --build --watch tsconfig.json"
 };

static var tasks = new Dictionary<string, Task>();

static var signals = new UnixSignal[] {
                new UnixSignal(Signum.SIGINT),
                new UnixSignal(Signum.SIGTERM)
            };




for (var i = 0; i < apps.Length; i++)
{
    var task = RunAsync("npx", apps[i], cancellationToken: cancelToken);
    var name = apps[i].Split(' ')[0] + $"(tid:{task.Id})";
    WriteLine($"Starting task for: {name}");

    tasks.Add(name, task);
}
try
{
    var appTasks = tasks.ToArray();
    tasks.Add("watchdog", Task.Run(() =>
    {
        var index = UnixSignal.WaitAny(signals);
        var signal = signals[index].Signum;
        WriteLine("\nSignal caught: {0}", signal.ToString());
        cancelSource.Cancel();
    }));

    await Task.WhenAny(tasks.Values);

    foreach (var (name, task) in appTasks)
    {
        WriteLine($"Waiting for {name} to exit");
        try
        {
            task.Wait();
        }
        catch (AggregateException) { }
        catch (TaskCanceledException) { }
    }
}
catch (Exception) { }
finally
{
    cancelSource.Dispose();
}