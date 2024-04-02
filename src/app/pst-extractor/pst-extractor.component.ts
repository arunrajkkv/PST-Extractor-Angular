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
        this.headerData = [];
        this.messageDeliveryData = [];
        this.headerData = data.header_data;
        this.messageDeliveryData = data.message_delivery_data;
        if (data.contacts.length > 0) {
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
        }
    }

    public onClickTable(message: any, index: number) {
        this.imagesArray = [];
        this.messageDeliveryDataIndex = index;
        this.modalData = message;
        this.parseHeaders(this.messageDeliveryData[index].headers)
        if (message && message.images.length > 0) {
            this.imagesArray = message.images;
        }
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
}
