(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  var TokenType = /* @__PURE__ */ ((TokenType2) => {
    TokenType2[TokenType2["NUMBER"] = 0] = "NUMBER";
    TokenType2[TokenType2["STRING"] = 1] = "STRING";
    TokenType2[TokenType2["IDENTIFIER"] = 2] = "IDENTIFIER";
    TokenType2[TokenType2["LET"] = 3] = "LET";
    TokenType2[TokenType2["CONST"] = 4] = "CONST";
    TokenType2[TokenType2["VAR"] = 5] = "VAR";
    TokenType2[TokenType2["FUNCTION"] = 6] = "FUNCTION";
    TokenType2[TokenType2["RETURN"] = 7] = "RETURN";
    TokenType2[TokenType2["IF"] = 8] = "IF";
    TokenType2[TokenType2["ELSE"] = 9] = "ELSE";
    TokenType2[TokenType2["WHILE"] = 10] = "WHILE";
    TokenType2[TokenType2["FOR"] = 11] = "FOR";
    TokenType2[TokenType2["EQUALS"] = 12] = "EQUALS";
    TokenType2[TokenType2["EQUALS_EQUALS"] = 13] = "EQUALS_EQUALS";
    TokenType2[TokenType2["NOT_EQUALS"] = 14] = "NOT_EQUALS";
    TokenType2[TokenType2["LESS_THAN"] = 15] = "LESS_THAN";
    TokenType2[TokenType2["LESS_EQUALS"] = 16] = "LESS_EQUALS";
    TokenType2[TokenType2["GREATER_THAN"] = 17] = "GREATER_THAN";
    TokenType2[TokenType2["GREATER_EQUALS"] = 18] = "GREATER_EQUALS";
    TokenType2[TokenType2["BINARY_OPERATOR"] = 19] = "BINARY_OPERATOR";
    TokenType2[TokenType2["OPEN_PAREN"] = 20] = "OPEN_PAREN";
    TokenType2[TokenType2["CLOSE_PAREN"] = 21] = "CLOSE_PAREN";
    TokenType2[TokenType2["OPEN_BRACE"] = 22] = "OPEN_BRACE";
    TokenType2[TokenType2["CLOSE_BRACE"] = 23] = "CLOSE_BRACE";
    TokenType2[TokenType2["COMMA"] = 24] = "COMMA";
    TokenType2[TokenType2["SEMICOLON"] = 25] = "SEMICOLON";
    TokenType2[TokenType2["EOF"] = 26] = "EOF";
    return TokenType2;
  })(TokenType || {});
  var Keywords = {
    "let": 3 /* LET */,
    "const": 4 /* CONST */,
    "var": 5 /* VAR */,
    "function": 6 /* FUNCTION */,
    "return": 7 /* RETURN */,
    "if": 8 /* IF */,
    "else": 9 /* ELSE */,
    "while": 10 /* WHILE */,
    "for": 11 /* FOR */
  };
  var isDigit = (c) => c >= "0" && c <= "9";
  var isAlpha = (c) => c >= "a" && c <= "z" || c >= "A" && c <= "Z" || c === "_";
  var isAlphaNumeric = (c) => isAlpha(c) || isDigit(c);
  var tokenise = (source) => {
    const tokens = [];
    let pos = 0;
    const peek = () => source[pos] ?? "\0";
    const advance = () => source[pos++];
    while (pos < source.length) {
      const ch = advance();
      if (ch === " " || ch === "	" || ch === "\r" || ch === "\n") {
        continue;
      }
      switch (ch) {
        case "+":
        case "*":
        case "/":
          tokens.push({ type: 19 /* BINARY_OPERATOR */, value: ch });
          continue;
        case "(":
          tokens.push({ type: 20 /* OPEN_PAREN */, value: ch });
          continue;
        case ")":
          tokens.push({ type: 21 /* CLOSE_PAREN */, value: ch });
          continue;
        case ";":
          tokens.push({ type: 25 /* SEMICOLON */, value: ch });
          continue;
        case "{":
          tokens.push({ type: 22 /* OPEN_BRACE */, value: ch });
          continue;
        case "}":
          tokens.push({ type: 23 /* CLOSE_BRACE */, value: ch });
          continue;
        case ",":
          tokens.push({ type: 24 /* COMMA */, value: ch });
          continue;
        case "=":
          if (peek() === "=") {
            advance();
            tokens.push({ type: 13 /* EQUALS_EQUALS */, value: "==" });
          } else {
            tokens.push({ type: 12 /* EQUALS */, value: "=" });
          }
          continue;
        case "!":
          if (peek() === "=") {
            advance();
            tokens.push({ type: 14 /* NOT_EQUALS */, value: "!=" });
          } else {
            throw new Error(`Unexpected character: '${ch}'`);
          }
          continue;
        case "<":
          if (peek() === "=") {
            advance();
            tokens.push({ type: 16 /* LESS_EQUALS */, value: "<=" });
          } else {
            tokens.push({ type: 15 /* LESS_THAN */, value: "<" });
          }
          continue;
        case ">":
          if (peek() === "=") {
            advance();
            tokens.push({ type: 18 /* GREATER_EQUALS */, value: ">=" });
          } else {
            tokens.push({ type: 17 /* GREATER_THAN */, value: ">" });
          }
          continue;
      }
      if (ch === "-") {
        const prev = tokens.at(-1);
        const prevIsValue = prev !== void 0 && prev.type !== 19 /* BINARY_OPERATOR */ && prev.type !== 20 /* OPEN_PAREN */ && prev.type !== 12 /* EQUALS */ && prev.type !== 13 /* EQUALS_EQUALS */;
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
          tokens.push({ type: 0 /* NUMBER */, value: num });
        } else {
          tokens.push({ type: 19 /* BINARY_OPERATOR */, value: "-" });
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
        tokens.push({ type: 0 /* NUMBER */, value: num });
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
        advance();
        tokens.push({ type: 1 /* STRING */, value: str });
        continue;
      }
      if (isAlpha(ch)) {
        let word = ch;
        while (isAlphaNumeric(peek())) {
          word += advance();
        }
        const type = Keywords[word] ?? 2 /* IDENTIFIER */;
        tokens.push({ type, value: word });
        continue;
      }
      throw new Error(`Unexpected character: '${ch}'`);
    }
    tokens.push({ type: 26 /* EOF */, value: "" });
    return tokens;
  };

  // src/parser.ts
  var parse = (tokens) => {
    let pos = 0;
    const peek = () => tokens[pos];
    const advance = () => tokens[pos++];
    const expect = (type) => {
      const tok = advance();
      if (tok.type !== type) {
        throw new Error(
          `Parser error: expected ${TokenType[type]}, got ${TokenType[tok.type]} ("${tok.value}")`
        );
      }
      return tok;
    };
    const parsePrimary = () => {
      const tok = peek();
      switch (tok.type) {
        case 0 /* NUMBER */: {
          advance();
          return { kind: "NumericLiteral", value: parseFloat(tok.value) };
        }
        case 1 /* STRING */: {
          advance();
          return { kind: "StringLiteral", value: tok.value };
        }
        case 2 /* IDENTIFIER */: {
          advance();
          if (peek().type === 20 /* OPEN_PAREN */) {
            advance();
            const args = [];
            if (peek().type !== 21 /* CLOSE_PAREN */) {
              args.push(parseExpression());
              while (peek().type === 24 /* COMMA */) {
                advance();
                args.push(parseExpression());
              }
            }
            expect(21 /* CLOSE_PAREN */);
            return { kind: "CallExpr", callee: tok.value, args };
          }
          return { kind: "Identifier", name: tok.value };
        }
        case 20 /* OPEN_PAREN */: {
          advance();
          const expr = parseExpression();
          expect(21 /* CLOSE_PAREN */);
          return expr;
        }
        default:
          throw new Error(
            `Parser error: unexpected token ${TokenType[tok.type]} ("${tok.value}")`
          );
      }
    };
    const parseMultiplicative = () => {
      let left = parsePrimary();
      while (peek().type === 19 /* BINARY_OPERATOR */ && (peek().value === "*" || peek().value === "/")) {
        const operator = advance().value;
        const right = parsePrimary();
        left = { kind: "BinaryExpr", left, operator, right };
      }
      return left;
    };
    const parseAdditive = () => {
      let left = parseMultiplicative();
      while (peek().type === 19 /* BINARY_OPERATOR */ && (peek().value === "+" || peek().value === "-")) {
        const operator = advance().value;
        const right = parseMultiplicative();
        left = { kind: "BinaryExpr", left, operator, right };
      }
      return left;
    };
    const COMPARISON_TYPES = /* @__PURE__ */ new Set([
      13 /* EQUALS_EQUALS */,
      14 /* NOT_EQUALS */,
      15 /* LESS_THAN */,
      16 /* LESS_EQUALS */,
      17 /* GREATER_THAN */,
      18 /* GREATER_EQUALS */
    ]);
    const parseComparison = () => {
      let left = parseAdditive();
      while (COMPARISON_TYPES.has(peek().type)) {
        const operator = advance().value;
        const right = parseAdditive();
        left = { kind: "BinaryExpr", left, operator, right };
      }
      return left;
    };
    const parseExpression = () => {
      return parseComparison();
    };
    const parseBlock = () => {
      expect(22 /* OPEN_BRACE */);
      const body2 = [];
      while (peek().type !== 23 /* CLOSE_BRACE */ && peek().type !== 26 /* EOF */) {
        body2.push(parseStatement());
      }
      expect(23 /* CLOSE_BRACE */);
      return { kind: "Block", body: body2 };
    };
    const parseStatement = () => {
      switch (peek().type) {
        case 3 /* LET */:
        case 4 /* CONST */: {
          advance();
          const name = expect(2 /* IDENTIFIER */).value;
          expect(12 /* EQUALS */);
          const value = parseExpression();
          return { kind: "VarDeclaration", name, value };
        }
        case 8 /* IF */: {
          advance();
          expect(20 /* OPEN_PAREN */);
          const condition = parseExpression();
          expect(21 /* CLOSE_PAREN */);
          const thenBlock = parseBlock();
          let elseBlock = null;
          if (peek().type === 9 /* ELSE */) {
            advance();
            elseBlock = parseBlock();
          }
          return { kind: "IfStatement", condition, thenBlock, elseBlock };
        }
        case 6 /* FUNCTION */: {
          advance();
          const name = expect(2 /* IDENTIFIER */).value;
          expect(20 /* OPEN_PAREN */);
          const params = [];
          if (peek().type !== 21 /* CLOSE_PAREN */) {
            params.push(expect(2 /* IDENTIFIER */).value);
            while (peek().type === 24 /* COMMA */) {
              advance();
              params.push(expect(2 /* IDENTIFIER */).value);
            }
          }
          expect(21 /* CLOSE_PAREN */);
          const body2 = parseBlock();
          return { kind: "FunctionDeclaration", name, params, body: body2 };
        }
        case 7 /* RETURN */: {
          advance();
          const value = parseExpression();
          return { kind: "ReturnStatement", value };
        }
        default:
          return parseExpression();
      }
    };
    const body = [];
    while (peek().type !== 26 /* EOF */) {
      body.push(parseStatement());
    }
    return { kind: "Program", body };
  };

  // src/evaluator.ts
  var Environment = class {
    constructor(parent = null) {
      __publicField(this, "variables", /* @__PURE__ */ new Map());
      __publicField(this, "parent");
      this.parent = parent;
    }
    define(name, value) {
      if (this.variables.has(name)) {
        throw new Error(`Variable '${name}' is already defined`);
      }
      this.variables.set(name, value);
      return value;
    }
    lookup(name) {
      if (this.variables.has(name)) {
        return this.variables.get(name);
      }
      if (this.parent) {
        return this.parent.lookup(name);
      }
      throw new Error(`Variable '${name}' is not defined`);
    }
  };
  var mkNumber = (value) => ({ type: "number", value });
  var mkBoolean = (value) => ({
    type: "boolean",
    value
  });
  var mkNull = () => ({ type: "null", value: null });
  var mkString = (value) => ({ type: "string", value });
  var ReturnSignal = class {
    constructor(value) {
      this.value = value;
    }
  };
  var evaluate = (node, env) => {
    switch (node.kind) {
      case "NumericLiteral":
        return mkNumber(node.value);
      case "StringLiteral":
        return mkString(node.value);
      case "Identifier":
        return env.lookup(node.name);
      case "BinaryExpr":
        return evaluateBinaryExpr(node, env);
      case "VarDeclaration":
        return evaluateVarDeclaration(node, env);
      case "Block":
        return evaluateBlock(node, env);
      case "IfStatement":
        return evaluateIfStatement(node, env);
      case "FunctionDeclaration":
        return evaluateFunctionDeclaration(node, env);
      case "CallExpr":
        return evaluateCallExpr(node, env);
      case "ReturnStatement":
        return evaluateReturnStatement(node, env);
      default:
        throw new Error(`Unknown AST node kind: ${node.kind}`);
    }
  };
  var evaluateBinaryExpr = (node, env) => {
    const left = evaluate(node.left, env);
    const right = evaluate(node.right, env);
    if (node.operator === "+" && (left.type === "string" || right.type === "string")) {
      const l2 = left.type === "string" ? left.value : left.type === "number" ? String(left.value) : left.type === "boolean" ? String(left.value) : "null";
      const r2 = right.type === "string" ? right.value : right.type === "number" ? String(right.value) : right.type === "boolean" ? String(right.value) : "null";
      return mkString(l2 + r2);
    }
    if (left.type === "string" && right.type === "string") {
      switch (node.operator) {
        case "==":
          return mkBoolean(left.value === right.value);
        case "!=":
          return mkBoolean(left.value !== right.value);
        default:
          throw new Error(`Cannot apply '${node.operator}' to string and string`);
      }
    }
    if (left.type !== "number" || right.type !== "number") {
      throw new Error(
        `Cannot apply '${node.operator}' to ${left.type} and ${right.type}`
      );
    }
    const l = left.value;
    const r = right.value;
    switch (node.operator) {
      case "+":
        return mkNumber(l + r);
      case "-":
        return mkNumber(l - r);
      case "*":
        return mkNumber(l * r);
      case "/":
        if (r === 0) throw new Error("Division by zero");
        return mkNumber(l / r);
      case "==":
        return mkBoolean(l === r);
      case "!=":
        return mkBoolean(l !== r);
      case "<":
        return mkBoolean(l < r);
      case "<=":
        return mkBoolean(l <= r);
      case ">":
        return mkBoolean(l > r);
      case ">=":
        return mkBoolean(l >= r);
      default:
        throw new Error(`Unknown operator: ${node.operator}`);
    }
  };
  var evaluateVarDeclaration = (node, env) => {
    const value = evaluate(node.value, env);
    env.define(node.name, value);
    return value;
  };
  var evaluateBlock = (node, env) => {
    const blockEnv = new Environment(env);
    let result = mkNull();
    for (const stmt of node.body) {
      result = evaluate(stmt, blockEnv);
    }
    return result;
  };
  var isTruthy = (val) => {
    switch (val.type) {
      case "number":
        return val.value !== 0;
      case "string":
        return val.value.length > 0;
      case "boolean":
        return val.value;
      case "null":
        return false;
      default:
        return true;
    }
  };
  var evaluateIfStatement = (node, env) => {
    const condition = evaluate(node.condition, env);
    if (isTruthy(condition)) {
      return evaluateBlock(node.thenBlock, env);
    } else if (node.elseBlock) {
      return evaluateBlock(node.elseBlock, env);
    }
    return mkNull();
  };
  var evaluateFunctionDeclaration = (node, env) => {
    const fn = {
      type: "function",
      name: node.name,
      params: node.params,
      body: node.body,
      closure: env
    };
    env.define(node.name, fn);
    return fn;
  };
  var evaluateCallExpr = (node, env) => {
    if (node.callee === "print") {
      const args2 = node.args.map((arg) => evaluate(arg, env));
      const output = args2.map((a) => {
        if (a.type === "number") return String(a.value);
        if (a.type === "string") return a.value;
        if (a.type === "boolean") return String(a.value);
        if (a.type === "null") return "null";
        return `[function ${a.name}]`;
      }).join(" ");
      console.log(output);
      return mkNull();
    }
    const fnVal = env.lookup(node.callee);
    if (fnVal.type !== "function") {
      throw new Error(`'${node.callee}' is not a function`);
    }
    const args = node.args.map((arg) => evaluate(arg, env));
    if (args.length !== fnVal.params.length) {
      throw new Error(
        `${fnVal.name}() expects ${fnVal.params.length} arguments, got ${args.length}`
      );
    }
    const callEnv = new Environment(fnVal.closure);
    for (let i = 0; i < fnVal.params.length; i++) {
      callEnv.define(fnVal.params[i], args[i]);
    }
    try {
      for (const stmt of fnVal.body.body) {
        evaluate(stmt, callEnv);
      }
    } catch (signal) {
      if (signal instanceof ReturnSignal) {
        return signal.value;
      }
      throw signal;
    }
    return mkNull();
  };
  var evaluateReturnStatement = (node, env) => {
    const value = evaluate(node.value, env);
    throw new ReturnSignal(value);
  };
  var run = (program) => {
    const env = new Environment();
    for (const stmt of program.body) {
      evaluate(stmt, env);
    }
    return env;
  };

  // src/playground.ts
  function runCode(source) {
    const output = [];
    const originalLog = console.log;
    console.log = (...args) => {
      output.push(args.map(String).join(" "));
    };
    try {
      const tokens = tokenise(source);
      const ast = parse(tokens);
      run(ast);
      return { output };
    } catch (e) {
      return { output, error: e instanceof Error ? e.message : String(e) };
    } finally {
      console.log = originalLog;
    }
  }
  globalThis.XF = { runCode };
})();
//# sourceMappingURL=playground.js.map
