export enum TokenType {
  NUMBER,
  STRING,
  IDENTIFIER,

  LET,
  CONST,
  VAR,
  FUNCTION,
  RETURN,
  IF,
  ELSE,
  WHILE,
  FOR,

  EQUALS,
  EQUALS_EQUALS,
  NOT_EQUALS,
  LESS_THAN,
  LESS_EQUALS,
  GREATER_THAN,
  GREATER_EQUALS,
  BINARY_OPERATOR,
  OPEN_PAREN,
  CLOSE_PAREN,
  OPEN_BRACE,
  CLOSE_BRACE,
  COMMA,
  SEMICOLON,

  EOF,
}

const Keywords: Record<string, TokenType> = {
  "let": TokenType.LET,
  "const": TokenType.CONST,
  "var": TokenType.VAR,
  "function": TokenType.FUNCTION,
  "return": TokenType.RETURN,
  "if": TokenType.IF,
  "else": TokenType.ELSE,
  "while": TokenType.WHILE,
  "for": TokenType.FOR,
};

export type Token = {
  type: TokenType;
  value: string;
};

const isDigit = (c: string): boolean => c >= "0" && c <= "9";
const isAlpha = (c: string): boolean =>
  (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c === "_";
const isAlphaNumeric = (c: string): boolean => isAlpha(c) || isDigit(c);

export const tokenise = (source: string): Token[] => {
  const tokens: Token[] = [];
  let pos = 0;

  const peek = (): string => source[pos] ?? "\0";
  const advance = (): string => source[pos++];

  while (pos < source.length) {
    const ch = advance();

    if (ch === " " || ch === "\t" || ch === "\r" || ch === "\n") {
      continue;
    }

    switch (ch) {
      case "+":
      case "*":
      case "/":
        tokens.push({ type: TokenType.BINARY_OPERATOR, value: ch });
        continue;
      case "(":
        tokens.push({ type: TokenType.OPEN_PAREN, value: ch });
        continue;
      case ")":
        tokens.push({ type: TokenType.CLOSE_PAREN, value: ch });
        continue;
      case ";":
        tokens.push({ type: TokenType.SEMICOLON, value: ch });
        continue;
      case "{":
        tokens.push({ type: TokenType.OPEN_BRACE, value: ch });
        continue;
      case "}":
        tokens.push({ type: TokenType.CLOSE_BRACE, value: ch });
        continue;
      case ",":
        tokens.push({ type: TokenType.COMMA, value: ch });
        continue;
      case "=":
        if (peek() === "=") {
          advance();
          tokens.push({ type: TokenType.EQUALS_EQUALS, value: "==" });
        } else {
          tokens.push({ type: TokenType.EQUALS, value: "=" });
        }
        continue;
      case "!":
        if (peek() === "=") {
          advance();
          tokens.push({ type: TokenType.NOT_EQUALS, value: "!=" });
        } else {
          throw new Error(`Unexpected character: '${ch}'`);
        }
        continue;
      case "<":
        if (peek() === "=") {
          advance();
          tokens.push({ type: TokenType.LESS_EQUALS, value: "<=" });
        } else {
          tokens.push({ type: TokenType.LESS_THAN, value: "<" });
        }
        continue;
      case ">":
        if (peek() === "=") {
          advance();
          tokens.push({ type: TokenType.GREATER_EQUALS, value: ">=" });
        } else {
          tokens.push({ type: TokenType.GREATER_THAN, value: ">" });
        }
        continue;
    }

    if (ch === "-") {
      const prev = tokens.at(-1);

      const prevIsValue = prev !== undefined &&
        prev.type !== TokenType.BINARY_OPERATOR &&
        prev.type !== TokenType.OPEN_PAREN &&
        prev.type !== TokenType.EQUALS &&
        prev.type !== TokenType.EQUALS_EQUALS;

      if (!prevIsValue && isDigit(peek())) {
        let num = "-";
        while (isDigit(peek())) {
          num += advance();
        }
        if (peek() === "." && isDigit(source[pos + 1] ?? "")) {
          num += advance();
          while (isDigit(peek())) {
            num += advance();
          }
        }
        tokens.push({ type: TokenType.NUMBER, value: num });
      } else {
        tokens.push({ type: TokenType.BINARY_OPERATOR, value: "-" });
      }
      continue;
    }

    if (isDigit(ch)) {
      let num = ch;
      while (isDigit(peek())) {
        num += advance();
      }
      if (peek() === "." && isDigit(source[pos + 1] ?? "")) {
        num += advance();
        while (isDigit(peek())) {
          num += advance();
        }
      }
      tokens.push({ type: TokenType.NUMBER, value: num });
      continue;
    }

    if (ch === '"' || ch === "'") {
      const quote = ch;
      let str = "";
      while (pos < source.length && peek() !== quote) {
        str += advance();
      }
      if (pos >= source.length) {
        throw new Error(`Unterminated string literal`);
      }
      advance(); // closing quote
      tokens.push({ type: TokenType.STRING, value: str });
      continue;
    }

    if (isAlpha(ch)) {
      let word = ch;
      while (isAlphaNumeric(peek())) {
        word += advance();
      }
      const type = Keywords[word] ?? TokenType.IDENTIFIER;
      tokens.push({ type, value: word });
      continue;
    }

    throw new Error(`Unexpected character: '${ch}'`);
  }

  tokens.push({ type: TokenType.EOF, value: "" });
  return tokens;
};
