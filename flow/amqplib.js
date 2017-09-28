// @flow

declare class events$EventEmitter {
  static listenerCount(emitter: events$EventEmitter, event: string): number;

  addListener(event: string, listener: Function): events$EventEmitter;
  emit(event: string, ...args:Array<any>): boolean;
  listeners(event: string): Array<Function>;
  on(event: string, listener: Function): events$EventEmitter;
  once(event: string, listener: Function): events$EventEmitter;
  removeAllListeners(event?: string): events$EventEmitter;
  removeListener(event: string, listener: Function): events$EventEmitter;
  setMaxListeners(n: number): void;
}

declare module "amqplib" {
  declare type SocketOptions = {}; // TODO
  declare type Args = { [key: string]: string };
  declare type Headers = { [key: string]: string };

  declare type QueueOptions = {
    exclusive?: boolean,
    durable?: boolean,
    autoDelete?: boolean,
    arguments?: Args,
    /* extenstions */
    messageTtl?: number,
    expires?: number,
    deadLetterExchange?: string,
    maxLength?: number,
    maxPriority?: number
  };

  declare type QueueOk = {
    queue: string,
    messageCount: number,
    consumerCount: number
  };

  declare type DeleteOk = {
    messageCount: number
  };

  declare type DeleteQueueOpts = {
    ifUnused?: boolean,
    ifEmpty?: boolean
  };

  declare type ExchangeType =
    | 'fanout'
    | 'direct'
    | 'topic'
    | 'headers'
  ;

  declare type ExchangeOpts = {
    durable?: boolean,
    internal?: boolean,
    autoDelete?: boolean,
    alternateExchange?: string,
    arguments?: Args
  };

  declare type ExchangeOk = {
    exchange: string
  };

  declare type ExchangeDeleteOpts = {
    ifUnused?: boolean;
  };

  declare type PublishOpts = {
    expiration?: number,
    userId?: string,
    CC?: string | Array<string>,
    BCC?: string | Array<string>,
    priority?: number,
    persistent?: boolean,
    deliveryMode?: 1 | 2,
    mandatory?: boolean,
    contentType?: string,
    contentEncoding?: string,
    headers?: Headers,
    correlationId?: string,
    replyTo?: string,
    messageId?: string,
    timestamp?: number,
    type?: string,
    appId?: string
  };

  declare type ConsumeOpts = {
    consumerTag?: string,
    noLocal?: boolean,
    noAck?: boolean,
    exclusive?: boolean,
    priority?: number,
    arguments?: Args
  };

  declare type GetOpts = {
    noAck?: boolean
  };

  declare type Callback<T> = (err: Error, res: T) => any;

  declare class Message {
    content: Buffer;
    fields: {
      deliveryTag: string,
      consumerTag: string,
      exchange: string,
      routingKey: string,
      redelivered: boolean
    };
    properties: PublishOpts;
  }

  declare class Channel extends events$EventEmitter{
    close(): Promise<void>;
    assertQueue(queue: ?string, options?: QueueOptions): Promise<QueueOk>;
    checkQueue(queue: string): Promise<QueueOk>;
    deleteQueue(queue: string, opts?: DeleteQueueOpts): Promise<DeleteOk>;
    purgeQueue(queue: string): Promise<DeleteOk>;
    bindQueue(queue: string, exchange: string, routingKey: string, args?: Args): Promise<void>;
    unbindQueue(queue: string, exchange: string, routingKey: string, args?: Args): Promise<void>;

    assertExchange(exchange: string, type: ExchangeType, opts?: ExchangeOpts): Promise<ExchangeOk>;
    checkExchange(exchange: string): Promise<ExchangeOk>; // TODO check return val
    deleteExchange(exchange: string, opts?: ExchangeDeleteOpts): Promise<void>;
    bindExchange(dst: string, src: string, routingKey: string, args?: Args): Promise<void>;
    unbindExchange(dst: string, src: string, routingKey: string, args?: Args): Promise<void>;

    publish(exchange: string, routingKey: string, content: Buffer, opts?: PublishOpts): boolean;
    sendToQueue(queue: string, content: Buffer, opts?: PublishOpts): boolean;

    consume(queue: string, fn: (msg: ?Message) => any, opts?: ConsumeOpts): Promise<{ consumerTag: string }>;
    cancel(consumerTag: string): Promise<{}>; // TODO
    get(queue: string, opts?: GetOpts): Promise<false | Message>;
    ack(message: Message, allUpTo?: boolean): void;
    ackAll(): void;
    nack(message: Message, allUpTo?: boolean, requeue?: boolean): void;
    nackAll(requeue?: boolean): void;
    reject(message: Message, requeue?: boolean): void;
    prefetch(count: number, global?: boolean): void;
    recover(): Promise<{}>
  }

  declare class ConfirmChannel extends Channel {
    publish(exchange: string, routingKey: string, content: Buffer, opts?: PublishOpts, cb?: Callback<{}>): boolean;
    sendToQueue(queue: string, content: Buffer, opts?: PublishOpts, cb?: Callback<{}>): boolean;
    waitForConfirms(): Promise<void>;
  }

  declare class Connection extends events$EventEmitter {
    close(): Promise<void>;
    createChannel(): Promise<Channel>;
    createConfirmChannel(): Promise<ConfirmChannel>;
  }

  declare function connect(url?: string, socketOptions?: SocketOptions): Promise<Connection>;
}
