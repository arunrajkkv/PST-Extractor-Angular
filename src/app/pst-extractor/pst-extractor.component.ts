import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonService } from '../services/common.service';

@Component({
    selector: 'app-pst-extractor',
    templateUrl: './pst-extractor.component.html',
    styleUrls: ['./pst-extractor.component.css']
})
export class PstExtractorComponent implements OnInit {

    @ViewChild('exampleModal') exampleModal: any;

    extractedData: any = [];
    messageArray: any = [];
    tempMessageArray: any = [];
    modalData: any = {};
    headerData: any = {};
    fileName: string = '';
    imagesArray: any = [];
    contactsArray: any = [];
    messageDeliveryData: any = [];
    parsedHeaders: any = {};
    receivedList: any = [];
    searchWord: any;
    parsedHeaderStringArray: any = [];
    currentTab: string = '';
    serversList: any = [];
    senderEmail: any;
    recipientEmail: any;
    authenticatedBits: any;
    isAuthenticated: any;
    encryptionStatus: any;
    whoIsLookUpData: any = {
        senderDomainData: [], receiverDomainData: []
    };
    currentWhoIsTab: string = 'SENDER_TAB';
    dataReady: boolean = true;
    isShowContentData = false;
    isShowFolderView = false;
    isShowSignalView: boolean = false;
    isShowContentView: boolean = false;
    isShowWhoIsView: boolean = false;

    constructor(private _commonService: CommonService) { }

    ngOnInit() {
    }

    public getData(): void {
        this.dataReady = false;
        if (this.fileName) {
            let directoryPath = 'D:\\others\\pst files\\';
            const FILE = directoryPath + this.fileName;
            this._commonService.getExtractedData(FILE).subscribe(
                (response: any) => {
                    if (response) {
                        this.extractedData = response;
                        this.currentTab = this.extractedData[0].folder_name;
                        this.onClickFolder(this.extractedData[0]);
                        this.isShowFolderView = true;
                        this.dataReady = true;
                    }
                },
                error => {
                    console.log(error)
                    this.isShowFolderView = false;
                    this.dataReady = true;
                });
        } else {
            alert('Please choose a valid pst file');
        }
    }

    public onClickFolder(data: any): void {
        this.currentTab = '';
        this.currentTab = data.folder_name;
        this.headerData = [];
        this.messageDeliveryData = [];
        this.headerData = data.header_data;
        this.messageDeliveryData = data.message_delivery_data;
        if (data.contacts && data.contacts.length > 0) {
            this.contactsArray = data.contacts;
        } else {
            this.contactsArray = [];
            this.isShowContentData = true;
            this.messageArray = [];
            this.messageArray = data.messages || [];
            this.tempMessageArray = JSON.parse(JSON.stringify(this.messageArray));
        }
    }

    public onSelectPstFile(event: any): void {
        this.fileName = event ? event.srcElement.files[0].name : '';
    }

    public convertToDateObject(dateString: string): any {
        if (dateString) {
            const UNIT_8_ARRAY = new TextEncoder().encode(dateString);/* Convert the string to a Uint8Array */
            const TIMESTAMP = new DataView(UNIT_8_ARRAY.buffer).getUint32(0, true);/* Extract the timestamp from the Uint8Array */
            const milliseconds = TIMESTAMP * 1000;/* Convert the timestamp to milliseconds */
            const DATE = new Date();/* Create a new Date object with the milliseconds */
            DATE.setTime(milliseconds);
            return DATE;
        } else {
            return '--No data--';
        }
    }

    public onClickTable(message: any, index: number): void {
        this.setBooleanForViews(true, false, false);
        this.imagesArray = [];
        this.modalData = message;
        this.parseHeaders(this.messageDeliveryData[index].headers);
        this.getParsedEmailHeader(this.modalData.message_delivery_data.headers)
        this.parsedHeaderStringArray = this.parseHeadersToMailSignalFormat(this.messageDeliveryData[index].headers);
        this.serversList = this.getServersList(this.getParsedArrayListWithNewLine())
        if (message && message.images.length > 0) {
            this.imagesArray = message.images;
        }
    }

    private getParsedArrayListWithNewLine(): string {
        return this.parsedHeaderStringArray.join('\n');
    }

    private getServersList(inputString: any): any {
        const LINES = inputString.split('\n');
        const SERVERS: any = [];
        LINES.forEach((line: any) => {
            const MATCH = line.match(/from\s(.*?)\s\((.*?)\)/);
            if (MATCH) {
                const SERVER_NAME = MATCH[1];
                const IP_ADDRESS = MATCH[2];
                SERVERS.push({ serverName: SERVER_NAME, ipAddress: IP_ADDRESS });
            }
        });
        return SERVERS;
    }

    private parseHeaders(headersString: string): void {
        const MESSAGE_ID_PATTERN = /Message-Id:\s*(.*)/i;
        const RECEIVED_PATTERN = /Received:\s*(.*)/i;
        const HEADER_LIST = headersString.split('\n');
        HEADER_LIST.forEach(header => {
            if (header.startsWith('Message-Id:')) {
                const match = header.match(MESSAGE_ID_PATTERN);
                if (match) {
                    this.parsedHeaders['Message-Id'] = match[1].trim();
                }
            }
            if (header.startsWith('Received:')) {
                const match = header.match(RECEIVED_PATTERN);
                if (match) {
                    this.parsedHeaders['Received'] = match[1].trim();
                }
            }
        });
        this.receivedList = this.parseReceivedString(this.parsedHeaders['Received']);
    }

    private parseHeadersToMailSignalFormat(headerString: string): any {
        const HEADERS = headerString.split("\n\n");
        let headerStringArray: any = [];
        HEADERS.forEach(header => {
            const FIELDS = header.split("\t");
            FIELDS.forEach(field => { headerStringArray.push(field.trim()); });
        });
        return headerStringArray;
    }

    private parseReceivedString(inputString: string): any {
        let headers = inputString.split("\n");
        let parsedHeaders: any = [];
        headers.forEach(header => {
            let receivedRegex = /from\s+([^ ]+)\s+\(([^)]+)\)\s+by\s+([^ ]+)\s+\(([^)]+)\)\s+with\s+ESMTP\s+id\s+([^;]+);\s+(.*?),/g;
            const TIMESTAMP_REGEX = /(\w+,\s+\d+\s+\w+\s+\d+)\s+(\d+:\d+:\d+\s+[+-]\d+)/;
            const TIMESTAMP_MATCHES: any = TIMESTAMP_REGEX.exec(inputString);
            const MATCHES = receivedRegex.exec(header);
            if (MATCHES) {
                parsedHeaders.push({
                    senderDomain: MATCHES[1],
                    senderIP: MATCHES[2],
                    receiverDomain: MATCHES[3],
                    receivingServer: MATCHES[4],
                    id: MATCHES[5],
                    timestamp: MATCHES[6],
                    dateAndTime: TIMESTAMP_MATCHES[0],
                    date: TIMESTAMP_MATCHES[1],
                    timeAndTimeZone: TIMESTAMP_MATCHES[2]
                });
            }
        });
        return parsedHeaders;
    }

    public onChangeSearch(): any {
        if (this.searchWord) {
            this.messageArray = this.tempMessageArray.filter((item: any) => {
                for (let key in item) {
                    if (item[key] && item[key].toString().toLowerCase().includes(this.searchWord.toLowerCase())) {
                        return true;
                    }
                }
                return false;
            });
        } else {
            this.messageArray = this.tempMessageArray;
        }
    }

    public getSentReceivedTimes(timeType: string, header: string): any {
        const TIME_REGEX = /(\d{1,2} \w{3} \d{4} \d{2}:\d{2}:\d{2})/g;
        const TIME_DATA = header.match(TIME_REGEX);
        if (TIME_DATA && TIME_DATA.length >= 2) {
            return timeType === 'sentTime' ? new Date(TIME_DATA[0]) : new Date(TIME_DATA[1]);
        }
    }

    private getParsedEmailHeader(emailHeaders: any): void {
        const RECEIVED_HEADERS = emailHeaders.match(/Received: (.*?)\n/g) || [];
        const LAST_RECEIVED_HEADER = RECEIVED_HEADERS.length > 0 ? RECEIVED_HEADERS[RECEIVED_HEADERS.length - 1] : '';
        const SENDER_RECIPIENT_MATCH = LAST_RECEIVED_HEADER.match(/for <(.*?)>;.*by (.*?) \(/);
        this.senderEmail = SENDER_RECIPIENT_MATCH ? SENDER_RECIPIENT_MATCH[1] : null;
        this.recipientEmail = SENDER_RECIPIENT_MATCH ? SENDER_RECIPIENT_MATCH[2] : null;
        const AUTHENTICATED_MATCH = LAST_RECEIVED_HEADER.match(/authenticated bits=(\d+)/);
        this.authenticatedBits = AUTHENTICATED_MATCH ? parseInt(AUTHENTICATED_MATCH[1]) : 0;
        this.isAuthenticated = this.authenticatedBits > 0;
        const ENCRYPTION_MATCH = LAST_RECEIVED_HEADER.match(/(TLS|SSL)/);
        this.encryptionStatus = ENCRYPTION_MATCH ? ENCRYPTION_MATCH[1] + ' ' + 'Encryption' : 'None';
    }

    public onClickWhoIsLookUpView(): void {
        this.getWhoIsData('SENDER');
    }

    public getWhoIsData(dataType: string): void {
        dataType === 'SENDER' ? this.getWhoIsForSenderDomain() : this.getWhoIsForReceiverDomain();
    }

    private getWhoIsForSenderDomain(): void {
        this.dataReady = false;
        this._commonService.getWhoIsLookUpData(this.receivedList[0].senderDomain).subscribe(
            (response: any) => {
                if (response) {
                    this.whoIsLookUpData.senderDomainData.push(response);
                    this.dataReady = true;
                }
            },
            (error: any) => {
                console.log(error)
                this.dataReady = true;
            });
    }

    private getWhoIsForReceiverDomain(): void {
        this.dataReady = false;
        this._commonService.getWhoIsLookUpData(this.receivedList[0].receiverDomain).subscribe(
            (response: any) => {
                if (response) {
                    this.whoIsLookUpData.receiverDomainData.push(response);
                    this.dataReady = true;
                }
            },
            (error: any) => {
                console.log(error)
                this.dataReady = true;
            });
    }

    public setBooleanForViews(content: boolean, signal: boolean, whoIs: boolean) {
        this.isShowContentView = content;
        this.isShowSignalView = signal;
        this.isShowWhoIsView = whoIs;
    }
}
