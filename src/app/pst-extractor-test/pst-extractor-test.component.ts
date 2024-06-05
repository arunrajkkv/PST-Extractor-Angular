import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonService } from '../services/common.service';
import { ReportDataService, ReportRO } from '../services/report-data.service';
import { UtilityService } from '../services/utility.service';
@Component({
    selector: 'app-pst-extractor-test',
    templateUrl: './pst-extractor-test.component.html',
    styleUrls: ['./pst-extractor-test.component.css']
})
export class PstExtractorTestComponent implements OnInit {

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
    isLoading: boolean = false;
    isShowContentData = false;
    isShowFolderView = false;
    isShowSignalView: boolean = false;
    isShowContentView: boolean = false;
    isShowWhoIsView: boolean = false;
    isShowNsView: boolean = false;
    reportData: any = {
        landingPageData: [],
        eachMessageData: []
    };
    nsLookupData: any = {};
    txtRecords: any = [];
    spfRecords: any = [];
    ip4Records: any = [];
    nsLookupCache: any = { messageId: '', data: {} };
    verificationRecords: any = [];
    isTabSwitched: boolean = false;
    reportRO: any = new ReportRO();

    constructor(private _commonService: CommonService,
        public _reportDataService: ReportDataService,
        public _utilityService: UtilityService
    ) { }

    ngOnInit() {
        this.isTabSwitched = false;
    }

    public getData(): void {
        this.isLoading = true;
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
                        this.isLoading = false;
                    }
                },
                error => {
                    console.log(error)
                    this.isShowFolderView = false;
                    this.isLoading = false;
                });
        } else {
            alert('Please choose a valid pst file');
        }
    }

    private setCurrentTab(data: any): void {
        this.currentTab = '';
        this.currentTab = data.folder_name;
    }

    private setHeaderData(data: any): void {
        this.headerData = [];
        this.headerData = data.header_data;
    }

    private setMessageDeliveryData(data: any): void {
        this.messageDeliveryData = [];
        this.messageDeliveryData = data.message_delivery_data;
    }

    public onClickFolder(data: any): void {
        this.setCurrentTab(data);
        this.setHeaderData(data);
        this.setMessageDeliveryData(data);
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

    public onClickTable(message: any, index: number): void {
        this.setBooleanForViews(true, false, false, false);
        this.imagesArray = [];
        this.modalData = message;
        this.parseHeaders(this.messageDeliveryData[index].headers);
        this.getParsedEmailHeader(this.modalData.message_delivery_data.headers)
        this.parsedHeaderStringArray = this._utilityService.parseHeadersToMailSignalFormat(this.messageDeliveryData[index].headers);
        this.serversList = this._utilityService.getServersList(this.getParsedArrayListWithNewLine())
        if (message && message.images.length > 0) {
            this.imagesArray = message.images;
        }
        this.onClickWhoIsLookUpView();
        this.getNsLookup();
    }

    private getParsedArrayListWithNewLine(): string {
        return this.parsedHeaderStringArray.join('\n');
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
        this.receivedList = this._utilityService.parseReceivedString(this.parsedHeaders['Received']);
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
        this.getWhoIsForSenderDomain();
        this.getWhoIsForReceiverDomain();
    }

    private getWhoIsForSenderDomain(): void {
        this._commonService.getWhoIsLookUpData(this.receivedList[0].senderDomain).subscribe(
            (response: any) => {
                if (response) {
                    this.whoIsLookUpData.senderDomainData.push(response);
                }
            },
            (error: any) => {
                console.log(error)
            });
    }

    private getWhoIsForReceiverDomain(): void {
        this._commonService.getWhoIsLookUpData(this.receivedList[0].receiverDomain).subscribe(
            (response: any) => {
                if (response) {
                    this.whoIsLookUpData.receiverDomainData.push(response);
                }
            },
            (error: any) => {
                console.log(error)
            });
    }

    getNsLookup(): any {
        if (!!Object.keys(this.nsLookupCache).find((E: any) => E.messageId) == this.parsedHeaders['Message-Id']) {
            this.nsLookupData = this.nsLookupCache.data;
        } else {
            this.getNsLookupData();
        }
    }

    public getNsLookupData(): void {
        this._commonService.getNSLookUpData(this._utilityService.extractDomain(this.receivedList[0].receiverDomain)).subscribe(
            (response: any) => {
                if (response) {
                    this.nsLookupData = response;
                    this.setNsLookupCache();
                    if (this.nsLookupData) {
                        this.txtRecords = this._utilityService.getSpfIp4Records(this.nsLookupData.TXT);
                        if (this.txtRecords.length > 0) {
                            this.spfRecords = this.txtRecords.find((E: any) => E.type == 'spf');
                            this.ip4Records = this.txtRecords.filter((E: any) => E.type == 'ip4');
                            this.verificationRecords = this.txtRecords.filter((E: any) => E.type == 'unknown')
                        }
                    }
                }
            },
            (error: any) => {
                console.log(error);
            });

    }

    public setNsLookupCache(): void {
        this.nsLookupCache.messageId = this.parsedHeaders['Message-Id'];
        this.nsLookupCache.data = this.nsLookupData;
    }

    public getParsedMXRecords(inputString: string, type: string): any {
        return type == 'record' ? inputString.replace(/^1\s*/, '') : inputString.match(/\d+/);
    }

    public setBooleanForViews(content: boolean, signal: boolean, whoIs: boolean, ns: boolean) {
        this.isShowContentView = content;
        this.isShowSignalView = signal;
        this.isShowWhoIsView = whoIs;
        this.isShowNsView = ns;
    }

    private setReportRO(): void {
        this.reportRO = new ReportRO();
        this.reportRO.extractedData = this.extractedData;
        this.reportRO.modalData = this.modalData;
        this.reportRO.serversList = this.serversList;
        this.reportRO.headerData = this.headerData;
        this.reportRO.receivedList = this.receivedList;
        this.reportRO.encryptionStatus = this.encryptionStatus;
        this.reportRO.whoIsLookUpData = this.whoIsLookUpData.senderDomainData[0].parsedWhoIs;
        this.reportRO.nsLookupData = this.nsLookupData;
        this.reportRO.verificationRecords = this.verificationRecords;
        this.reportRO.spfRecords = this.spfRecords;
    }

    exportToPDF() {
        this.setReportRO();
        const REPORT_DATA = this._reportDataService.getReportDataObject(this.reportRO);
        this._commonService.exportToPDF(REPORT_DATA).subscribe(
            (response: Blob) => {
                const url = window.URL.createObjectURL(response);
                const a = document.createElement('a');
                a.href = url;
                const FILENAME = this.fileName.replace(/\.pst$/, '');
                a.download = FILENAME + '.pdf';
                a.title = FILENAME + '.pdf';
                a.click();
                window.URL.revokeObjectURL(url);
            },
            (error) => {
                console.error('Error generating PDF:', error);
            }
        );
    }


}
