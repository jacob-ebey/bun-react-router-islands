import * as path from "path";

export function Enhance<TArgs extends Array<unknown> = never>({
  with: name,
  args = [] as TArgs,
}: {
  with: string;
  args?: TArgs;
}) {
  const params = new URLSearchParams({
    src: path.relative(
      process.cwd(),
      path.resolve(process.cwd(), path.join("app/enhancements", name))
    ),
  });

  const scriptSrc = `/_script?${params.toString()}`;

  return (
    <script
      async
      type="module"
      dangerouslySetInnerHTML={{
        __html: `import(${JSON.stringify(
          scriptSrc
        )}).then(m=>m.default(...${JSON.stringify(
          args
        )})).catch(e=>console.error(${JSON.stringify(
          `Enahncement ${name} failed:`
        )},e))`,
      }}
    />
  );
}
