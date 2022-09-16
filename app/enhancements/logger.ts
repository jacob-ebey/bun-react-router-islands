export type LoggerArgs = string[];

export default function logger(...args: LoggerArgs) {
  console.log(...args);
}
