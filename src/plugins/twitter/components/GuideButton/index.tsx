import LogoSmall from '@/assets/logo-small.svg?react';
import Send from '@/assets/send.svg?react';
import style from '@/plugins/twitter/components/GuideButton/style.css?inline';

/**
 * @deprecated unused.
 */
export default function GuideButton() {
  return (
    <>
      <style>{style}</style>
      <button>
        <Send className="icon" />
        <span>Data Hunter</span>
        <LogoSmall className="logo" />
      </button>
    </>
  );
}
