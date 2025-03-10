type Tweet = {
  id?: string;
  content?: string;
  timestamp?: number;
  info?: Record<string, string>;
};

type TweetData = {
  user?: { avatar?: string; username?: string; screen_name?: string };
  tweet?: Tweet;
};

type TweetDataWithId = Omit<TweetData, 'tweet'> & {
  tweet: Required<Pick<Tweet, 'id'>> & Partial<Omit<Tweet, 'id'>>;
};

type TweetWithElement = TweetData & { tweetEl?: HTMLElement };

function getTweetUserName(el: Element) {
  const u = el.querySelector<HTMLElement>('[data-testid="User-Name"]');
  if (u) {
    const exec = new RegExp(/(.*?)[\n]?@([A-Za-z0-9_]+)/, 'gs').exec(
      u.innerText,
    );
    return { username: exec?.[1], screen_name: exec?.[2] };
  }
  return {};
}

function getTweetTime(el: Element) {
  const d = el.querySelector<HTMLTimeElement>('time');

  if (d) {
    return Math.floor(new Date(d.dateTime).getTime() / 1000);
  }
  return undefined;
}

function getTweetContent(tweetEl: Element) {
  let content = '';
  for (const el of tweetEl.children) {
    const tagName = el.tagName.toLocaleLowerCase();

    switch (tagName) {
      case 'img': {
        const img = el as HTMLImageElement;

        if (!img.draggable && img.alt && img.src.includes('emoji')) {
          content += img.alt;
        }
        break;
      }

      case 'span': {
        const span = el as HTMLSpanElement;
        content += span.innerText;
        break;
      }
      case 'div': {
        const div = el as HTMLDivElement;
        content += div.innerText;
        break;
      }
      case 'a': {
        const a = el as HTMLElement;
        content += a.innerText.replace(/…$/, '');
        break;
      }
      default:
        break;
    }
  }

  if (content === '') return undefined;
  return content;
}

export { getTweetContent, getTweetTime, getTweetUserName };
export type { TweetData, TweetDataWithId, TweetWithElement };
