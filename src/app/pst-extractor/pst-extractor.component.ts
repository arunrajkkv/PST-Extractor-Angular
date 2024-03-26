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
    isShowContentData = false;
    isShowFolderView = false;
    modalData: any = {};
    headerData: any = {};
    fileName: string = '';

    constructor(private _commonService: CommonService) { }

    ngOnInit() {
    }

    getData() {
        let directoryPath = 'D:\\others\\pst files\\';
        const FILE = directoryPath + this.fileName;
        this._commonService.getExtractedData(FILE)
            .subscribe(
                (response: any) => {
                    if (response) {
                        this.extractedData = response;
                        this.isShowFolderView = true;
                        if (this.extractedData && this.extractedData.length > 0) {
                            this.extractedData.forEach((data: any) => {
                                if (data.messages.length > 0) {
                                    this.messageArray = data.messages;
                                }
                            });
                        }
                    }
                },
                error => {
                    console.log(error)
                    this.isShowFolderView = false;
                });
    }

    onClickFolder(data: any): void {
        this.isShowContentData = true;
        this.headerData = data.header_data;
    }

    onSelectPstFile(event: any) {
        this.fileName = event ? event.srcElement.files[0].name : '';
    }

    convertToDateObject(dateString: string): any {
        if (dateString) {
            const uint8Array = new TextEncoder().encode(dateString);/* Convert the string to a Uint8Array */
            const timestamp = new DataView(uint8Array.buffer).getUint32(0, true);/* Extract the timestamp from the Uint8Array */
            const milliseconds = timestamp * 1000;/* Convert the timestamp to milliseconds */
            const date = new Date();/* Create a new Date object with the milliseconds */
            date.setTime(milliseconds);
            return date;
        }
    }

}
