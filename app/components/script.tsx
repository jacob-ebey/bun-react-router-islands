import {
  Children,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  useId,
} from "react";
import * as path from "path";

type EnhanceProps<TArgs extends Array<unknown>> = {
  with: string;
  args?: TArgs;
};

export function Enhance<TArgs extends Array<unknown> = never>({
  with: name,
  args = [] as TArgs,
  ...rest
}:
  | EnhanceProps<TArgs>
  | (EnhanceProps<TArgs> & HTMLAttributes<HTMLDivElement>)) {
  const id = useId();

  const params = new URLSearchParams({
    src: path.relative(
      process.cwd(),
      path.resolve(process.cwd(), path.join("./app/enhancements", name))
    ),
  });

  const scriptSrc = `/_script?${params.toString()}`;

  let children;
  if ("children" in rest) {
    let { children: childrenNew, ...restNew } = rest;
    children = childrenNew;
    rest = restNew;
  }

  const childrenArr = Children.toArray(children);
  if (childrenArr.length > 1) {
    throw new Error("Enhance can only have one child");
  }
  const child = childrenArr[0] as ReactElement;
  if (child && (typeof child !== "object" || child == null)) {
    throw new Error("Enhance can only have a react element a child");
  }

  const props = (child && child.props) || null;

  return (
    <>
      {child && <div {...rest}>{child}</div>}
      <script
        async
        type="module"
        id={id}
        dangerouslySetInnerHTML={{
          __html: `import(${JSON.stringify(
            scriptSrc
          )}).then(m=>m.default(${JSON.stringify(id)}, ${JSON.stringify(
            props
          )},...${JSON.stringify(
            args
          )})).catch(e=>console.error(${JSON.stringify(
            `Enahncement ${name} failed:`
          )},e))`,
        }}
      />
    </>
  );
}
