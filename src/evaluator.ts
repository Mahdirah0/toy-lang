import type {
  BinaryExpr,
  Block,
  CallExpr,
  FunctionDeclaration,
  Identifier,
  IfStatement,
  NumericLiteral,
  Program,
  ReturnStatement,
  Statement,
  StringLiteral,
  VarDeclaration,
} from "./parser.ts";

export class Environment {
  private variables: Map<string, RuntimeValue> = new Map();
  private parent: Environment | null;

  constructor(parent: Environment | null = null) {
    this.parent = parent;
  }

  define(name: string, value: RuntimeValue): RuntimeValue {
    if (this.variables.has(name)) {
      throw new Error(`Variable '${name}' is already defined`);
    }
    this.variables.set(name, value);
    return value;
  }

  lookup(name: string): RuntimeValue {
    if (this.variables.has(name)) {
      return this.variables.get(name)!;
    }
    if (this.parent) {
      return this.parent.lookup(name);
    }
    throw new Error(`Variable '${name}' is not defined`);
  }
}

export type NumberValue = {
  type: "number";
  value: number;
};

export type BooleanValue = {
  type: "boolean";
  value: boolean;
};

export type NullValue = {
  type: "null";
  value: null;
};

export type StringValue = {
  type: "string";
  value: string;
};

export type FunctionValue = {
  type: "function";
  name: string;
  params: string[];
  body: Block;
  closure: Environment;
};

export type RuntimeValue =
  | NumberValue
  | BooleanValue
  | NullValue
  | StringValue
  | FunctionValue;

const mkNumber = (value: number): NumberValue => ({ type: "number", value });
const mkBoolean = (value: boolean): BooleanValue => ({
  type: "boolean",
  value,
});
const mkNull = (): NullValue => ({ type: "null", value: null });
const mkString = (value: string): StringValue => ({ type: "string", value });

class ReturnSignal {
  constructor(public value: RuntimeValue) {}
}

const evaluate = (node: Statement, env: Environment): RuntimeValue => {
  switch (node.kind) {
    case "NumericLiteral":
      return mkNumber((node as NumericLiteral).value);

    case "StringLiteral":
      return mkString((node as StringLiteral).value);

    case "Identifier":
      return env.lookup((node as Identifier).name);

    case "BinaryExpr":
      return evaluateBinaryExpr(node as BinaryExpr, env);

    case "VarDeclaration":
      return evaluateVarDeclaration(node as VarDeclaration, env);

    case "Block":
      return evaluateBlock(node as Block, env);

    case "IfStatement":
      return evaluateIfStatement(node as IfStatement, env);

    case "FunctionDeclaration":
      return evaluateFunctionDeclaration(node as FunctionDeclaration, env);

    case "CallExpr":
      return evaluateCallExpr(node as CallExpr, env);

    case "ReturnStatement":
      return evaluateReturnStatement(node as ReturnStatement, env);

    default:
      throw new Error(`Unknown AST node kind: ${(node as Statement).kind}`);
  }
};

const evaluateBinaryExpr = (
  node: BinaryExpr,
  env: Environment,
): RuntimeValue => {
  const left = evaluate(node.left, env);
  const right = evaluate(node.right, env);

  // String concatenation with +
  if (
    node.operator === "+" && (left.type === "string" || right.type === "string")
  ) {
    const l = left.type === "string"
      ? left.value
      : left.type === "number"
      ? String(left.value)
      : left.type === "boolean"
      ? String(left.value)
      : "null";
    const r = right.type === "string"
      ? right.value
      : right.type === "number"
      ? String(right.value)
      : right.type === "boolean"
      ? String(right.value)
      : "null";
    return mkString(l + r);
  }

  // String equality
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
      `Cannot apply '${node.operator}' to ${left.type} and ${right.type}`,
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

const evaluateVarDeclaration = (
  node: VarDeclaration,
  env: Environment,
): RuntimeValue => {
  const value = evaluate(node.value, env);
  env.define(node.name, value);
  return value;
};

const evaluateBlock = (node: Block, env: Environment): RuntimeValue => {
  const blockEnv = new Environment(env);
  let result: RuntimeValue = mkNull();

  for (const stmt of node.body) {
    result = evaluate(stmt, blockEnv);
  }

  return result;
};

const isTruthy = (val: RuntimeValue): boolean => {
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

const evaluateIfStatement = (
  node: IfStatement,
  env: Environment,
): RuntimeValue => {
  const condition = evaluate(node.condition, env);

  if (isTruthy(condition)) {
    return evaluateBlock(node.thenBlock, env);
  } else if (node.elseBlock) {
    return evaluateBlock(node.elseBlock, env);
  }

  return mkNull();
};

const evaluateFunctionDeclaration = (
  node: FunctionDeclaration,
  env: Environment,
): RuntimeValue => {
  const fn: FunctionValue = {
    type: "function",
    name: node.name,
    params: node.params,
    body: node.body,
    closure: env,
  };

  env.define(node.name, fn);
  return fn;
};

const evaluateCallExpr = (
  node: CallExpr,
  env: Environment,
): RuntimeValue => {
  if (node.callee === "print") {
    const args = node.args.map((arg) => evaluate(arg, env));
    const output = args.map((a) => {
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
      `${fnVal.name}() expects ${fnVal.params.length} arguments, got ${args.length}`,
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

const evaluateReturnStatement = (
  node: ReturnStatement,
  env: Environment,
): RuntimeValue => {
  const value = evaluate(node.value, env);
  throw new ReturnSignal(value);
};

export const run = (program: Program): Environment => {
  const env = new Environment();

  for (const stmt of program.body) {
    evaluate(stmt, env);
  }

  return env;
};
