export class FieldCheckError extends Error {
  constructor(checkRes: any) {
    super("字段校验不通过:\n" + JSON.stringify(checkRes, null, 2));
  }
}
