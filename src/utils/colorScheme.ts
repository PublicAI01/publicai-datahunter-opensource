import { useEffect, useState } from 'react';

const useColorScheme = () => {
  const [colorScheme, setColorScheme] = useState<string>();

  useEffect(() => {
    const mo = new MutationObserver(() => {
      const scheme = document.querySelector('html')?.style.colorScheme;

      if (colorScheme !== scheme) {
        setColorScheme(scheme);
      }
    });

    mo.observe(document, {
      attributes: true,
      childList: true,
      subtree: true,
    });

    return () => {
      mo.disconnect();
    };
  }, [colorScheme]);

  return colorScheme;
};

export { useColorScheme };
