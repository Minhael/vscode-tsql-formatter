import { Expression, Node } from "./expressions";
import { Token } from "./lexer";

export const parse = (exprs: Expression[], tokens: Token[]): Node[] => loop(exprs, tokens);

type ParserState = {
    index: number,
    nodes: Node[]
};

const loop = (exprs: Expression[], tokens: Token[], start: number = 0, end: number = tokens.length - 1): Node[] => {
    let state = { index: start, nodes: [] } as ParserState;
    while (state.index <= end) {
        state = reduce(state, exprs, tokens);
    }
    return state.nodes;
};

const reduce = (state: ParserState, exprs: Expression[], tokens: Token[]): ParserState => {
    var nodes = fn(exprs, x => x(tokens, state.index), x => x !== null);
    if (nodes === null || nodes.length === 0) {
        throw new Error("Unable to parse token " + tokens[state.index].type + " at index " + tokens[state.index].start);
    }
    return { index: state.index + nodes[nodes.length - 1].end + 1, nodes: [...state.nodes, ...nodes] };
};

const fn = (exprs: Expression[], fn: (item: Expression) => Node[] | null, filter: (item: Node[] | null) => boolean): Node[] | null => {
    for (let i = 0; i < exprs.length; ++i) {
        var obj = fn(exprs[i]);
        if (filter(obj)) { return obj; }
    }
    return [];
};