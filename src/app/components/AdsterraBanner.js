'use client';

import { useEffect, useRef } from 'react';

export default function AdsterraBanner() {
  const bannerRef = useRef(null);

  useEffect(() => {
    if (bannerRef.current && bannerRef.current.children.length === 0) {
      const adKey = '37e0ca71e4f53a5fb5dc361601e179a9';

      const scriptConfig = document.createElement('script');
      scriptConfig.type = 'text/javascript';
      scriptConfig.text = `
        atOptions = {
          'key': '${adKey}',
          'format': 'iframe',
          'height': 90,
          'width': 728,
          'params': {}
        };
      `;

      const scriptInvoke = document.createElement('script');
      scriptInvoke.type = 'text/javascript';
      scriptInvoke.src = `https://bauval.org/22/${adKey}`;

      bannerRef.current.appendChild(scriptConfig);
      bannerRef.current.appendChild(scriptInvoke);
    }
  }, []);

  return (
    <div className="flex justify-center my-6 overflow-hidden min-h-[90px] w-full">
      <div ref={bannerRef} />
    </div>
  );
}
