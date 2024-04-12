import md5 from "js-md5";
export function createPwdHash(pwd: string) {
  return md5(pwd + "asnow");
}
