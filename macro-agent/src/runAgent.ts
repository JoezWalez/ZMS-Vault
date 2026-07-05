import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function runAgent(opts: {
  model: string;
  system: string;
  tools: unknown[];
  userMessage: string;
}): Promise<string> {
  const runner = client.beta.messages.toolRunner({
    model: opts.model,
    max_tokens: 16000,
    system: opts.system,
    // biome-ignore lint: tool runner accepts a mix of Zod tools and plain server-tool objects
    tools: opts.tools as any,
    messages: [{ role: "user", content: opts.userMessage }],
  });

  let finalText = "";
  for await (const message of runner) {
    const text = message.content
      .filter((block: any) => block.type === "text")
      .map((block: any) => block.text)
      .join("\n");
    if (text) finalText = text;
  }
  return finalText;
}
