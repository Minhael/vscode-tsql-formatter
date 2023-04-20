export type LexerDialect = LexerRule[];

export interface LexerRule {
    (state: LexerState, contents: string): LexerState | null
}

export type Token = {
    type: string,
    start: number,
    end: number,
};

export type LexerState = {
    index: number,
    rules: LexerRule[],
    tokens: Token[],
};

export const analysis = (dialect: LexerDialect, contents: string): Token[] => loop(dialect, contents.toUpperCase());

const loop = (rules: LexerRule[], contents: string): Token[] => {
    let state = { index: 0, rules: rules, tokens: [] } as LexerState;

    while (state.index < contents.length) {
        state = reduce(state, contents);
    }

    return state.tokens;
};

const reduce = (state: LexerState, contents: string): LexerState => {
    var nextState = fn(state.rules, x => x(state, contents), x => x !== null);
    if (nextState === null) {
        throw new Error("Unable to tokenize " + contents.charAt(state.index) + " at index " + state.index);
    }
    return nextState;
};

const fn = (rules: LexerRule[], fn: (item: LexerRule) => LexerState | null, filter: (item: LexerState | null) => boolean): LexerState | null => {
    for (let i = 0; i < rules.length; ++i) {
        var obj = fn(rules[i]);
        if (filter(obj)) { return obj; }
    }
    return null;
};