import { tsql2022 } from "./dialect/tsql2022";
import { analysis } from "./lexer";
import { parse } from "./parser";
import { grammar } from "./parsers/tsql-formatter";

export function format(contents: string): string {
    try {
        const tokens = analysis(tsql2022, contents);
        const nodes = parse(grammar(), tokens);
        return contents;
    } catch (e) {
        throw e;
    }
}
