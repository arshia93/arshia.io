export function Stack() {
  const stack = {
    Product: ["Figma", "Linear", "Amplitude", "Notion"],
    Technical: ["JavaScript/React", "TypeScript", "Python", "SQL"],
    "AI / ML": ["OpenAI", "LLMs", "RAG", "AI Automations"],
  }

  return (
    <section id="stack" className="mb-24 md:mb-32">
      <h2 className="text-sm text-muted-foreground mb-8 uppercase tracking-wider">Stack</h2>

      <div className="grid md:grid-cols-3 gap-8">
        {Object.entries(stack).map(([category, tools]) => (
          <div key={category}>
            <h3 className="text-sm text-muted-foreground mb-4">{category}</h3>
            <div className="flex flex-wrap gap-2">
              {tools.map((tool) => (
                <span key={tool} className="text-sm text-foreground bg-secondary px-3 py-1.5 rounded-md">
                  {tool}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
