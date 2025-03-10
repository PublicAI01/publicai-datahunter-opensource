// import DataCollectionView from '@/plugins/gpt/components/DataCollectionView';

// async function addCollectionDataView() {
// 	const conversationEl = document.querySelector<HTMLElement>(
// 		'[data-testid*="conversation-turn"]',
// 	);
// 	const positionEl = document.querySelector<HTMLElement>(
// 		'[role="presentation"] form[type="button"] .group',
// 	)?.parentElement;

// 	const id = document.location.pathname.replace(/^\/c\//, '');

// 	if (
// 		conversationEl &&
// 		positionEl &&
// 		positionEl.dataset.hasPublicAiCollectDataView !== 'true'
// 	) {
// 		positionEl.dataset.hasPublicAiCollectDataView = 'true';

// 		const node = document.createElement('public-ai-box');

// 		const absoluteEl = positionEl.querySelector<HTMLElement>(
// 			'.absolute.bottom-full',
// 		);
// 		(absoluteEl ?? positionEl).appendChild(node);

// 		const shadow = node.attachShadow({ mode: 'open' });
// 		const { access } = await browser.storage.local.get('access');
// 		const root = ReactDOM.createRoot(shadow);
// 		root.render(
// 			<React.StrictMode>
// 				<DataCollectionView
// 					needAbsolute={absoluteEl === null}
// 					hasAccount={Boolean(access)}
// 					id={id}
// 					unmount={() => {
// 						root.unmount();
// 						positionEl.dataset.hasPublicAiCollectDataView = 'false';
// 					}}
// 				/>
// 			</React.StrictMode>,
// 		);
// 	}
// }

function init() {
  // const mo = new MutationObserver(() => {
  // 	void addCollectionDataView();
  // });
  // mo.observe(document.body, {
  // 	attributes: true,
  // 	childList: true,
  // 	subtree: true,
  // });
}

init();
