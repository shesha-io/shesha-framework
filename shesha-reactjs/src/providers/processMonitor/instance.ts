import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { ILogEvent, IProcessMonitor, ProcessMonitorSubscriptionCallback, ProcessMonitorSubscriptionType, ProcessStateDto, ProcessStatus, SignalLogEventDto } from './interfaces';
import { HttpClientApi } from '@/publicJsApis/httpClient';
import moment from 'moment';
import { IAjaxResponse } from '@/interfaces';
import FileSaver from 'file-saver';
import { getFileNameFromResponse } from '@/utils/fetchers';
import { isAjaxSuccessResponse } from '@/interfaces/ajaxResponse';
import { mergeSortedEvents, parseLog4NetLine, parseLogLevel } from './utils';
import { buildUrl } from '@/utils/url';

export type ForceRenderFunc = () => void;

const URLS = {
    GET_PROCESS_STATE: "/api/services/app/ProcessMonitor/GetProcessState",
    DOWNLOAD_LOG: "/api/services/app/ProcessMonitor/DownloadLogFile",
};

export type ProcessMonitorInstanceArgs = {
    processType: string;
    processId: string;
    backendUrl: string;
    httpClient: HttpClientApi;
    forceRender: ForceRenderFunc;
};

export class ProcessMonitorInstance implements IProcessMonitor {
    private httpClient: HttpClientApi;
    private processType: string;
    private processId: string;
    private logEnabled: boolean = false;
    private _events: ILogEvent[] = [];
    private _status: ProcessStatus = 'idle';
    private _errorMessage: string | undefined = undefined;
    private _forceRender: ForceRenderFunc;
    connection: HubConnection;
    constructor({ processType, processId, httpClient, backendUrl, forceRender }: ProcessMonitorInstanceArgs) {
        this._forceRender = forceRender;
        this.processType = processType;
        this.processId = processId;
        this.httpClient = httpClient;
        //this.setLogEnabled(true);

        const connection = new HubConnectionBuilder()
            .withUrl(`${backendUrl}/signalr-appender`)
            .withAutomaticReconnect()
            .build();
        this.connection = connection;

        connection.on('LogEvent', this.onLogEvent);
        connection.on('JobStarted', this.onJobStarted);
        connection.on('JobFinished', this.onJobFinished);
        connection.on('JobFailed', this.onJobFailed);
        connection.on('JobCancelled', this.onJobCancelled);
    }

    clearLog = (): void => {
        this.updateEvents([]);
    };

    private subscriptions: Map<ProcessMonitorSubscriptionType, Set<ProcessMonitorSubscriptionCallback>> = new Map<ProcessMonitorSubscriptionType, Set<ProcessMonitorSubscriptionCallback>>();

    private getSubscriptions = (type: ProcessMonitorSubscriptionType): Set<ProcessMonitorSubscriptionCallback> => {
    const existing = this.subscriptions.get(type);
    if (existing)
        return existing;

    const subscriptions = new Set<ProcessMonitorSubscriptionCallback>();
    this.subscriptions.set(type, subscriptions);
    return subscriptions;
};
subscribe(type: ProcessMonitorSubscriptionType, callback: ProcessMonitorSubscriptionCallback): () => void {
    const callbacks = this.getSubscriptions(type);
    callbacks.add(callback);

    return() => this.unsubscribe(type, callback);
}

    private unsubscribe(type: ProcessMonitorSubscriptionType, callback: ProcessMonitorSubscriptionCallback): void {
    const callbacks = this.getSubscriptions(type);
    callbacks.delete(callback);
}

notifySubscribers(types: ProcessMonitorSubscriptionType[]): void {
    const allSubscriptions = new Set<ProcessMonitorSubscriptionCallback>();
    types.forEach((type) => {
        const subscriptions = this.getSubscriptions(type);
        subscriptions.forEach((s) => allSubscriptions.add(s));
    });

    allSubscriptions.forEach((s) => (s()));
}

setLogEnabled = (enabled: boolean): void => {
    this.logEnabled = enabled;
    // eslint-disable-next-line no-console
    this.log = this.logEnabled ? console.log : this.log;
};

log = (..._args: unknown[]): void => {
    // noop
};

onLogEvent = (data: SignalLogEventDto) => {
    this.log('LOG: 🚦 LogEvent', data);

    if (!data)
        return;
    const { level, message, timeStamp } = data;

    const event: ILogEvent = {
        id: Date.now(),
        message,
        level: parseLogLevel(level),
        timeStamp: timeStamp ? moment(timeStamp) : undefined
    };
    this.updateEvents([...this._events, event]);
};
onJobStarted = () => {
    this.log('LOG: JobStarted 🏃‍♂️');
    this.updateStatus('running');
    this._forceRender();
};
onJobFinished = () => {
    this.log('LOG: process finished 🏁');
    this.updateStatus('success');
    this._forceRender();
};
onJobFailed = (errorMessage: string) => {
    this.log('LOG: job failed ❌');
    this.updateStatus('failed', errorMessage);
    this._forceRender();
};
onJobCancelled = (errorMessage: string) => {
    this.log('LOG: job cancelled ✖');
    this.updateStatus('cancelled', errorMessage);
    this._forceRender();
};

startAsync = async (): Promise<void> => {
    try {
        void this.fetchProcessStateAsync();

        this.log('LOG: connecting...');
        await this.connection.start();
        this.log('LOG: connected ✅');
        if (this.processId)
            await this.connection.invoke('JoinGroup', this.processId);
    } catch (err) {
        console.error(err);
        throw err;
    }
};

parseLog = (rawLogText: string): ILogEvent[] => {
    const result: ILogEvent[] = [];

    const lines = rawLogText.split('\n');
    lines.forEach((line, idx) => {
        const event = parseLog4NetLine(line, idx);
        if (event) result.push(event);
    });

    return result;
};

fetchProcessStateAsync = async (): Promise<void> => {
    try {
        if (!this.processId)
            return;
        const url = buildUrl(URLS.GET_PROCESS_STATE, { processId: this.processId, processType: this.processType });
        const response = await this.httpClient.get<IAjaxResponse<ProcessStateDto>>(url);
        const { data } = response;
        if (isAjaxSuccessResponse(data)) {
            const events = this.parseLog(data.result.log ?? '');
            this.mergeEvents(events);
            this.updateStatus(data.result.status);
        } else {
            console.warn('Failed to fetch log events', data.error);
        }
    } catch (error) {
        console.error('Failed to fetch log events', error);
    }
};

mergeEvents = (events: ILogEvent[]): void => {
    const mergedEvents = mergeSortedEvents(this._events, events);
    this.updateEvents(mergedEvents);
};

downloadLogAsync = async (): Promise<void> => {
    if (!this.processId)
        throw new Error('No process id');
    const url = buildUrl(URLS.DOWNLOAD_LOG, { processId: this.processId, processType: this.processType });
    const response = await this.httpClient.get(url, { responseType: 'blob' });
    const fileName = getFileNameFromResponse(response) ?? 'execution.log';
    FileSaver.saveAs(new Blob([response.data]), fileName);
};

stopAsync = async (): Promise<void> => {
    try {
        this.log('LOG: stopping...');
        await this.connection.stop();
        this.log('LOG: stopped ☑');
    } catch (err) {
        console.error(err);
        throw err;
    }
};

    private updateEvents = (events: ILogEvent[]): void => {
    this._events = events;
    this.notifySubscribers(['events']);
};
    private updateStatus = (status: ProcessStatus, errorMessage?: string): void => {
    this._status = status;
    this._errorMessage = errorMessage;
    this.log('LOG: status updated', status);
    this.notifySubscribers(['status']);
};

    get status(): ProcessStatus {
    return this._status;
};
    get errorMessage(): string {
    return this._errorMessage;
};    
    get events(): ILogEvent[] {
    return this._events;
};
}