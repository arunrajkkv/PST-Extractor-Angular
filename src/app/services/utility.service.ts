import { Injectable } from '@angular/core';


type ParsedResult = {
    ip4: string[];
    verificationTokens: string[];
};

@Injectable({
    providedIn: 'root'
})
export class UtilityService {

    constructor() { }

    parseReceivedString(inputString: string): any {
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

    parseHeadersToMailSignalFormat(headerString: string): any {
        const HEADERS = headerString.split("\n\n");
        let headerStringArray: any = [];
        HEADERS.forEach(header => {
            const FIELDS = header.split("\t");
            FIELDS.forEach(field => { headerStringArray.push(field.trim()); });
        });
        return headerStringArray;
    }

    getServersList(inputString: any): any {
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

    getSentReceivedTimes(timeType: string, header: string): any {
        const TIME_REGEX = /(\d{1,2} \w{3} \d{4} \d{2}:\d{2}:\d{2})/g;
        const TIME_DATA = header.match(TIME_REGEX);
        if (TIME_DATA && TIME_DATA.length >= 2) {
            return timeType === 'sentTime' ? new Date(TIME_DATA[0]) : new Date(TIME_DATA[1]);
        }
    }

    convertToDateObject(dateString: string): any {
        if (dateString) {
            const UNIT_8_ARRAY = new TextEncoder().encode(dateString);/* Convert the string to a Uint8Array */
            const TIMESTAMP = new DataView(UNIT_8_ARRAY.buffer).getUint32(0, true);/* Extract the timestamp from the Uint8Array */
            const MILLISECONDS = TIMESTAMP * 1000;/* Convert the timestamp to MILLISECONDS */
            const DATE = new Date();/* Create a new Date object with the MILLISECONDS */
            DATE.setTime(MILLISECONDS);
            return DATE;
        } else {
            return '--No data--';
        }
    }

    extractDomain(subdomain: string) {
        const PARTS = subdomain.split('.');
        if (PARTS.length >= 2) {
            return PARTS.slice(-2).join('.');
        }
        return subdomain;
    }

    getOwnershipCompanyName(inputString: string): string {
        console.log('inputString:', inputString)
        return inputString.substring(0, inputString.indexOf('-'));
    }

    parseTxtRecords(data: any[]): ParsedResult {
        const PARSED_RESULT: ParsedResult = { ip4: [], verificationTokens: [] };
        data.forEach((item: string) => {
            const STRIPPED_ITEM: string = item.replace(/^\"|\"$/g, ''); // Remove surrounding quotes
            const IP_MATCHES: RegExpMatchArray | null = STRIPPED_ITEM.match(/ip4:\s*([\d.]+)/g);
            if (IP_MATCHES) {
                IP_MATCHES.forEach((ip: string) => {
                    const CLEAN_UP: string = ip.replace(/ip4:\s*/, ''); // Clean up the IP address
                    PARSED_RESULT.ip4.push(CLEAN_UP);
                });
            }
            const MS_MATCH: RegExpMatchArray | null = STRIPPED_ITEM.match(/MS=([A-Z0-9]+)/);
            if (MS_MATCH) {
                PARSED_RESULT.verificationTokens.push(MS_MATCH[0]);
            }
            const googleVerificationMatches: RegExpMatchArray | null = STRIPPED_ITEM.match(/google-site-verification=([\w-]+)/g);
            if (googleVerificationMatches) {
                googleVerificationMatches.forEach((token: string) => {
                    PARSED_RESULT.verificationTokens.push(token);
                });
            }
        });
        return PARSED_RESULT;
    }

    getSpfIp4Records(records: any) {
        return records.map((record: any) => {
            let trimmedRecord = record.slice(1, -1);
            const match = trimmedRecord.toString().match(/[^a-zA-Z0-9\s]/);
            if (trimmedRecord.startsWith('v=spf1')) {
                let ipAddresses = trimmedRecord.match(/ip4:\d+\.\d+\.\d+\.\d+/g);
                return {
                    type: 'spf',
                    value: ipAddresses
                };
            } else if (trimmedRecord.startsWith('ip4:')) {
                return {
                    type: 'ip4',
                    value: trimmedRecord.split(': ')[1]
                };
            }
            else {
                return {
                    type: 'unknown',
                    value: trimmedRecord
                };
            }
        });
    }

    getVerificationRecords(inputString: string): any {
        let trimmedRecord = inputString.slice(0, -1);
        const match = trimmedRecord.toString().match(/[^a-zA-Z0-9\s]/);
        if (match) {
            const index = match.index;
            const substringBeforeSpecialChar = trimmedRecord.substring(0, index).trim();
            const words = substringBeforeSpecialChar.split(/\s+/);
            return {
                type: 'verification',
                companyName: words[words.length - 1],
                value: inputString.split('=')[1]
            }
        }
    }

    removeSubStringFromString(inputString: string, stringToReplace: string, replacingString: string): string {
        return inputString.replace(stringToReplace, replacingString);
    }

}
