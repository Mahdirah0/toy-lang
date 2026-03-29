import { Token, TokenType } from "./lexer.ts";

export type NumericLiteral = {
  kind: "NumericLiteral";
  value: number;
};

export type StringLiteral = {
  kind: "StringLiteral";
  value: string;
};

export type Identifier = {
  kind: "Identifier";
  name: string;
};

export type BinaryExpr = {
  kind: "BinaryExpr";
  left: Expr;
  operator: string;
  right: Expr;
};

export type CallExpr = {
  kind: "CallExpr";
  callee: string;
  args: Expr[];
};

export type Expr =
  | NumericLiteral
  | StringLiteral
  | Identifier
  | BinaryExpr
  | CallExpr;

export type VarDeclaration = {
  kind: "VarDeclaration";
  name: string;
  value: Expr;
};

export type Block = {
  kind: "Block";
  body: Statement[];
};

export type IfStatement = {
  kind: "IfStatement";
  condition: Expr;
  thenBlock: Block;
  elseBlock: Block | null;
};

export type FunctionDeclaration = {
  kind: "FunctionDeclaration";
  name: string;
  params: string[];
  body: Block;
};

export type ReturnStatement = {
  kind: "ReturnStatement";
  value: Expr;
};

export type Statement =
  | VarDeclaration
  | IfStatement
  | FunctionDeclaration
  | ReturnStatement
  | Block
  | Expr;

export type Program = {
  kind: "Program";
  body: Statement[];
};

export const parse = (tokens: Token[]): Program => {
  let pos = 0;

  const peek = (): Token => tokens[pos];
  const advance = (): Token => tokens[pos++];

  const expect = (type: TokenType): Token => {
    const tok = advance();
    if (tok.type !== type) {
      throw new Error(
        `Parser error: expected ${TokenType[type]}, got ${
          TokenType[tok.type]
        } ("${tok.value}")`,
      );
    }
    return tok;
  };

  const parsePrimary = (): Expr => {
    const tok = peek();

    switch (tok.type) {
      case TokenType.NUMBER: {
        advance();
        return { kind: "NumericLiteral", value: parseFloat(tok.value) };
      }

      case TokenType.STRING: {
        advance();
        return { kind: "StringLiteral", value: tok.value };
      }

      case TokenType.IDENTIFIER: {
        advance();
        if (peek().type === TokenType.OPEN_PAREN) {
          advance();
          const args: Expr[] = [];

          if (peek().type !== TokenType.CLOSE_PAREN) {
            args.push(parseExpression());
            while (peek().type === TokenType.COMMA) {
              advance();
              args.push(parseExpression());
            }
          }

          expect(TokenType.CLOSE_PAREN);
          return { kind: "CallExpr", callee: tok.value, args };
        }

        return { kind: "Identifier", name: tok.value };
      }

      case TokenType.OPEN_PAREN: {
        advance();
        const expr = parseExpression();
        expect(TokenType.CLOSE_PAREN);
        return expr;
      }

      default:
        throw new Error(
          `Parser error: unexpected token ${
            TokenType[tok.type]
          } ("${tok.value}")`,
        );
    }
  };

  const parseMultiplicative = (): Expr => {
    let left = parsePrimary();

    while (
      peek().type === TokenType.BINARY_OPERATOR &&
      (peek().value === "*" || peek().value === "/")
    ) {
      const operator = advance().value;
      const right = parsePrimary();
      left = { kind: "BinaryExpr", left, operator, right };
    }

    return left;
  };

  const parseAdditive = (): Expr => {
    let left = parseMultiplicative();

    while (
      peek().type === TokenType.BINARY_OPERATOR &&
      (peek().value === "+" || peek().value === "-")
    ) {
      const operator = advance().value;
      const right = parseMultiplicative();
      left = { kind: "BinaryExpr", left, operator, right };
    }

    return left;
  };

  const COMPARISON_TYPES = new Set([
    TokenType.EQUALS_EQUALS,
    TokenType.NOT_EQUALS,
    TokenType.LESS_THAN,
    TokenType.LESS_EQUALS,
    TokenType.GREATER_THAN,
    TokenType.GREATER_EQUALS,
  ]);

  const parseComparison = (): Expr => {
    let left = parseAdditive();

    while (COMPARISON_TYPES.has(peek().type)) {
      const operator = advance().value;
      const right = parseAdditive();
      left = { kind: "BinaryExpr", left, operator, right };
    }

    return left;
  };

  const parseExpression = (): Expr => {
    return parseComparison();
  };

  const parseBlock = (): Block => {
    expect(TokenType.OPEN_BRACE);

    const body: Statement[] = [];
    while (
      peek().type !== TokenType.CLOSE_BRACE && peek().type !== TokenType.EOF
    ) {
      body.push(parseStatement());
    }

    expect(TokenType.CLOSE_BRACE);
    return { kind: "Block", body };
  };

  const parseStatement = (): Statement => {
    switch (peek().type) {
      case TokenType.LET:
      case TokenType.CONST: {
        advance();
        const name = expect(TokenType.IDENTIFIER).value;
        expect(TokenType.EQUALS);
        const value = parseExpression();
        return { kind: "VarDeclaration", name, value };
      }

      case TokenType.IF: {
        advance();
        expect(TokenType.OPEN_PAREN);
        const condition = parseExpression();
        expect(TokenType.CLOSE_PAREN);
        const thenBlock = parseBlock();

        let elseBlock: Block | null = null;
        if (peek().type === TokenType.ELSE) {
          advance();
          elseBlock = parseBlock();
        }

        return { kind: "IfStatement", condition, thenBlock, elseBlock };
      }

      case TokenType.FUNCTION: {
        advance();
        const name = expect(TokenType.IDENTIFIER).value;

        expect(TokenType.OPEN_PAREN);
        const params: string[] = [];
        if (peek().type !== TokenType.CLOSE_PAREN) {
          params.push(expect(TokenType.IDENTIFIER).value);
          while (peek().type === TokenType.COMMA) {
            advance();
            params.push(expect(TokenType.IDENTIFIER).value);
          }
        }
        expect(TokenType.CLOSE_PAREN);

        const body = parseBlock();
        return { kind: "FunctionDeclaration", name, params, body };
      }

      case TokenType.RETURN: {
        advance();
        const value = parseExpression();
        return { kind: "ReturnStatement", value };
      }

      default:
        return parseExpression();
    }
  };

  const body: Statement[] = [];
  while (peek().type !== TokenType.EOF) {
    body.push(parseStatement());
  }

  return { kind: "Program", body };
};
