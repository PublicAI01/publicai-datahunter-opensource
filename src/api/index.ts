import http from '@/utils/http';

export interface UserInfo {
  avatar?: string;
  earnings?: number;
  earn_more_link?: string;
  builder_point?: number;
  email?: string;
  level?: number;
  level_name?: string;
  name?: string;
  referral_code?: string;
  twitter_name?: string;
  wallet?: string;
  work?: number;
}

const fetchSelf = () => http.get('api/data_hunter/self').json<UserInfo>();

export interface TweetData {
  author_id?: string;
  author_image: string;
  author_name: string;
  tweet: string;
  tweet_id: string;
  timestamp?: number;
}

const fetchCollectionTweet = (data: TweetData) =>
  http
    .post('api/data_hunter/tweet', {
      headers: {
        'Content-Type': 'application/json',
      },
      json: data,
    })
    .json<{ dataset_id: string }>();

export interface GPTData {
  id: string;
  title: string;
  list: {
    id: string;
    role: string;
    content: string;
  }[];
}

const fetchCollectionGPT = (data: GPTData) =>
  http
    .post('api/data_hunter/chat', {
      headers: {
        'Content-Type': 'application/json',
      },
      json: data,
    })
    .json<{ reward: number }>();

const fetchSendEvent = () => http.post('api/data_hunter/event').json();

export interface XInfo {
  content?: string;
  id?: string;
  info: unknown;
  time?: number;
}

export interface GenerateResult {
  promotion?: string;
}

const fetchGenerateXComments = (data: XInfo) =>
  http
    .post('api/data_hunter/promotion/text', {
      headers: {
        'Content-Type': 'application/json',
      },
      json: data,
    })
    .json<GenerateResult>();

const fetchCheckReply = (data: XInfo) =>
  http
    .post('api/data_hunter/promotion/check_reply', {
      headers: {
        'Content-Type': 'application/json',
      },
      json: data,
    })
    .json<{ result?: boolean; msg?: string }>();

const fetchBlackList = () =>
  http
    .get('api/data_hunter/twitter/blacklist')
    .json<{ blacklist?: string[] }>();

export {
  fetchBlackList,
  fetchCheckReply,
  fetchCollectionGPT,
  fetchCollectionTweet,
  fetchGenerateXComments,
  fetchSelf,
  fetchSendEvent,
};
