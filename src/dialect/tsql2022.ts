import { LexerState } from "../lexer";

//  https://learn.microsoft.com/en-us/sql/t-sql/language-reference?view=sql-server-ver16

const blocks = [
    ["N'", "'"],
    ["'", "'"],
    ["[", "]"],
    ["/*", "*/"],
    ["`", "`"],
    ["--", "\n"],
];
const reserved = ["ADD", "EXTERNAL", "PROCEDURE", "ALL", "FETCH", "PUBLIC", "ALTER", "FILE", "RAISERROR", "AND", "FILLFACTOR", "READ", "ANY", "FOR", "READTEXT", "AS", "FOREIGN", "RECONFIGURE", "ASC", "FREETEXT", "REFERENCES", "AUTHORIZATION", "FREETEXTTABLE", "REPLICATION", "BACKUP", "FROM", "RESTORE", "BEGIN", "FULL", "RESTRICT", "BETWEEN", "FUNCTION", "RETURN", "BREAK", "GOTO", "REVERT", "BROWSE", "GRANT", "REVOKE", "BULK", "GROUP", "RIGHT", "BY", "HAVING", "ROLLBACK", "CASCADE", "HOLDLOCK", "ROWCOUNT", "CASE", "IDENTITY", "ROWGUIDCOL", "CHECK", "IDENTITY_INSERT", "RULE", "CHECKPOINT", "IDENTITYCOL", "SAVE", "CLOSE", "IF", "SCHEMA", "CLUSTERED", "IN", "SECURITYAUDIT", "COALESCE", "INDEX", "SELECT", "COLLATE", "INNER", "SEMANTICKEYPHRASETABLE", "COLUMN", "INSERT", "SEMANTICSIMILARITYDETAILSTABLE", "COMMIT", "INTERSECT", "SEMANTICSIMILARITYTABLE", "COMPUTE", "INTO", "SESSION_USER", "CONSTRAINT", "IS", "SET", "CONTAINS", "JOIN", "SETUSER", "CONTAINSTABLE", "KEY", "SHUTDOWN", "CONTINUE", "KILL", "SOME", "CONVERT", "LEFT", "STATISTICS", "CREATE", "LIKE", "SYSTEM_USER", "CROSS", "LINENO", "TABLE", "CURRENT", "LOAD", "TABLESAMPLE", "CURRENT_DATE", "MERGE", "TEXTSIZE", "CURRENT_TIME", "NATIONAL", "THEN", "CURRENT_TIMESTAMP", "NOCHECK", "TO", "CURRENT_USER", "NONCLUSTERED", "TOP", "CURSOR", "NOT", "TRAN", "DATABASE", "NULL", "TRANSACTION", "DBCC", "NULLIF", "TRIGGER", "DEALLOCATE", "OF", "TRUNCATE", "DECLARE", "OFF", "TRY_CONVERT", "DEFAULT", "OFFSETS", "TSEQUAL", "DELETE", "ON", "UNION", "DENY", "OPEN", "UNIQUE", "DESC", "OPENDATASOURCE", "UNPIVOT", "DISK", "OPENQUERY", "UPDATE", "DISTINCT", "OPENROWSET", "UPDATETEXT", "DISTRIBUTED", "OPENXML", "USE", "DOUBLE", "OPTION", "USER", "DROP", "OR", "VALUES", "DUMP", "ORDER", "VARYING", "ELSE", "OUTER", "VIEW", "END", "OVER", "WAITFOR", "ERRLVL", "PERCENT", "WHEN", "ESCAPE", "PIVOT", "WHERE", "EXCEPT", "PLAN", "WHILE", "EXEC", "PRECISION", "WITH", "EXECUTE", "PRIMARY", "EXISTS", "PRINT", "WRITETEXT", "EXIT", "PROC", "ABSOLUTE", "EXEC", "OVERLAPS", "ACTION", "EXECUTE", "PAD", "ADA", "EXISTS", "PARTIAL", "ADD", "EXTERNAL", "PASCAL", "ALL", "EXTRACT", "POSITION", "ALLOCATE", "FALSE", "PRECISION", "ALTER", "FETCH", "PREPARE", "AND", "FIRST", "PRESERVE", "ANY", "FLOAT", "PRIMARY", "ARE", "FOR", "PRIOR", "AS", "FOREIGN", "PRIVILEGES", "ASC", "FORTRAN", "PROCEDURE", "ASSERTION", "FOUND", "PUBLIC", "AT", "FROM", "READ", "AUTHORIZATION", "FULL", "REAL", "AVG", "GET", "REFERENCES", "BEGIN", "GLOBAL", "RELATIVE", "BETWEEN", "GO", "RESTRICT", "BIT", "GOTO", "REVOKE", "BIT_LENGTH", "GRANT", "RIGHT", "BOTH", "GROUP", "ROLLBACK", "BY", "HAVING", "ROWS", "CASCADE", "HOUR", "SCHEMA", "CASCADED", "IDENTITY", "SCROLL", "CASE", "IMMEDIATE", "SECOND", "CAST", "IN", "SECTION", "CATALOG", "INCLUDE", "SELECT", "CHAR", "INDEX", "SESSION", "CHAR_LENGTH", "INDICATOR", "SESSION_USER", "CHARACTER", "INITIALLY", "SET", "CHARACTER_LENGTH", "INNER", "SIZE", "CHECK", "INPUT", "SMALLINT", "CLOSE", "INSENSITIVE", "SOME", "COALESCE", "INSERT", "SPACE", "COLLATE", "INT", "SQL", "COLLATION", "INTEGER", "SQLCA", "COLUMN", "INTERSECT", "SQLCODE", "COMMIT", "INTERVAL", "SQLERROR", "CONNECT", "INTO", "SQLSTATE", "CONNECTION", "IS", "SQLWARNING", "CONSTRAINT", "ISOLATION", "SUBSTRING", "CONSTRAINTS", "JOIN", "SUM", "CONTINUE", "KEY", "SYSTEM_USER", "CONVERT", "LANGUAGE", "TABLE", "CORRESPONDING", "LAST", "TEMPORARY", "COUNT", "LEADING", "THEN", "CREATE", "LEFT", "TIME", "CROSS", "LEVEL", "TIMESTAMP", "CURRENT", "LIKE", "TIMEZONE_HOUR", "CURRENT_DATE", "LOCAL", "TIMEZONE_MINUTE", "CURRENT_TIME", "LOWER", "TO", "CURRENT_TIMESTAMP", "MATCH", "TRAILING", "CURRENT_USER", "MAX", "TRANSACTION", "CURSOR", "MIN", "TRANSLATE", "DATE", "MINUTE", "TRANSLATION", "DAY", "MODULE", "TRIM", "DEALLOCATE", "MONTH", "TRUE", "DEC", "NAMES", "UNION", "DECIMAL", "NATIONAL", "UNIQUE", "DECLARE", "NATURAL", "UNKNOWN", "DEFAULT", "NCHAR", "UPDATE", "DEFERRABLE", "NEXT", "UPPER", "DEFERRED", "NO", "USAGE", "DELETE", "NONE", "USER", "DESC", "NOT", "USING", "DESCRIBE", "NULL", "VALUE", "DESCRIPTOR", "NULLIF", "VALUES", "DIAGNOSTICS", "NUMERIC", "VARCHAR", "DISCONNECT", "OCTET_LENGTH", "VARYING", "DISTINCT", "OF", "VIEW", "DOMAIN", "ON", "WHEN", "DOUBLE", "ONLY", "WHENEVER", "DROP", "OPEN", "WHERE", "ELSE", "OPTION", "WITH", "END", "OR", "WORK", "END-EXEC", "ORDER", "WRITE", "ESCAPE", "OUTER", "YEAR", "EXCEPT", "OUTPUT", "ZONE", "EXCEPTION"];
const operators = ['::', ';', '=', '(', ')', '@', '.', ',', '#'];
const bitwise = ['&=', '&', '|=', '|', '^=', '^', '~'];
const arithmetic = ['+=', '+', '-=', '-', '*=', '*', '/=', '/', '%=', '%'];
const comparison = ['>=', '>', '<>', '<=', '<', '!<', '!=', '!>'];


const keyword = (word: string) => (state: LexerState, contents: string): LexerState | null => {
    if (contents.startsWith(word, state.index)) {
        const c = contents.charAt(state.index + word.length);
        if (c >= 'A' && c <= 'Z' || c >= 'a' && c <= 'z' || c >= '0' && c <= '9') { return null; }
        const token = { type: word, start: state.index, end: state.index + word.length - 1 };
        return { index: state.index + word.length, rules: state.rules, tokens: [...state.tokens, token] };
    }
    return null;
};

const symbol = (word: string) => (state: LexerState, contents: string): LexerState | null => {
    if (contents.startsWith(word, state.index)) {
        const token = { type: word, start: state.index, end: state.index + word.length - 1 };
        return { index: state.index + word.length, rules: state.rules, tokens: [...state.tokens, token] };
    }
    return null;
};

const block = (start: string, end: string) => (state: LexerState, contents: string): LexerState | null => {
    if (contents.startsWith(start, state.index) && contents.length > state.index + start.length) {
        const endIndex = contents.indexOf(end, state.index + start.length);
        if (endIndex > -1) {
            const startToken = { type: start, start: state.index, end: state.index + start.length - 1 };
            const endToken = { type: end, start: endIndex, end: endIndex + end.length - 1 };
            const token = { type: "string", start: startToken.end + 1, end: endToken.start - 1 };
            return { index: endIndex + end.length, rules: state.rules, tokens: [...state.tokens, startToken, token, endToken] };
        }
    }
    return null;
};

const word = (state: LexerState, contents: string): LexerState | null => {
    let cursor = state.index;
    let c = contents.charAt(cursor);

    if (c >= 'A' && c <= 'Z' || c >= 'a' && c <= 'z' || c === '_') {
        while (c >= 'A' && c <= 'Z' || c >= 'a' && c <= 'z' || c >= '0' && c <= '9' || c === '_') {
            c = contents.charAt(++cursor);
        }
        const token = { type: "string", start: state.index, end: cursor - 1 };
        return { index: cursor, rules: state.rules, tokens: [...state.tokens, token] };
    }

    return null;
};

const number = (state: LexerState, contents: string): LexerState | null => {
    let cursor = state.index;
    let c = contents.charAt(cursor);

    if (c >= '0' && c <= '9') {
        while (c >= '0' && c <= '9') {
            c = contents.charAt(++cursor);
        }
        const token = { type: "number", start: state.index, end: cursor - 1 };
        return { index: cursor, rules: state.rules, tokens: [...state.tokens, token] };
    }

    return null;
};

const whitespaces = (state: LexerState, contents: string): LexerState | null => {
    let cursor = state.index;
    let c = contents.charAt(cursor);

    if (c === ' ' || c === '\t' || c === '\r' || c === '\n') {
        while (c === ' ' || c === '\t' || c === '\r' || c === '\n') {
            c = contents.charAt(++cursor);
        }
        return { index: cursor, rules: state.rules, tokens: state.tokens };
    }

    return null;
};

export const tsql2022 = [
    ...blocks.map(([x, y]) => block(x, y)),
    ...reserved.map(x => keyword(x)),
    ...operators.map(x => symbol(x)),
    ...bitwise.map(x => symbol(x)),
    ...arithmetic.map(x => symbol(x)),
    ...comparison.map(x => symbol(x)),
    word,
    number,
    whitespaces,
];