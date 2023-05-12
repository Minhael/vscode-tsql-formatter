import { EphemeralKeyInfo } from "tls";
import { Token } from "./lexer";

export type Node = {
    type: string,
    start: number,
    end: number,
    children: Node[]
};

export interface Expression {
    (tokens: Token[], index: number): Node[] | null
};

export const DEFINE = (name: string, expr: Expression, builder: (parent: Node, children: Node[]) => Node = (p, _) => p): Expression => (tokens: Token[], index: number): Node[] | null => {
    const nodes = expr(tokens, index);
    if (nodes !== null && nodes.length > 0) {
        return [builder({ type: name, start: index, end: nodes[nodes.length - 1].end, children: nodes }, nodes)];
    }
    return null;
};

export const EXPR = (grammar: { [key: string]: Expression }, name: string): Expression => (tokens: Token[], index: number): Node[] | null => {
    return grammar[name](tokens, index);
};

export const EQUAL = (word: string): Expression => (tokens: Token[], index: number): Node[] | null => {
    if (tokens.length > index && tokens[index].type === word) {
        return [{ type: word, start: index, end: index, children: [] }];
    }
    return null;
};

export const OPTIONAL = (expr: Expression): Expression => (tokens: Token[], index: number): Node[] | null => {
    const nodes = expr(tokens, index);
    return nodes ?? [];
};

export const MANY = (expr: Expression): Expression => (tokens: Token[], index: number): Node[] | null => {
    let nodes: Node[] = [];

    let result = expr(tokens, index);
    while (result !== null && result.length > 0) {
        nodes = [...nodes, ...result];
        result = expr(tokens, nodes[nodes.length - 1].end + 1);
    }

    if (result !== null && result.length > 0) {
        nodes = [...nodes, ...result];
    }

    if (nodes.length > 0) {
        return nodes;
    } else {
        return null;
    }
};

export const AND = (...exprs: Expression[]): Expression => (tokens: Token[], index: number): Node[] | null => {
    let nodes = exprs[0](tokens, index);

    if (nodes === null) { return null; }

    for (let i = 1; i < exprs.length; ++i) {
        index = nodes.length > 0 ? nodes[nodes.length - 1].end + 1 : index;
        const rightNodes = exprs[i](tokens, index);
        if (rightNodes === null) { return null; }
        nodes = [...nodes, ...rightNodes];
    }
    return nodes;
};

export const OR = (...exprs: Expression[]): Expression => (tokens: Token[], index: number): Node[] | null => {
    for (let i = 0; i < exprs.length; ++i) {
        const nodes = exprs[i](tokens, index);
        if (nodes !== null) { return nodes; }
    }
    return null;
};