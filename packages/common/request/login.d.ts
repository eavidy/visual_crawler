export namespace ApiReq {
    interface Login {
        userId: string;
        pwd: string;
        saveState?: boolean;
    }
}
export namespace ApiRes {
    type Login = {
        userId: string;
        accessToken: string;
        message?: string;
    };
    type Visitor =
        | {
              userId: string;
              pwd: string;
              enable: true;
              message: string;
          }
        | { enable: false; message: string };
}
