type MessageType =
  | {
      type: 'ping';
      target: 'popup';
      data: { msg: string; data?: unknown };
    }
  | {
      type: 'stepup';
      target: 'offscreen';
      data: { access: string };
    }
  | {
      type: 'open offscreen';
      target: 'background';
    }
  | {
      type: 'refresh_x_blacklist';
      target: 'background';
    }
  | {
      type: 'placeholder';
      target: 'popup' | 'offscreen';
      data: unknown;
    };

type ExternalMessageType =
  | MessageType
  | {
      type: 'auth';
      data?: {
        access?: string;
        refresh?: string;
      } | null;
    }
  | {
      type: 'open popup';
    };

type SendMessageResult =
  | {
      code?: number;
      result?: unknown;
    }
  | null
  | undefined;

export type { ExternalMessageType, MessageType, SendMessageResult };
