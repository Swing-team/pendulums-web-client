/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

declare module 'socket.io-client' {
  var e: any;
  export = e;
}
