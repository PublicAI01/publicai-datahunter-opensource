import React from 'react';
import ReactDOM from 'react-dom/client';
import browser from 'webextension-polyfill';

// import DataCollectionView from '@/plugins/twitter/components/DataCollectionView';
import GenerateCommentsWidget from '@/plugins/twitter/components/GenerateCommentsWidget';
import { getTweetUserName } from '@/plugins/twitter/utils';

// function addGuideButtonToTweet() {
// 	const all = document.querySelectorAll('[data-testid="tweet"]');

// 	for (const el of all) {
// 		const _el = el as HTMLElement;
// 		if (
// 			// AD Tweet limit
// 			// _el?.parentElement?.getAttribute('data-testid') === 'placementTracking' ||
// 			_el.parentElement?.querySelector('[role="progressbar"]') !== null
// 		) {
// 			/// skip this element
// 			continue;
// 		}
// 		if (_el.dataset.hasPublicAiGuideButton !== 'true') {
// 			_el.dataset.hasPublicAiGuideButton = 'true';
// 			const aEl = _el.querySelector(
// 				'[data-testid="Tweet-User-Avatar"]',
// 			)?.parentElement;
// 			if (aEl) {
// 				const node = aEl.appendChild(document.createElement('public-ai-box'));
// 				const shadow = node.attachShadow({ mode: 'open' });
// 				ReactDOM.createRoot(shadow).render(
// 					<React.StrictMode>
// 						<GuideButton />
// 					</React.StrictMode>,
// 				);
// 			}
// 		}
// 	}
// }

// async function addCollectionDataView() {
// 	const positionEl = document.querySelector<HTMLElement>(
// 		'[role="progressbar"]',
// 	);
// 	const tweetRootEl = positionEl
// 		?.closest('div > [data-testid="inline_reply_offscreen"]')
// 		?.parentElement?.querySelector('article[data-testid="tweet"]');

// 	if (
// 		positionEl &&
// 		positionEl.parentElement &&
// 		tweetRootEl &&
// 		positionEl.dataset.hasPublicAiCollectDataView !== 'true'
// 	) {
// 		positionEl.dataset.hasPublicAiCollectDataView = 'true';
// 		const node = positionEl.parentElement.insertBefore(
// 			document.createElement('public-ai-box'),
// 			positionEl.nextElementSibling,
// 		);
// 		const shadow = node.attachShadow({ mode: 'open' });
// 		const { access } = await browser.storage.local.get('access');
// 		ReactDOM.createRoot(shadow).render(
// 			<React.StrictMode>
// 				<DataCollectionView hasAccount={Boolean(access)} />
// 			</React.StrictMode>,
// 		);
// 	}
// }

function getTweetAuthorId(positionEl: HTMLDivElement) {
  let ancestorDiv = positionEl.closest('div');
  while (ancestorDiv) {
    if (ancestorDiv.querySelector('[role="progressbar"]')) {
      break;
    }
    ancestorDiv = ancestorDiv.parentElement?.closest('div') ?? null;
  }
  if (ancestorDiv) {
    const id = positionEl.baseURI.match(/status\/(\d+)/)?.at(1);
    if (id) {
      const tweetRootEl = document
        .querySelector('[role="progressbar"]')
        ?.closest('div > [data-testid="inline_reply_offscreen"]')
        ?.parentElement?.querySelector('article[data-testid="tweet"]');
      if (!tweetRootEl) return;
      return getTweetUserName(tweetRootEl).screen_name;
    } else {
      return getTweetUserName(ancestorDiv).screen_name;
    }
  }
}

async function addGenerateCommentsWidget() {
  const toolBarEl = document.querySelector<HTMLDivElement>(
    '[data-testid="toolBar"]',
  );
  const positionEl =
    toolBarEl?.querySelector<HTMLDivElement>('[role="tablist"]');
  const label = document
    .querySelector<HTMLAnchorElement>('[data-testid="SideNav_NewTweet_Button"]')
    ?.getAttribute('aria-label');
  const submitButtonEl = toolBarEl?.querySelector<HTMLButtonElement>(
    '[data-testid*="tweetButton"]',
  );
  const buttonLabel = submitButtonEl?.innerText;

  const authorId = positionEl ? getTweetAuthorId(positionEl) : undefined;
  if (!authorId) return;

  const { access, x_blacklist } = await browser.storage.local.get([
    'access',
    'x_blacklist',
  ]);
  const isBlackListed =
    Array.isArray(x_blacklist) &&
    x_blacklist.includes(authorId.toLocaleLowerCase());

  if (
    !isBlackListed &&
    positionEl &&
    submitButtonEl &&
    submitButtonEl.parentElement &&
    buttonLabel !== label &&
    submitButtonEl.parentElement.dataset.hasPublicAiGenerateCommentsWidget !==
      'true'
  ) {
    submitButtonEl.parentElement.dataset.hasPublicAiGenerateCommentsWidget =
      'true';
    const node = submitButtonEl.parentElement.insertBefore(
      document.createElement('public-ai-box'),
      submitButtonEl,
    );
    const shadow = node.attachShadow({ mode: 'open' });
    ReactDOM.createRoot(shadow).render(
      <React.StrictMode>
        <GenerateCommentsWidget
          currentRef={positionEl}
          hasAccount={Boolean(access)}
        />
      </React.StrictMode>,
    );
  }
}

function init() {
  const mo = new MutationObserver(() => {
    // addGuideButtonToTweet();
    // void addCollectionDataView();
    void addGenerateCommentsWidget();
  });

  mo.observe(document.body, {
    attributes: true,
    childList: true,
    subtree: true,
  });
}

init();
