import { AND, EQUAL, DEFINE, Expression, MANY, OPTIONAL, OR, EXPR } from "../expressions";

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
        )
    );
    map["word"] = DEFINE(
        "word",
        AND(
            OPTIONAL(EQUAL("[")),
            OPTIONAL(EQUAL("#")),
            EQUAL("string"),
            OPTIONAL(EQUAL("]")),
        )
    );
    map["name"] = DEFINE(
        "name",
        AND(
            OPTIONAL(AND(EXPR(map, "word"), EQUAL("."))),
            OPTIONAL(AND(EXPR(map, "word"), EQUAL("."))),
            OPTIONAL(AND(EXPR(map, "word"), EQUAL("."))),
            EXPR(map, "word"),
        )
    );
    map["variable"] = DEFINE(
        "variable",
        AND(
            EQUAL("@"),
            OR(
                EQUAL("number"),
                EQUAL("string"),
            )
        )
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
    map["function"] = DEFINE(
        "function",
        AND(
            EXPR(map, "name"),
            EQUAL("("),
            MANY(
                AND(
                    EXPR(map, "expression"),
                    OPTIONAL(EQUAL(","))
                )
            ),
            EQUAL(")"),
        )
    );
    map["object"] = DEFINE(
        "object",
        AND(
            OR(
                EXPR(map, "function"),
                EXPR(map, "name"),
            ),
            OPTIONAL(
                AND(
                    OPTIONAL(EQUAL("AS")),
                    EXPR(map, "word"),
                )
            ),
        )
    );
    map["operant"] = DEFINE(
        "operant",
        OR(
            EXPR(map, "variable"),
            EXPR(map, "literal"),
            EXPR(map, "name"),
            EQUAL("number"),
            EQUAL("string"),
            AND(
                EQUAL("("),
                EXPR(map, "expression"),
                EQUAL(")"),
            ),
        )
    );
    map["operation"] = DEFINE(
        "operation",
        AND(
            EXPR(map, "operant"),
            OPTIONAL(
                MANY(
                    AND(
                        OR(
                            EQUAL("*"),
                            EQUAL("/"),
                            EQUAL("+"),
                            EQUAL("-"),
                            EQUAL("%")
                        ),
                        EXPR(map, "operant"),
                    )
                )
            ),
        )
    );
    map["expression"] = DEFINE(
        "expression",
        OR(
            EXPR(map, "operation"),
            EXPR(map, "operant"),
        )
    );
    //  https://learn.microsoft.com/en-us/sql/t-sql/queries/search-condition-transact-sql?view=sql-server-ver16
    map["comparison"] = DEFINE(
        "comparison",
        OR(
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
                EXPR(map, "expression"),
            ),
            AND(
                EXPR(map, "expression"),
                EQUAL("IS"),
                OPTIONAL(EQUAL("NOT")),
                EQUAL("NULL"),
            ),
            AND(
                EQUAL("("),
                EXPR(map, "criteria"),
                EQUAL(")"),
            )
        )
    );
    map["condition"] = DEFINE(
        "condition",
        AND(
            EXPR(map, "comparison"),
            OPTIONAL(
                MANY(
                    AND(
                        OR(
                            EQUAL("AND"),
                            EQUAL("OR"),
                        ),
                        EXPR(map, "comparison"),
                    )
                )
            ),
        )
    );
    map["criteria"] = DEFINE(
        "criteria",
        OR(
            EXPR(map, "condition"),
            EXPR(map, "comparison"),
        )
    );
    map["join"] = DEFINE(
        "join",
        OR(
            AND(
                OPTIONAL(
                    OR(
                        EQUAL("INNER"),
                        EQUAL("CROSS"),
                        AND(
                            OR(
                                EQUAL("LEFT"),
                                EQUAL("RIGHT"),
                                EQUAL("FULL"),
                            ),
                            OPTIONAL(EQUAL("OUTER")),
                        ),
                    )
                ),
                EQUAL("JOIN"),
                EXPR(map, "object"),
                EQUAL("ON"),
                EXPR(map, "criteria"),
            ),
            AND(
                OR(
                    EQUAL("CROSS"),
                    EQUAL("OUTER"),
                ),
                EQUAL("APPLY"),
                EXPR(map, "object"),
            ),
        ),
    );
    map["select"] = DEFINE(
        "select",
        AND(
            EQUAL("SELECT"),
            OPTIONAL(EQUAL("DISTINCT")),
            OPTIONAL(
                AND(
                    EQUAL("TOP"),
                    EQUAL("number"),
                )
            ),
            OR(
                EQUAL("*"),
                MANY(
                    AND(
                        OR(
                            EXPR(map, "assignment"),
                            EXPR(map, "object"),
                            EQUAL("number"),
                        ),
                        OPTIONAL(EQUAL(",")),
                    )
                ),
            ),
        )
    );
    map["from"] = DEFINE(
        "from",
        AND(
            EQUAL("FROM"),
            EXPR(map, "object"),
            OPTIONAL(MANY(EXPR(map, "join")))
        )
    );
    map["where"] = DEFINE(
        "where",
        AND(
            OPTIONAL(
                AND(
                    EQUAL("WHERE"),
                    EXPR(map, "criteria"),
                )
            ),
        )
    );
    map["query"] = DEFINE(
        "query",
        AND(
            EXPR(map, "select"),
            OPTIONAL(EXPR(map, "from")),
            OPTIONAL(EXPR(map, "where")),
            OPTIONAL(EQUAL(";"))
        )
    );
    return [map["query"]];
};