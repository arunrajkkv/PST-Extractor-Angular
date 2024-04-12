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
    clickedData: any;
    messageArray: any = [];
    tempMessageArray: any = [];
    isShowContentData = false;
    isShowFolderView = false;
    modalData: any = {};
    headerData: any = {};
    fileName: string = '';
    imagesArray: any = [];
    contactsArray: any = [];
    messageDeliveryData: any = [];
    messageDeliveryDataIndex: number = -1;
    parsedHeaders: any = {};
    receivedList: any = [];
    searchWord: any;
    isShowSignalView: boolean = false;
    parsedHeaderStringArray: any = [];
    currentTab: string = '';
    serversList: any = [];
    senderEmail: any;
    recipientEmail: any;
    authenticatedBits: any;
    isAuthenticated: any;
    encryptionStatus: any;

    constructor(private _commonService: CommonService) { }

    ngOnInit() {
    }

    public getData(): void {
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
                    }
                },
                error => {
                    console.log(error)
                    this.isShowFolderView = false;
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
            const uint8Array = new TextEncoder().encode(dateString);/* Convert the string to a Uint8Array */
            const timestamp = new DataView(uint8Array.buffer).getUint32(0, true);/* Extract the timestamp from the Uint8Array */
            const milliseconds = timestamp * 1000;/* Convert the timestamp to milliseconds */
            const date = new Date();/* Create a new Date object with the milliseconds */
            date.setTime(milliseconds);
            return date;
        } else {
            return '--No data--';
        }
    }

    public onClickTable(message: any, index: number) {
        this.imagesArray = [];
        this.messageDeliveryDataIndex = index;
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

    parseReceivedString(inputString: string) {
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

    onChangeSearch(): any {
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

    getDate(dateString: string): any {
        return (dateString) ? new Date(dateString) : '';
    }

    getParsedEmailHeader(emailHeaders: any) {
        const receivedHeaders = emailHeaders.match(/Received: (.*?)\n/g) || [];
        const lastReceivedHeader = receivedHeaders.length > 0 ? receivedHeaders[receivedHeaders.length - 1] : '';
        const senderRecipientMatch = lastReceivedHeader.match(/for <(.*?)>;.*by (.*?) \(/);
        this.senderEmail = senderRecipientMatch ? senderRecipientMatch[1] : null;
        this.recipientEmail = senderRecipientMatch ? senderRecipientMatch[2] : null;
        const authenticatedMatch = lastReceivedHeader.match(/authenticated bits=(\d+)/);
        this.authenticatedBits = authenticatedMatch ? parseInt(authenticatedMatch[1]) : 0;
        this.isAuthenticated = this.authenticatedBits > 0;
        const encryptionMatch = lastReceivedHeader.match(/(TLS|SSL)/);
        this.encryptionStatus = encryptionMatch ? encryptionMatch[1] + ' ' + 'Encryption' : 'None';
    }
}
