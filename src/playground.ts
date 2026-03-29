import { tokenise } from "./lexer.ts";
import { parse } from "./parser.ts";
import { run } from "./evaluator.ts";

export function runCode(source: string): { output: string[]; error?: string } {
  const output: string[] = [];
  const originalLog = console.log;

  console.log = (...args: unknown[]) => {
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

(globalThis as Record<string, unknown>).XF = { runCode };
