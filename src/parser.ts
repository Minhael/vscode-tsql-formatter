import { Token } from "./lexer";

export type Node = {
    start: number,
    end: number
};

export type Grammar<T extends Node> = (token: Token) => Expression<T>;

export interface Expression<T extends Node> {
    (tokens: Token[], index: number): T
}

type ParserState<T extends Node> = {
    index: number,
    nodes: T[]
};

export const parse = <T extends Node>(grammar: Grammar<T>, tokens: Token[], start: number = 0, end: number = tokens.length - 1): T[] => {
    let state = { index: start, nodes: [] } as ParserState<T>;
    while (state.index <= end) {
        state = reduce(state, grammar, tokens);
    }
    return state.nodes;
};

const reduce = <T extends Node>(state: ParserState<T>, grammar: Grammar<T>, tokens: Token[]): ParserState<T> => {
    var newNode = grammar(tokens[state.index])(tokens, state.index);
    return { index: newNode.end + 1, nodes: [...state.nodes, newNode] };
};