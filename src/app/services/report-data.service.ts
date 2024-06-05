import { Injectable } from '@angular/core';
import { UtilityService } from './utility.service';

@Injectable({
    providedIn: 'root'
})
export class ReportDataService {

    constructor(public _utilityService: UtilityService) { }

    getReportDataObject(reportRO: any): any {
        return this.convertKeysToHumanReadable({
            "Folders List": this.getFoldersList(reportRO.extractedData),
            "Sender Email": reportRO.modalData.sender_email,
            "Subject": reportRO.modalData.subject,
            "Sender Name": reportRO.modalData.sender_name,
            "Sender Address Type": reportRO.modalData.sender_address_type,
            "To": reportRO.modalData.to,
            "Cc": reportRO.modalData.cc,
            "Bcc": reportRO.modalData.bcc,
            "Sender Email Server": reportRO.modalData.sender_email_server,
            "Sender Ip Address": reportRO.receivedList[0]?.senderIP,
            "Sender Domain": reportRO.receivedList[0].senderDomain,
            "Sender SMTP Address": reportRO.modalData.sender_smtp_address,
            "servers involved": this.getServersList(reportRO.serversList),
            "Receiver Server": reportRO.receivedList[0].receivingServer,
            "Receiver Ip Address": reportRO.modalData.receiver_ip_address,
            "Receiver Domain": reportRO.receivedList[0].receiverDomain,
            "Client Submit Time": reportRO.modalData.client_submit_time,
            "Delivery Time": reportRO.modalData.delivery_time,
            "EmailClient Name": reportRO.modalData.sender_name,
            "Signature": reportRO.headerData.signature,
            "File Format": reportRO.headerData.file_format,
            "Version": reportRO.headerData.version,
            "ESMTP ID": reportRO.receivedList[0]?.id,
            "Encryption Status": reportRO.encryptionStatus,
            "Domain Name": reportRO.whoIsLookUpData.domain_name,
            "Registrar": reportRO.whoIsLookUpData.registrar,
            "Registrar URL": reportRO.whoIsLookUpData.registrar_url,
            "Registered On": reportRO.whoIsLookUpData.creation_date,
            "Expires On": reportRO.whoIsLookUpData.expiration_date,
            "Updated On": reportRO.whoIsLookUpData.updated_date,
            "Status": reportRO.whoIsLookUpData.status,
            "Registrant Organization": reportRO.whoIsLookUpData.organization,
            "Registrant State": reportRO.whoIsLookUpData.state,
            "Registrant Country": reportRO.whoIsLookUpData.country,
            "Registrant Email": reportRO.whoIsLookUpData.emails,
            "IPv4 Address": this.getNsLookupData(reportRO.nsLookupData, 'A', 'ip'),
            "IPv6 Address": this.getNsLookupData(reportRO.nsLookupData, 'AAAA', 'record'),
            "Verification Records": this.getVerificationRecords(reportRO.verificationRecords),
            "SPF Records": this.spfData(reportRO.spfRecords),
            "NS Records": this.getNsRecords(reportRO.nsLookupData.NS),
            "MX Records": this.getMxRecords(reportRO.nsLookupData.MX)
        });
    }

    convertKeysToHumanReadable(inputObject: any) {
        const RESULT_OBJECT: any = {};
        for (const key in inputObject) {
            if (inputObject.hasOwnProperty(key)) {
                const HUMAN_READABLE_KEY = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                RESULT_OBJECT[HUMAN_READABLE_KEY] = inputObject[key];
            }
        }
        return RESULT_OBJECT;
    }

    getServersList(arrayList: any): any {
        return arrayList.map((E: any) => `${E.serverName}, ${E.ipAddress}`).join('; ');
    }

    getFoldersList(arrayList: any) {
        return arrayList.map((E: any) => `${E.folder_name}: ${E.total_items}`).join(', ');
    }

    getNsLookupData(lookupData: any, innerArray: any, objectToTake: any): any {
        return lookupData[innerArray].map((E: any) => E[objectToTake]).join('');
    }

    getVerificationRecords(arrayList: any): any {
        return arrayList.map((E: any) => `${this._utilityService.getVerificationRecords(E.value).value} :
                                          ${this._utilityService.getVerificationRecords(E.value).companyName}`).join(', ');
    }

    spfData(arrayList: any): any {
        return arrayList.value.map((E: any) => this._utilityService.removeSubStringFromString(E,'ip4:', '')).join(', ');
    }

    getNsRecords(arrayList: any): any {
        return arrayList.map((E: any) => E).join(',')
    }

    getMxRecords(arrayList: any): any {
        return arrayList.map((E: any) => `${this.getParsedMXRecords(E.record, 'record')}, ${this.getParsedMXRecords(E.record, 'priority')}`).join(', ');
    }

    getParsedMXRecords(inputString: string, type: string): any {
        return type == 'record' ? inputString.replace(/^1\s*/, '') : inputString.match(/\d+/);
    }


}

export class ReportRO {
    modalData: any = {};
    serversList: any = [];
    headerData: any = {};
    receivedList: any = [];
    extractedData: any = [];
    encryptionStatus: string = '';
    whoIsLookupData: any = [];
    nsLookupData: any = {};
    verificationRecords: any = [];
    txtRecords: any = [];
}
