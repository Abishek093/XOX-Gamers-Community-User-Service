
export interface IMessage {
    _id?: string;
    chatId: string;
    sender: {
      _id: string;
      displayName: string;
      profileImage: string;
    };
    content: string;
    media?: Array<{
      type: 'image' | 'video' | 'audio';
      url: string;
    }>;
    createdAt: Date;
    seen: boolean;
    repliedTo?: string;
  }


  export interface MessageSeenResult {
    chatId: string;
    messageIds: string[];
    seenBy: string;
  }