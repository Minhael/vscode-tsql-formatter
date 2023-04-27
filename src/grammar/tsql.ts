import { Token } from "../lexer";
import { Node } from "../parser";

const select = (tokens: Token[], index: number): Node | null => {
    if (tokens[index].type === "SELECT") {

    }
    return null;
};