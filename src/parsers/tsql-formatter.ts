import { AND, EQUAL, DEFINE, Expression, MANY, Node, OPTIONAL, OR, EXPR } from "../expressions";

export const grammar = (): Expression[] => {
    const map: { [key: string]: Expression } = {};
    map["literal"] = DEFINE(
        "literal",
        AND(
            OR(
                EQUAL("'"),
                EQUAL("N'"),
                EQUAL("`")
            ),
            EQUAL("string"),
            OR(
                EQUAL("'"),
                EQUAL("`")
            ),
        ),
        (parent, children) => {
            return { ...parent, children: [children[1]] };
        }
    );
    map["word"] = DEFINE(
        "word",
        AND(
            OPTIONAL(EQUAL("[")),
            OPTIONAL(EQUAL("#")),
            EQUAL("string"),
            OPTIONAL(EQUAL("]")),
        ),
        (parent, children) => {
            return { ...parent, children: [children.length > 1 ? children[1] : children[0]] };
        }
    );
    map["alias"] = DEFINE(
        "alias",
        AND(
            OPTIONAL(EQUAL("AS")),
            EXPR(map, "word"),
        ),
        (parent, children) => {
            return { ...parent, children: [children[children.length - 1]] };
        }
    );
    map["name"] = DEFINE(
        "name",
        AND(
            OPTIONAL(AND(EXPR(map, "word"), EQUAL("."))),
            OPTIONAL(AND(EXPR(map, "word"), EQUAL("."))),
            OPTIONAL(AND(EXPR(map, "word"), EQUAL("."))),
            EXPR(map, "word"),
        ),
        (parent, children) => {
            return { ...parent, children: children.filter(x => x.type === "word").flatMap(x => x.children) };
        }
    );
    map["variable"] = DEFINE(
        "variable",
        AND(
            EQUAL("@"),
            EQUAL("string"),
        ),
        (parent, children) => {
            return { ...parent, name: children[1] };
        }
    );
    map["assignment"] = DEFINE(
        "assignment",
        AND(
            EXPR(map, "variable"),
            OR(
                EQUAL("="),
                EQUAL("+="),
                EQUAL("-="),
                EQUAL("*="),
                EQUAL("/="),
                EQUAL("%="),
            ),
            EXPR(map, "name"),
        )
    );
    map["object"] = DEFINE(
        "object",
        AND(
            EXPR(map, "name"),
            OPTIONAL(EXPR(map, "alias")),
            OPTIONAL(EQUAL(",")),
        ),
        (parent, children) => {
            return { ...parent, name: children[0], alias: children[1] };
        }
    );
    map["expression"] = DEFINE(
        "expression",
        AND(
            OPTIONAL(EQUAL("(")),
            OR(
                EXPR(map, "variable"),
                EXPR(map, "name"),
            ),
            OR(
                EQUAL("+"),
                EQUAL("-"),
                EQUAL("*"),
                EQUAL("/"),
                EQUAL("%")
            ),
            OR(
                EXPR(map, "expression"),
                EXPR(map, "variable"),
                EXPR(map, "literal"),
                EXPR(map, "name"),
                EQUAL("string"),
            ),
            OPTIONAL(EQUAL(")")),
        )
    );
    map["comparison"] = DEFINE(
        "comparison",
        AND(
            EXPR(map, "expression"),
            OR(
                EQUAL("<="),
                EQUAL("<>"),
                EQUAL(">="),
                EQUAL("!<"),
                EQUAL("!="),
                EQUAL("!>"),
                EQUAL("<"),
                EQUAL("="),
                EQUAL(">"),
            ),
            OR(
                EXPR(map, "expression"),
                EXPR(map, "variable"),
                EXPR(map, "literal"),
                EXPR(map, "name"),
                EQUAL("string"),
            )
        )
    );
    map["select"] = DEFINE(
        "select",
        AND(
            EQUAL("SELECT"),
            OR(
                EQUAL("*"),
                MANY(
                    OR(
                        EXPR(map, "object"),
                        EXPR(map, "assignment"),
                    )
                ),
            ),
            EQUAL("FROM"),
            EXPR(map, "object"),
            OPTIONAL(
                AND(
                    EQUAL("WHERE"),
                    EXPR(map, "comparison"),
                )
            ),
            OPTIONAL(EQUAL(";"))
        ),
        (parent, children) => {
            return { ...parent };
        }
    );
    return [map["select"]];
};