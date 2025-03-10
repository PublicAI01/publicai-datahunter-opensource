/** @type {import("prettier").Config} */
export default {
  trailingComma: 'all',
  tabWidth: 2,
  semi: true,
  singleQuote: true,
  bracketSameLine: true,
  singleAttributePerLine: true,
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindFunctions: ['cn'],
};
