import { Token } from "../../lexer";
import { Expression, Node, parse } from "../../parser";

export interface Formatter {
    (builder: string[], contents: string): void
}

export type FormatterNode = Node & { format: Formatter };

const INDENT = "    ";
const LINEBREAK = "\n";


export const formatsql = (token: Token): Expression<FormatterNode> => {
    switch (token.type) {
        case "BEGIN":
            return block;
        default:
            return word;
    }
};

const block = (tokens: Token[], index: number): FormatterNode => {
    const begin = tokens[index];
    const endIndex = tokens.findIndex(x => x.type === "END");
    if (endIndex < 0) { return word(tokens, index); }
    const end = tokens[endIndex];
    const nodes = parse(formatsql, tokens, index + 1, endIndex - 1);
    return {
        start: index, end: endIndex, format: (builder: string[], contents: string): void => {
            builder.push(begin.type, LINEBREAK);
            builder.push(nodes.reduce((acc, x) => { x.format(acc, contents); return acc; }, [] as string[]).join("").replace(/^/gm, INDENT));
            if (builder[-1] !== LINEBREAK) { builder.push(LINEBREAK); }
            builder.push(end.type, LINEBREAK, LINEBREAK);
        }
    };
};

const word = (tokens: Token[], index: number): FormatterNode => {
    const token = tokens[index];
    return {
        start: index, end: index, format: (builder: string[], contents: string): void => {
            builder.push(contents.slice(token.start, token.end + 1), " ");
        }
    };
};