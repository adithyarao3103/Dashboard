declare module 'papaparse' {
interface ParseConfig {
    header?: boolean;
    complete?: (results: ParseResult<any>) => void;
}

interface ParseResult<T> {
    data: T[];
    errors: any[];
    meta: {
    delimiter: string;
    linebreak: string;
    aborted: boolean;
    truncated: boolean;
    cursor: number;
    };
}

export function parse(file: File, config?: ParseConfig): void;
}