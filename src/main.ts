import { tokenise } from "./lexer.ts";
import { parse } from "./parser.ts";
import { run } from "./evaluator.ts";

const main = async () => {
  const sourceCode = await Deno.readTextFile(
    new URL("./programs/first.xf", import.meta.url),
  );

  const tokens = tokenise(sourceCode);
  const ast = parse(tokens);
  const env = run(ast);

  console.log("Program finished. Final environment:");
  console.log(env);
};

if (import.meta.main) {
  main();
}
