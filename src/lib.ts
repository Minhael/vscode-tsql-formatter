import { tsql2022 } from "./dialect/tsql2022";
import { formatsql } from "./grammar/sql-formatter/expressions";
import { analysis } from "./lexer";
import { parse } from "./parser";

export function format(contents: string): string {
    const tokens = analysis(tsql2022, contents);
    const nodes = parse(formatsql, tokens);
    return nodes.reduce((acc, x) => { x.format(acc, contents); return acc; }, []).join("");
}
