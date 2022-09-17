export type LoggerArgs = string[];

export default function logger(_: string, __: unknown, ...args: LoggerArgs) {
  console.log(...args);
}
