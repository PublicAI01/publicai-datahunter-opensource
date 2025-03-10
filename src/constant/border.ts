// https://www.zhangxinxu.com/sp/svgo/

interface BorderWithParams {
  backgroundColor?: 'black' | 'purple';
  alpha?: number;
}

/**
 * ```html
 * <svg width="100%" height="100%" fill="rgba(14, 16, 12, 0.5)">
 *  <rect x="2" y="2" width="100%" height="100%" style="width: calc(100% - 4px);height: calc(100% - 4px);" rx="4" stroke-width="2" stroke="url(#border)" stroke-linecap="round" />
 *  <defs>
 *    <linearGradient id="border" x1="0" y1="0" x2="100%" y2="100%" gradientUnits="userSpaceOnUse">
 *      <stop stop-color="#5708FE"/>
 *      <stop offset="1" stop-color="#999"/>
 *    </linearGradient>
 *  </defs>
 * </svg>
 * ```
 */
const borderWith = (
  params: BorderWithParams | undefined = { backgroundColor: 'black', alpha: 1 },
) => {
  let color = '14, 16, 12';
  switch (params.backgroundColor) {
    case 'purple':
      color = '103, 103, 255';
      break;
    default:
      break;
  }
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='rgba(${color}, ${params.alpha ?? 1})'%3E%3Crect x='2' y='2' width='100%25' height='100%25' style='width:calc(100%25 - 4px);height:calc(100%25 - 4px)' rx='4' stroke-width='2' stroke='url(%23border)' stroke-linecap='round'/%3E%3Cdefs%3E%3ClinearGradient id='border' y2='100%25' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%235708FE'/%3E%3Cstop offset='1' stop-color='%23999'/%3E%3C/linearGradient%3E%3C/defs%3E%3C/svg%3E`;
};

export { borderWith };

export type { BorderWithParams };
