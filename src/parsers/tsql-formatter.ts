import { AND, EQUAL, EXPR, Expression, MANY, Node, OPTIONAL, OR } from "../expressions";

export const grammar = (): Expression[] => {
    const map: { [key: string]: Expression } = {};
    map["literal"] = EXPR(
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
    map["word"] = EXPR(
        "word",
        AND(
            OPTIONAL(EQUAL("[")),
            EQUAL("string"),
            OPTIONAL(EQUAL("]")),
        ),
        (parent, children) => {
            return { ...parent, children: [children.length > 1 ? children[1] : children[0]] };
        }
    );
    map["alias"] = EXPR(
        "alias",
        AND(
            OPTIONAL(EQUAL("AS")),
            map["word"],
        ),
        (parent, children) => {
            return { ...parent, children: [children[children.length - 1]] };
        }
    );
    map["name"] = EXPR(
        "name",
        AND(
            OPTIONAL(AND(map["word"], EQUAL("."))),
            OPTIONAL(AND(map["word"], EQUAL("."))),
            OPTIONAL(AND(map["word"], EQUAL("."))),
            map["word"]
        ),
        (parent, children) => {
            return { ...parent, children: children.filter(x => x.type === "word").flatMap(x => x.children) };
        }
    );
    map["variable"] = EXPR(
        "variable",
        AND(
            EQUAL("@"),
            EQUAL("string"),
        ),
        (parent, children) => {
            return { ...parent, name: children[1] };
        }
    );
    map["object"] = EXPR(
        "object",
        AND(
            map["name"],
            OPTIONAL(map["alias"]),
            OPTIONAL(EQUAL(",")),
        ),
        (parent, children) => {
            return { ...parent, name: children[0], alias: children[1] };
        }
    );
    map["expression"] = EXPR(
        "expression",
        AND(
            OPTIONAL(EQUAL("(")),
            OR(
                map["name"],
                map["variable"],
            ),
            OR(
                EQUAL("+"),
                EQUAL("-"),
                EQUAL("*"),
                EQUAL("/"),
                EQUAL("="),
                EQUAL(">"),
                EQUAL("<"),
                EQUAL(">="),
                EQUAL("<=")
            ),
            OR(
                EQUAL("string"),
                map["literal"],
                map["name"],
                map["expression"],
            ),
            OPTIONAL(EQUAL(")")),
        )
    );
    map["select"] = EXPR(
        "select",
        AND(
            EQUAL("SELECT"),
            OR(
                EQUAL("*"),
                MANY(map["object"]),
            ),
            EQUAL("FROM"),
            map["object"],
            OPTIONAL(
                AND(
                    EQUAL("WHERE"),
                    map["expression"]
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