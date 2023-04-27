import { Token } from "./lexer";

export type Node = {
    type: string,
    index: number,
    children: number,
};

export type Grammar = Expression[];

export interface Expression {
    (tokens: Token[], index: number): Node | null
}

type ParserState = {
    index: number,
    nodes: Node[]
};

export const parse = (grammar: Grammar, tokens: Token[]): Node[] => loop(grammar, tokens);

const loop = (grammar: Grammar, tokens: Token[], start: number = 0, end: number = tokens.length - 1): Node[] => {
    let state = { index: start, nodes: [] } as ParserState;
    while (state.index <= end) {
        state = reduce(state, grammar, tokens);
    }
    return state.nodes;
};

const reduce = (state: ParserState, grammar: Grammar, tokens: Token[]): ParserState => {
    var node = fn(grammar, x => x(tokens, state.index), x => x !== null);
    if (node === null) {
        throw new Error("Unable to parse token " + tokens[state.index].type + " at index " + tokens[state.index].start);
    }
    return { index: state.index + 1 + node.children, nodes: [...state.nodes, node] };
};

const fn = (rules: Expression[], fn: (item: Expression) => Node | null, filter: (item: Node | null) => boolean): Node | null => {
    for (let i = 0; i < rules.length; ++i) {
        var obj = fn(rules[i]);
        if (filter(obj)) { return obj; }
    }
    return null;
};